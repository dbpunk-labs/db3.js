//
// storage_provider.ts
// Copyright (C) 2023 db3.network Author imotai <codego.me@gmail.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @ts-nocheck
import {
    GrpcWebFetchTransport,
    GrpcWebOptions,
} from '@protobuf-ts/grpcweb-transport'
import { StorageNodeClient } from '../proto/db3_node.client'
import { WriteRequest, PayloadType } from '../proto/db3_mutation'
import {
    OpenSessionRequest,
    BroadcastRequest,
    GetAccountRequest,
    RunQueryRequest,
    CloseSessionRequest,
    ShowDatabaseRequest,
    GetDocumentRequest,
} from '../proto/db3_node'
import {
    CloseSessionPayload,
    QuerySessionInfo,
    OpenSessionPayload,
} from '../proto/db3_session'
import { StructuredQuery } from '../proto/db3_database'
import { TxId } from '../crypto/id'
import { Wallet } from '../wallet/wallet'
import { fromHEX } from '../crypto/crypto_utils'

//
// the db3 storage node provider implementation which provides low level methods to exchange with db3 network
//
export class StorageProvider {
    readonly client: StorageNodeClient
    readonly wallet: Wallet
    /**
     * new a storage provider with db3 storage grpc url
     */
    constructor(url: string, wallet: Wallet) {
        const goptions: GrpcWebOptions = {
            baseUrl: url,
            // simple example for how to add auth headers to each request
            // see `RpcInterceptor` for documentation
            interceptors: [],
            // you can set global request headers here
            meta: {},
        }
        const transport = new GrpcWebFetchTransport(goptions)
        this.client = new StorageNodeClient(transport)
        this.wallet = wallet
    }

    /**
     * send mutation to db3 network
     */
    async sendMutation(mutation: Uint8Array, payloadType: PayloadType) {
        const signature = await this.wallet.sign(mutation)
        const writeRequest: WriteRequest = {
            payload: mutation,
            signature: signature,
            payloadType: payloadType,
        }
        const broadcastRequest: BroadcastRequest = {
            body: WriteRequest.toBinary(writeRequest),
        }
        const { response } = await this.client.broadcast(broadcastRequest)
        return new TxId(response.hash)
    }

    // @ts-nocheck
    /**
     * build a session with storage node for querying data
     */
    async openSession() {
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
        const payload: OpenSessionPayload = {
            header: header.toString(),
            startTime: Math.floor(Date.now() / 1000),
        }
        const payloadBinary = OpenSessionPayload.toBinary(payload)
        const signature = await this.wallet.sign(payloadBinary)
        const sessionRequest: OpenSessionRequest = {
            payload: payloadBinary,
            signature: signature,
        }
        const { response } = await this.client.openQuerySession(sessionRequest)
        return response
    }

    /**
     * close the session from storage node
     *
     */
    async closeSession(token: string, sessionInfo: QuerySessionInfo) {
        const payload: CloseSessionPayload = {
            sessionInfo: sessionInfo,
            sessionToken: token,
        }
        const payloadU8 = CloseSessionPayload.toBinary(payload)
        const signature = await this.wallet.sign(payloadU8)
        const closeQuerySessionRequest: CloseSessionRequest = {
            payload: payloadU8,
            signature: signature,
        }
        const { response } = await this.client.closeQuerySession(
            closeQuerySessionRequest
        )
        return response
    }

    /**
     * get the account information with db3 address
     *
     */
    async getAccount(addr: Uint8Array) {
        const getAccountRequest: GetAccountRequest = {
            addr,
        }
        const { response } = await this.client.getAccount(getAccountRequest)
        return response
    }

    async getDatabase(address: string, token: string) {
        const request: ShowDatabaseRequest = {
            sessionToken: token,
            address,
        }
        const { response } = await this.client.showDatabase(request)
        return response
    }

    getNonce(): number {
        //TODO get nonce from remote with account address
        return Date.now()
    }

    async runQuery(token: string, addr: string, query: StructuredQuery) {
        const request: RunQueryRequest = {
            sessionToken: token,
            address: addr,
            query,
        }
        const { response } = await this.client.runQuery(request)
        return response
    }

    async getDocument(token: string, id: string) {
        const request: GetDocumentRequest = {
            sessionToken: token,
            id,
        }
        const { response } = await this.client.getDoument(request)
        return response
    }
}
