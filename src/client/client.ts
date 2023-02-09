//
// client.ts
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

import { BSON } from 'bson'
import {
    PayloadType,
    DatabaseMutation,
    DatabaseAction,
    CollectionMutation,
    DocumentMutation,
} from '../proto/db3_mutation'
import { BroadcastMeta, ChainId, ChainRole } from '../proto/db3_base'
import { StorageProvider } from '../provider/storage_provider'
import { Wallet } from '../wallet/wallet'
import { DbId } from '../crypto/id'

//
//
// the db3 client for developers
//
//
export class DB3Client {
    /**
     * new a db3 client with db3 node url and wallet
     *
     */
    constructor(url: string, wallet: Wallet) {
        this.provider = new StorageProvider(url, wallet)
        this.accountAddress = wallet.getAddress()
    }

    async createDatabase(): Promise<[string, string]> {
        const meta: BroadcastMeta = {
            nonce: this.provider.getNonce().toString(),
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
        const txId = await this.provider.sendMutation(
            payload,
            PayloadType.DatabasePayload
        )
        const dbId = new DbId(this.accountAddress, +meta.nonce)
        return [dbId.getHexAddr(), txId.getB64()]
    }

    async getDatabase(addr: string) {
        const token = await this.keepSessionAlive()
        const response = await this.provider.getDatabase(addr, token)
        this.querySessionInfo!.queryCount += 1
        return response
    }

    async keepSessionAlive() {
        if (!this.querySessionInfo) {
            const response = await this.provider.openSession()
            this.sessionToken = response.sessionToken
            this.querySessionInfo = response.querySessionInfo
            return this.sessionToken
        }
        // TODO
        if (this.querySessionInfo!.queryCount > 1000) {
            await this.provider.closeSession()
            const response = await this.provider.openSession()
            this.sessionToken = response.sessionToken
            this.querySessionInfo = response.querySessionInfo
            return this.sessionToken
        }
        return this.sessionToken
    }
}
