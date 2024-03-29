//
// storage_provider_v2.ts
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
//@ts-nocheck
import {
    GrpcWebFetchTransport,
    GrpcWebOptions,
} from '@protobuf-ts/grpcweb-transport'
import { StorageNodeClient } from '../proto/db3_storage.client'
import { MutationBody, Mutation } from '../proto/db3_mutation_v2'
import {
    SendMutationRequest,
    GetNonceRequest,
    GetMutationHeaderRequest,
    GetMutationBodyRequest,
    ScanMutationHeaderRequest,
    ScanRollupRecordRequest,
    GetDatabaseOfOwnerRequest,
    GetCollectionOfDatabase,
    ScanGcRecordRequest,
    GetSystemStatusRequest,
    SetupRequest,
    GetDatabaseRequest,
} from '../proto/db3_storage'
import { fromHEX, toHEX } from '../crypto/crypto_utils'
import { DB3Account } from '../account/types'
import { signTypedData } from '../account/db3_account'

export class StorageProviderV2 {
    readonly client: StorageNodeClient
    readonly account: DB3Account
    /**
     * new a storage provider with db3 storage grpc url
     */
    constructor(url: string, account: DB3Account) {
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
        this.account = account
    }

    private async wrapTypedRequest(mutation: Uint8Array, nonce: string) {
        const hexMutation = toHEX(mutation)
        const message = {
            types: {
                EIP712Domain: [],
                Message: [
                    { name: 'payload', type: 'bytes' },
                    { name: 'nonce', type: 'string' },
                ],
            },
            domain: {},
            primaryType: 'Message',
            message: {
                payload: '0x' + hexMutation,
                nonce: nonce,
            },
        }
        const signature = await signTypedData(this.account, message)
        const msgParams = JSON.stringify(message)
        const binaryMsg = new TextEncoder().encode(msgParams)
        const request: SendMutationRequest = {
            payload: binaryMsg,
            signature: signature,
        }
        return request
    }

    async getNonce() {
        const request: GetNonceRequest = {
            address: this.account.address,
        }
        const { response } = await this.client.getNonce(request)
        return response.nonce
    }

    /**
     * send mutation to db3 network
     */
    async sendMutation(mutation: Uint8Array, nonce: string) {
        const request = await this.wrapTypedRequest(mutation, nonce)
        const { response } = await this.client.sendMutation(request)
        return response
    }

    async getMutationHeader(block: string, order: number) {
        const request: GetMutationHeaderRequest = {
            blockId: block,
            orderId: order,
        }
        const { response } = await this.client.getMutationHeader(request)
        return response
    }

    async getMutationBody(id: string) {
        const request: GetMutationBodyRequest = {
            id,
        }
        const { response } = await this.client.getMutationBody(request)
        return response
    }

    async scanMutationHeaders(start: number, limit: number) {
        const request: ScanMutationHeaderRequest = {
            start,
            limit,
        }
        const { response } = await this.client.scanMutationHeader(request)
        return response
    }

    async scanRollupRecords(start: number, limit: number) {
        const request: ScanRollupRecordRequest = {
            start,
            limit,
        }
        const { response } = await this.client.scanRollupRecord(request)
        return response
    }

    async scanGcRecords(start: number, limit: number) {
        const request: ScanGcRecordRequest = {
            start,
            limit,
        }
        const { response } = await this.client.scanGcRecord(request)
        return response
    }

    async getDatabaseOfOwner(owner: string) {
        const request: GetDatabaseOfOwnerRequest = {
            owner,
        }
        const { response } = await this.client.getDatabaseOfOwner(request)
        return response
    }

    async getCollectionOfDatabase(db: string) {
        const request: GetCollectionOfDatabaseRequest = {
            dbAddr: db,
        }

        const { response } = await this.client.getCollectionOfDatabase(request)
        return response
    }

    async setup(
        network: string,
        rollupInterval: string,
        minRollupSize: string
    ) {
        const message = {
            types: {
                EIP712Domain: [],
                Message: [
                    { name: 'rollupInterval', type: 'string' },
                    { name: 'minRollupSize', type: 'string' },
                    { name: 'network', type: 'string' },
                ],
            },
            domain: {},
            primaryType: 'Message',
            message: {
                rollupInterval,
                minRollupSize,
                network,
            },
        }
        const signature = await signTypedData(this.account, message)
        const msgParams = JSON.stringify(message)
        const payload = new TextEncoder().encode(msgParams)
        const request: SetupRequest = {
            payload,
            signature,
        }
        const { response } = await this.client.setup(request)
        return response
    }

    async getSystemStatus() {
        const request: GetSystemStatusRequest = {}
        const { response } = await this.client.getSystemStatus(request)
        return response
    }

    async getDatabase(addr: string) {
        const request: GetDatabaseRequest = {
            addr,
        }
        const { response } = await this.client.getDatabase(request)
        return response
    }

    parseMutationBody(body: MutationBody) {
        const typedMsg = new TextDecoder().decode(body.payload)
        const typedData = JSON.parse(typedMsg)
        const data = fromHEX(typedData['message']['payload'])
        const m = Mutation.fromBinary(data)
        return [typedData, m, body.signature]
    }
}
