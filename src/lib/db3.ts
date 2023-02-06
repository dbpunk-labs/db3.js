/**
 * Copyright 2023 db3 network
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// TODO: fix typescript errors
import { BSON } from 'bson'
import {
    WriteRequest,
    PayloadType,
    KVPair,
    Mutation,
    MutationAction,
    DatabaseMutation,
    DatabaseAction,
    CollectionMutation,
} from '../pkg/db3_mutation'
import { BroadcastMeta } from '../pkg/db3_base'
import { ChainId, ChainRole } from '../pkg/db3_base'
import {
    GetRangeRequest,
    RangeKey,
    Range,
    CloseSessionRequest,
    BatchGetKey,
    GetKeyRequest,
    BroadcastRequest,
    ShowDatabaseRequest,
    OpenSessionRequest,
    GetAccountRequest,
} from '../pkg/db3_node'
import { Database } from '../pkg/db3_database'
import {
    CloseSessionPayload,
    QuerySessionInfo,
    OpenSessionPayload,
} from '../pkg/db3_session'
import {
    GrpcWebFetchTransport,
    GrpcWebOptions,
} from '@protobuf-ts/grpcweb-transport'
import { StorageNodeClient } from '../pkg/db3_node.client'
import { toHEX } from '../crypto/crypto_utils'
import sha3 from 'js-sha3'

export interface KvMutation {
    ns: string
    gasLimit: number
    data: Record<string, any>
}

export interface DbSimpleDesc {
    name: string
    desc: string
    erc20Token: string
    price: number
    queryCount: number
}

export interface BatchGetKeyRequest {
    ns: string
    keyList: string[] | Uint8Array[]
}

export interface QuerySession {
    sessionInfo: QuerySessionInfo
    sessionToken: string
}
export interface DB3_Options {
    accountAddress: string
    sign(target: Uint8Array): Promise<[Uint8Array, Uint8Array]>
    nonce(): string
}

function encodeUint8Array(text: string) {
    return new TextEncoder().encode(text)
}

function uint8ToBase64(arr: Uint8Array) {
    return btoa(
        Array(arr.length)
            .fill('')
            .map((_, i) => String.fromCharCode(arr[i]))
            .join('')
    )
}
const DB3_ADDRESS_LENGTH = 20

function getDBID(accountAddress: string, nonce: string) {
    let hasher = sha3.sha3_256.update(nonce).update(accountAddress)
    const g_arr = hasher.arrayBuffer()
    const u8 = new Uint8Array(g_arr)
    return toHEX(u8.slice(0, DB3_ADDRESS_LENGTH))
}
export class DB3 {
    private client: StorageNodeClient
    private accountAddress: string
    private sign: (target: Uint8Array) => Promise<[Uint8Array, Uint8Array]>
    private nonce: () => string
    public sessionToken?: string
    private querySessionInfo?: QuerySessionInfo
    constructor(node: string, options: DB3_Options) {
        const goptions: GrpcWebOptions = {
            baseUrl: node,
            // simple example for how to add auth headers to each request
            // see `RpcInterceptor` for documentation
            interceptors: [],
            // you can set global request headers here
            meta: {},
        }
        this.accountAddress = options.accountAddress
        this.sign = options.sign
        this.nonce = options.nonce
        const transport = new GrpcWebFetchTransport(goptions)
        this.client = new StorageNodeClient(transport)
        // if (window.db3Js) {
        //     this.sign = async function (data: Uint8Array) {
        //         const _sing = await options.sign()
        //         return await _sing(data)
        //     }
        // } else {
        //     this.sign = options.sign
        // }
    }
    async keepSession() {
        if (!this.querySessionInfo) {
            // try to open session
            await this.openQuerySession()
        }
        if (this.querySessionInfo!.queryCount > 1000) {
            await this.closeQuerySession()
            await this.openQuerySession()
        }
        return this.sessionToken
    }

    async openQuerySession() {
        if (this.querySessionInfo) {
            return {}
        }
        let header
        if (typeof window === 'undefined') {
            header =
                new Date().getTime() +
                '' +
                '_Header_' +
                Math.floor(Math.random() * 1000)
        } else {
            header = window.crypto.getRandomValues(new Uint8Array(32))
        }

        const openSessionPayload: OpenSessionPayload = {
            header: header.toString(),
            startTime: Math.floor(Date.now() / 1000).toString(),
        }

        const payload = OpenSessionPayload.toBinary(openSessionPayload)
        const [signature] = await this.sign(payload)
        const sessionRequest: OpenSessionRequest = {
            payload,
            signature: signature,
        }
        const { response } = await this.client.openQuerySession(sessionRequest)
        this.sessionToken = response.sessionToken
        this.querySessionInfo = response.querySessionInfo
        return response
    }

    async closeQuerySession() {
        if (!this.sessionToken) {
            throw new Error('SessionToken is not defined')
        }
        const closeSessionPayload: CloseSessionPayload = {
            sessionInfo: this.querySessionInfo,
            sessionToken: this.sessionToken,
        }

        const payload = CloseSessionPayload.toBinary(closeSessionPayload)
        const [signature] = await this.sign(payload)
        const closeQuerySessionRequest: CloseSessionRequest = {
            payload,
            signature: signature,
        }

        const { response } = await this.client.closeQuerySession(
            closeQuerySessionRequest
        )
        this.querySessionInfo = undefined
        this.sessionToken = undefined
        return response
    }

    async createDB(): Promise<[string, string]> {
        const meta: BroadcastMeta = {
            nonce: this.nonce(),
            chainId: ChainId.MainNet,
            chainRole: ChainRole.StorageShardChain,
        }
        const dm: DatabaseMutation = {
            meta,
            collectionMutations: [],
            dbAddress: new Uint8Array(),
            action: DatabaseAction.CreateDB,
        }
        const payload = DatabaseMutation.toBinary(dm)
        const [signature, pk] = await this.sign(payload)
        const writeRequest: WriteRequest = {
            payload,
            signature: signature,
            payloadType: PayloadType.DatabasePayload,
        }
        const broadcastRequest: BroadcastRequest = {
            body: WriteRequest.toBinary(writeRequest),
        }
        const { response } = await this.client.broadcast(broadcastRequest)
        const dbId = getDBID(this.accountAddress, meta.nonce)

        return [`0x${dbId}`, response.hash.toString()]
    }

    async getDB(address: string) {
        const token = await this.keepSession()
        const request: ShowDatabaseRequest = {
            sessionToken: token!,
            address,
        }
        const { response } = await this.client.showDatabase(request)
        const count = this.querySessionInfo!.queryCount + 1
        this.querySessionInfo!.queryCount = count
        return response
    }

    async createCollection(name: string, db_address: string) {
        const meta: BroadcastMeta = {
            nonce: this.nonce(),
            chainId: ChainId.MainNet,
            chainRole: ChainRole.StorageShardChain,
        }
        const collection: CollectionMutation = {
            index: [],
            collectionId: name,
        }
        const dm: DatabaseMutation = {
            meta,
            collectionMutations: [collection],
            dbAddress: encodeUint8Array(db_address),
            action: DatabaseAction.CreateDB,
        }
        const payload = DatabaseMutation.toBinary(dm)
        const [signature] = await this.sign(payload)
        const writeRequest: WriteRequest = {
            payload,
            signature: signature,
            payloadType: PayloadType.MutationPayload,
        }
        const broadcastRequest: BroadcastRequest = {
            body: BSON.serialize(writeRequest),
        }
        const { response } = await this.client.broadcast(broadcastRequest)
        return response.hash
    }
}
