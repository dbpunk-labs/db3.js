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

import {
    GrpcWebFetchTransport,
    GrpcWebOptions,
} from '@protobuf-ts/grpcweb-transport'
import { StorageNodeClient } from '../proto/db3_storage.client'
import { PayloadType } from '../proto/db3_mutation_v2'
import { SendMutationRequest, GetNonceRequest } from '../proto/db3_storage'
import { Wallet } from '../wallet/wallet'
import { fromHEX, toHEX } from '../crypto/crypto_utils'

export class StorageProviderV2 {
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

    private async wrapTypedRequest(
        mutation: Uint8Array,
        payloadType: PayloadType,
        nonce: string
    ) {
        const hexMutation = toHEX(mutation)
        const message = {
            types: {
                EIP712Domain: [],
                Message: [
                    { name: 'payload', type: 'bytes' },
                    { name: 'payloadType', type: 'string' },
                    { name: 'nonce', type: 'string' },
                ],
            },
            domain: {},
            primaryType: 'Message',
            message: {
                payload: '0x' + hexMutation,
                payloadType: payloadType.toString(),
                nonce: nonce,
            },
        }
        const signature = await this.wallet.sign(message)
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
            address: this.wallet.getEvmAddress(),
        }
        const { response } = await this.client.getNonce(request)
        return response.nonce
    }

    /**
     * send mutation to db3 network
     */
    async sendMutation(
        mutation: Uint8Array,
        payloadType: PayloadType,
        nonce: string
    ) {
        const request = await this.wrapTypedRequest(
            mutation,
            payloadType,
            nonce
        )
        const { response } = await this.client.sendMutation(request)
        return response
    }
}
