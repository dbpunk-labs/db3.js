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

import { Mutation, MutationAction } from '../src/proto/db3_mutation_v2'

import { ChainId, ChainRole, BroadcastMeta } from '../src/proto/db3_base'
import { Secp256k1Keypair } from '../src/crypto/secp256k1_keypair'
import { Secp256k1PublicKey } from '../src/crypto/secp256k1_publickey'
import {
    StorageProvider,
    StorageProviderOptions,
} from '../src/provider/storage_provider'

import { StorageProviderV2 } from '../src/provider/storage_provider_v2'

import { DB3BrowserWallet } from '../src/wallet/db3_browser_wallet'
import { toB64, fromB64 } from '../src/crypto/crypto_utils'
import { DB3Account } from '../src/account/db3_account'

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
            dbDesc: '',
        }
        const payload = DatabaseMutation.toBinary(dm)
        const signature = wallet.sign(payload)
        const txId = await provider.sendMutation(
            payload,
            PayloadType.DatabasePayload
        )
        expect(txId.getB64()).toBe(
            'HzyHbZjgfdCcZUW8KERvjQAsjyDTGjt7TLTlhU4wwWE='
        )
        localStorage.clear()
    })

    test('provider send mutation test secp256k1', async () => {
        const mnemonic =
            'result crisp session latin must fruit genuine question prevent start coconut brave speak student dismiss'
        const wallet = DB3BrowserWallet.createNew(mnemonic, 'DB3_SECP256K1')
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
            dbDesc: '',
        }
        const payload = DatabaseMutation.toBinary(dm)
        const signature = wallet.sign(payload)
        const txId = await provider.sendMutation(
            payload,
            PayloadType.DatabasePayload
        )
        expect(txId.getB64()).toBe(
            'uWECy6GSliva8MJv1F6yg0Qu9nZPjxFPMgIsmejjWiE='
        )
        localStorage.clear()
    })
    test('provider send mutation test', async () => {
        const privateKey =
            '0xad689d9b7751da07b0fb39c5091672cbfe50f59131db015f8a0e76c9790a6fcc'
        const db3_account = DB3Account.createFromPrivateKey(privateKey)
        expect(db3_account.getAddress()).toBe(
            '0xc793b74C568a3953a82C150FDcD0F7D27b60f8Ba'
        )
        const provider = new StorageProviderV2(
            'http://127.0.0.1:26619',
            db3_account
        )
        const dm: Mutation = {
            collectionMutations: [],
            documentMutations: [],
            dbAddress: new Uint8Array(),
            action: MutationAction.CreateDocumentDB,
            dbDesc: '',
        }
        const nonce = await provider.getNonce()
        const payload = Mutation.toBinary(dm)
        const response = await provider.sendMutation(payload, nonce)
        expect(response.id).toBe(
            '0xaf2a873a6b5b1e75c34dcc941c0a638a785069862d07799c1b2ed358b690d238'
        )
        const response2 = await provider.sendMutation(payload, '1')
        expect(response2.code).toBe(1)
    })
})
