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
import { toB64 } from '../src/crypto/crypto_utils'

describe('test db3.js crypto module', () => {
    test('ed25519_keypair smoke test', async () => {
        const mnemonic =
            'result crisp session latin must fruit genuine question prevent start coconut brave speak student dismiss'
        const keypair = Ed25519Keypair.deriveKeypair(mnemonic)
        const address = keypair.getPublicKey().toAddress()
        expect(address).toBe('0x1a4623343cd42be47d67314fce0ad042f3c82685')
        const msg = new Uint8Array(1)
        msg[0] = 0
        const signature = keypair.signData(msg)
        expect(toB64(signature)).toBe(
            'AGAxggujR0I6p1CFqT4iUlfRs++AgprT4gREHM71+V8qkRktNJRx4WOjudvKGiQUioJ6AU3WC/n1aJjKpa/NXA5oWy1vmHhN12MkmvIckvWIyhvoDECpjFW/fJG3TlrB4g=='
        )
    })
    test('secp259k1_keypair smoke test', async () => {
        const mnemonic =
            'result crisp session latin must fruit genuine question prevent start coconut brave speak student dismiss'
        const keypair = Secp256k1Keypair.deriveKeypair(mnemonic)
        const address = keypair.getPublicKey().toAddress()
        expect(address).toBe('0xed17b3f435c03ff69c2cdc6d394932e68375f20f')
        const msg = new Uint8Array(1)
        msg[0] = 0
        const signature = keypair.signData(msg)
        expect(toB64(signature)).toBe(
            'AH5QFEhl8OQHom8DmzkWJeuPs62q3z7XhAcIUM+MwYnEMoOCA8tB4K4JcEZIqu4vHYu6H4/XHc6Wmn0L0m6TaCsBA+NxdDVYKrM9LjFdIem8ThlQCh/EyM3HOhU2WJF3SxMf'
        )
    })
})
