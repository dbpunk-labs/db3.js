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

import {
    GrpcWebFetchTransport,
    GrpcWebOptions,
} from '@protobuf-ts/grpcweb-transport'
import { StorageNodeClient } from '../provider/db3_node.client'
import { WriteRequest } from '../proto/db3_mutation'
import { TxId } from '../crypto/id'

//
// the db3 storage node provider implementation which provides low level methods to exchange with db3 network
//
export class StorageProvider {
    /**
     * new a storage provider with db3 storage grpc url
     */
    constructor(url: string) {
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
    }

    /**
     * send write request to db3 network
     */
    async sendRequest(request: WriteRequest): TxId {
        const broadcastRequest: BroadcastRequest = {
            body: WriteRequest.toBinary(writeRequest),
        }
        const { response } = await this.client.broadcast(broadcastRequest)
        return TxId.from(response.hash)
    }
}
