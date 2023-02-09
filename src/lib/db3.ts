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
    DocumentMutation,
} from '../proto/db3_mutation'
import { BroadcastMeta } from '../proto/db3_base'
import { ChainId, ChainRole } from '../proto/db3_base'
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
    ListDocumentsRequest,
} from '../proto/db3_node'
import { Database, Index } from '../proto/db3_database'
import {
    CloseSessionPayload,
    QuerySessionInfo,
    OpenSessionPayload,
} from '../proto/db3_session'
import {
    GrpcWebFetchTransport,
    GrpcWebOptions,
} from '@protobuf-ts/grpcweb-transport'
import { StorageNodeClient } from '../proto/db3_node.client'
import { fromHEX, toHEX } from '../crypto/crypto_utils'
import sha3 from 'js-sha3'
import { DbId } from '../crypto/id'

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
            documentMutations: [],
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
        const dbId = new DbId(this.accountAddress, +meta.nonce)

        return [dbId.getHexAddr(), response.hash.toString()]
    }

    async getDB(address: string) {
        const token = await this.keepSession()
        const request: ShowDatabaseRequest = {
            sessionToken: token!,
            address,
        }
        const { response } = await this.client.showDatabase(request)
        this.querySessionInfo!.queryCount += 1
        return response
    }

    async createCollection(db_address: string, name: string, index: Index[]) {
        const meta: BroadcastMeta = {
            nonce: this.nonce(),
            chainId: ChainId.MainNet,
            chainRole: ChainRole.StorageShardChain,
        }
        const collection: CollectionMutation = {
            index,
            collectionName: name,
        }
        const dm: DatabaseMutation = {
            meta,
            collectionMutations: [collection],
            documentMutations: [],
            dbAddress: fromHEX(db_address),
            action: DatabaseAction.AddCollection,
        }
        const payload = DatabaseMutation.toBinary(dm)
        const [signature] = await this.sign(payload)
        const writeRequest: WriteRequest = {
            payload,
            signature,
            payloadType: PayloadType.DatabasePayload,
        }
        const broadcastRequest: BroadcastRequest = {
            body: WriteRequest.toBinary(writeRequest),
        }
        const { response } = await this.client.broadcast(broadcastRequest)
        return response.hash
    }

    async getCollection(dbAddress: string) {
        const { db } = await this.getDB(dbAddress)
        return db?.collections
    }

    async createDoc(
        dbAddress: string,
        collectionName: string,
        document: Record<string, any>
    ) {
        const documentMutation: DocumentMutation = {
            collectionName,
            document: [BSON.serialize(document)],
        }
        const meta: BroadcastMeta = {
            nonce: this.nonce(),
            chainId: ChainId.MainNet,
            chainRole: ChainRole.StorageShardChain,
        }
        const dm: DatabaseMutation = {
            meta,
            collectionMutations: [],
            documentMutations: [documentMutation],
            dbAddress: fromHEX(dbAddress),
            action: DatabaseAction.AddDocument,
        }
        const payload = DatabaseMutation.toBinary(dm)
        const [signature] = await this.sign(payload)
        const writeRequest: WriteRequest = {
            payload,
            signature,
            payloadType: PayloadType.DatabasePayload,
        }
        const broadcastRequest: BroadcastRequest = {
            body: WriteRequest.toBinary(writeRequest),
        }
        const { response } = await this.client.broadcast(broadcastRequest)
        return response.hash
    }

    async getDoc(dbAddress: string, collectionName: string) {
        const token = await this.keepSession()
        const request: ListDocumentsRequest = {
            sessionToken: token!,
            address: dbAddress,
            collectionName,
        }
        const { response } = await this.client.listDocuments(request)
        this.querySessionInfo!.queryCount += 1
        return response.documents.map((item) => ({
            ...item,
            doc: BSON.deserialize(item.doc),
        }))
    }
}
