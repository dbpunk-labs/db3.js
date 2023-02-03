//
// crypto_test.ts
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
import { Ed25519Keypair } from '../src/crypto/ed25519_keypair'
import { Ed25519PublicKey } from '../src/crypto/ed25519_publickey'
import { Secp256k1Keypair } from '../src/crypto/secp256k1_keypair'
import { Secp256k1PublicKey } from '../src/crypto/secp256k1_publickey'
import { toHEX } from '../src/crypto/crypto_utils'

describe('test db3.js crypto module', () => {
    test('ed25519_keypair smoke test', async () => {
        const mnemonic =
            'prefer name genius napkin pig tree twelve blame meat market market soda'
        const keypair = Ed25519Keypair.deriveKeypair(mnemonic)
        const address = keypair.getPublicKey().toAddress()
        expect(address).toBe('0x5132ed60e5b69eed3086c5dd6665f758edc4f007')
        const msg = new Uint8Array(1)
        msg[0] = 0
        const signature = keypair.signData(msg)
        expect(toHEX(signature)).toBe(
            '00c6c00a38278132de297f01d3c26c7b9a27b9f4ea8ba7ea17443807f5ea7a5a3e34b00712f785058d67a6516d58f7ba16bf769f4851d1cc16093bd118f3a8770a56ce74db3780810a815813388a7a10b7157d95a5c807f244622e299e3aa0e3080000000000000000000000000000000000000000000000000000000000000000'
        )
    })
    test('secp259k1_keypair smoke test', async () => {
        const mnemonic =
            'prefer name genius napkin pig tree twelve blame meat market market soda'
        const keypair = Secp256k1Keypair.deriveKeypair(mnemonic)
        const address = keypair.getPublicKey().toAddress()
        expect(address).toBe('0x957dfa89b32d6bf428a839374296286ab416dd9c')
        const msg = new Uint8Array(1)
        msg[0] = 0
        const signature = keypair.signData(msg)
        expect(toHEX(signature)).toBe(
            '007a6c10d30963413376f3881938aa87fb141753f6335aab8bcc4f8124cc557be83f629c3a3ecadeecc3748ea4f7b61d7d443b037acd820bce8cf264161747acaa03e89a6c81c6ae08670eea4da30801591bbff3d51d52872381d0a5c522aab9d57500000000000000000000000000000000000000000000000000000000000000'
        )
    })
})
