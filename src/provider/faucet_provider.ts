//
// faucet_provider.ts
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
    TypedDataUtils,
    TypedMessage,
    MessageTypes,
    SignTypedDataVersion,
} from '@metamask/eth-sig-util'

import {
    GrpcWebFetchTransport,
    GrpcWebOptions,
} from '@protobuf-ts/grpcweb-transport'
import { FaucetNodeClient } from '../proto/db3_faucet.client'
import { FaucetRequest, GetFaucetStateRequest } from '../proto/db3_faucet'
import {fromHEX} from '../crypto/crypto_utils'



interface Window {
    ethereum: any
}

export class FaucetProvider {
    private readonly client: FaucetNodeClient
    private readonly window: Window
    private addr: string
    /**
     * new a faucet provider with db3 storage grpc url
     */
    constructor(url: string, window: Window) {
        const goptions: GrpcWebOptions = {
            baseUrl: url,
            // simple example for how to add auth headers to each request
            // see `RpcInterceptor` for documentation
            interceptors: [],
            // you can set global request headers here
            meta: {},
        }
        const transport = new GrpcWebFetchTransport(goptions)
        this.client = new FaucetNodeClient(transport)
        this.window = window
        this.addr = ''
    }

    async connect() {
        if (this.addr.length == 0) {
            const response = await this.window.ethereum.request({
                method: 'eth_requestAccounts',
            })
            this.addr = response[0]
        }
    }

    private async wrapTypedFaucetRequest() {
        const message = {
            types: {
                EIP712Domain: [],
                Message: [{ name: 'payload', type: 'string' }],
            },
            domain: {},
            primaryType: 'Message',
            message: {
                payload: 'db3 network faucet',
            },
        }
        const msgParams = JSON.stringify(message)
        const from = this.addr
        const sig = await this.window.ethereum.request({
            method: 'eth_signTypedData_v3',
            params: [from, msgParams],
        })
        const hashedmsg = TypedDataUtils.eip712Hash(
            message as TypedMessage<MessageTypes>,
            SignTypedDataVersion.V3
        )
        const request: FaucetRequest = {
            hash: hashedmsg,
            signature: fromHEX(sig)
        }
        return request
    }

    async faucet() {
        const request = await this.wrapTypedFaucetRequest()
        const call = await this.client.faucet(request)
        if (call.status.code === 'OK') {
            return [true, 'OK']
        }else {
            return [false, 'Error']
        }
    }

    async getState() {
        const request: GetFaucetStateRequest = {}
        const call = await this.client.getFaucetState(request)
        return call.response
    }
}
