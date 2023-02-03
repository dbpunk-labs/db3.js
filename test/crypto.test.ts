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
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

import { Ed25519Keypair } from '../src/crypto/ed25519_keypair'
import { Ed25519PublicKey } from '../src/crypto/ed25519_publickey'
import { Secp256k1Keypair } from '../src/crypto/secp256k1_keypair'
import { Secp256k1PublicKey } from '../src/crypto/secp256k1_publickey'
import { toHEX } from '../src/crypto/crypto_utils'

describe('test db3.js crypto module', () => {
    test('ed25519_keypair smoke test', async () => {
        const seed = new Uint8Array(32)
        for (let i = 0; i < 32; i++) {
            seed[i] = 0
        }
        const keypair = Ed25519Keypair.fromSeed(seed)
        const address = keypair.getPublicKey().toAddress()
        expect(address).toBe('0x8a4662abf9f8b7aa947b174f29a7a8f259e111e5')
        const msg = new Uint8Array(1)
        msg[0] = 0
        const signature = keypair.signData(msg)
        expect(toHEX(signature)).toBe(
            '001b9da904f12708363c88d4b96b33b474b2a5a863e290be2be5d4cacef8a5cbac1c0132c3e20e477d7affd1491be6577e8b83af012773beaf51c6df3f4af95b0e3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da290000000000000000000000000000000000000000000000000000000000000000'
        )
    })
    test('secp259k1_keypair smoke test', async () => {
        const seed = new Uint8Array(32)
        for (let i = 0; i < 32; i++) {
            seed[i] = 0
        }

        const mnemonic =
        'prefer name genius napkin pig tree twelve blame meat market market soda'
        const keypair = Secp256k1Keypair.deriveKeypair(mnemonic)
        const address = keypair.getPublicKey().toAddress()
        expect(address).toBe('0x8a4662abf9f8b7aa947b174f29a7a8f259e111e5')
        const msg = new Uint8Array(1)
        msg[0] = 0
        const signature = keypair.signData(msg)
        expect(toHEX(signature)).toBe(
            '001b9da904f12708363c88d4b96b33b474b2a5a863e290be2be5d4cacef8a5cbac1c0132c3e20e477d7affd1491be6577e8b83af012773beaf51c6df3f4af95b0e3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da290000000000000000000000000000000000000000000000000000000000000000'
        )
    })

})

