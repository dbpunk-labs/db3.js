//
// provider.test.ts
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

import { describe, expect, test } from '@jest/globals'
import {
    PayloadType,
    DatabaseMutation,
    DatabaseAction,
} from '../src/proto/db3_mutation'
import { ChainId, ChainRole, BroadcastMeta } from '../src/proto/db3_base'
import { Secp256k1Keypair } from '../src/crypto/secp256k1_keypair'
import { Secp256k1PublicKey } from '../src/crypto/secp256k1_publickey'
import {
    StorageProvider,
    StorageProviderOptions,
} from '../src/provider/storage_provider'
import { DB3BrowserWallet } from '../src/wallet/db3_browser_wallet'
import { toB64, fromB64 } from '../src/crypto/crypto_utils'
class LocalStorageMock {
    constructor() {
        this.store = {}
    }

    clear() {
        this.store = {}
    }

    getItem(key) {
        return this.store[key] || null
    }

    setItem(key, value) {
        this.store[key] = String(value)
    }

    removeItem(key) {
        delete this.store[key]
    }
}

global.localStorage = new LocalStorageMock()

describe('test db3.js provider module', () => {
    function nonce() {
        return Date.now().toString()
    }
    test('provider send mutation test ed26619', async () => {
        const mnemonic =
            'result crisp session latin must fruit genuine question prevent start coconut brave speak student dismiss'
        const wallet = DB3BrowserWallet.createNew(mnemonic, 'DB3_ED25519')
        const provider = new StorageProvider('http://127.0.0.1:26659', wallet)
        const meta: BroadcastMeta = {
            nonce: '9527',
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
        const signature = wallet.sign(payload)
        const txId = await provider.sendMutation(
            payload,
            PayloadType.DatabasePayload
        )
        expect(txId.getB64()).toBe(
            'MiuDkHefVUg0AyHQtuq76QwBcraNwNoqbl1QL3Wj78U='
        )
        localStorage.clear()
    })

    test('provider send mutation test secp256k1', async () => {
        const mnemonic =
            'result crisp session latin must fruit genuine question prevent start coconut brave speak student dismiss'
        const wallet = DB3BrowserWallet.createNew(mnemonic, 'DB3_SECP259K1')
        const provider = new StorageProvider('http://127.0.0.1:26659', wallet)
        const meta: BroadcastMeta = {
            nonce: '9527',
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
        const signature = wallet.sign(payload)
        const txId = await provider.sendMutation(
            payload,
            PayloadType.DatabasePayload
        )
        expect(txId.getB64()).toBe(
            'zHkR2KQa9y6n31PjezDTrfi+McVMGQKE9ocMFMsXIJE='
        )
        localStorage.clear()
    })
})
