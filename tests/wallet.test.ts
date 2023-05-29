//
// wallet.test.ts
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
import { DB3BrowserWallet } from '../src/wallet/db3_browser_wallet'
import { toB64, fromB64 } from '../src/crypto/crypto_utils'

describe('test db3.js wallet module', () => {
    test('ed25519 wallet smoke test', async () => {
        const mnemonic =
            'result crisp session latin must fruit genuine question prevent start coconut brave speak student dismiss'
        const wallet = DB3BrowserWallet.createNew(mnemonic, 'DB3_ED25519')
        const msg = new Uint8Array(1)
        msg[0] = 0
        const signature = wallet.sign(msg)
        expect(toB64(signature)).toBe(
            'AGAxggujR0I6p1CFqT4iUlfRs++AgprT4gREHM71+V8qkRktNJRx4WOjudvKGiQUioJ6AU3WC/n1aJjKpa/NXA5oWy1vmHhN12MkmvIckvWIyhvoDECpjFW/fJG3TlrB4g=='
        )
        const address = wallet.getAddress()
        expect(address).toBe('0x1a4623343cd42be47d67314fce0ad042f3c82685')
        const hasKey = DB3BrowserWallet.hasKey()
        expect(hasKey).toBe(true)
        const recoverWallet = DB3BrowserWallet.recover()
        expect(recoverWallet.getAddress()).toBe(
            '0x1a4623343cd42be47d67314fce0ad042f3c82685'
        )
        localStorage.clear()
    })

    test('ed25519 wallet smoke test private key', async () => {
        const privateKey =
            'ee394849ac093695ea3c9db6cee14007874a79c118fcb6b8a5684fda4bdc695e685b2d6f98784dd763249af21c92f588ca1be80c40a98c55bf7c91b74e5ac1e2'
        const wallet = DB3BrowserWallet.createFromPrivateKey(
            'DB3_ED25519',
            privateKey
        )
        const msg = new Uint8Array(1)
        msg[0] = 0
        const signature = wallet.sign(msg)
        expect(toB64(signature)).toBe(
            'AGAxggujR0I6p1CFqT4iUlfRs++AgprT4gREHM71+V8qkRktNJRx4WOjudvKGiQUioJ6AU3WC/n1aJjKpa/NXA5oWy1vmHhN12MkmvIckvWIyhvoDECpjFW/fJG3TlrB4g=='
        )
        const address = wallet.getAddress()
        expect(address).toBe('0x1a4623343cd42be47d67314fce0ad042f3c82685')
        const hasKey = DB3BrowserWallet.hasKey()
        expect(hasKey).toBe(true)
        const recoverWallet = DB3BrowserWallet.recover()
        expect(recoverWallet.getAddress()).toBe(
            '0x1a4623343cd42be47d67314fce0ad042f3c82685'
        )
        localStorage.clear()
    })

    test('secp256k1 wallet smoke test', async () => {
        const mnemonic =
            'result crisp session latin must fruit genuine question prevent start coconut brave speak student dismiss'
        const wallet = DB3BrowserWallet.createNew(mnemonic, 'DB3_SECP256K1')
        const msg = new Uint8Array(1)
        msg[0] = 0
        const signature = wallet.sign(msg)
        expect(toB64(signature)).toBe(
            'AX5QFEhl8OQHom8DmzkWJeuPs62q3z7XhAcIUM+MwYnEMoOCA8tB4K4JcEZIqu4vHYu6H4/XHc6Wmn0L0m6TaCsBA+NxdDVYKrM9LjFdIem8ThlQCh/EyM3HOhU2WJF3SxMf'
        )
        const address = wallet.getAddress()
        expect(address).toBe('0xed17b3f435c03ff69c2cdc6d394932e68375f20f')
        const hasKey = DB3BrowserWallet.hasKey()
        expect(hasKey).toBe(true)
        const recoverWallet = DB3BrowserWallet.recover()
        expect(recoverWallet.getAddress()).toBe(
            '0xed17b3f435c03ff69c2cdc6d394932e68375f20f'
        )
        localStorage.clear()
    })

    test('secp256k1 wallet smoke test private key', async () => {
        const privateKey =
            'c98f180100bd3ccde3250ae535cdb4346aebc9c2d87636716cb5232380562ca2'
        const wallet = DB3BrowserWallet.createFromPrivateKey(
            'DB3_SECP256K1',
            privateKey
        )
        const msg = new Uint8Array(1)
        msg[0] = 0
        const signature = wallet.sign(msg)
        expect(toB64(signature)).toBe(
            'AX5QFEhl8OQHom8DmzkWJeuPs62q3z7XhAcIUM+MwYnEMoOCA8tB4K4JcEZIqu4vHYu6H4/XHc6Wmn0L0m6TaCsBA+NxdDVYKrM9LjFdIem8ThlQCh/EyM3HOhU2WJF3SxMf'
        )
        const address = wallet.getAddress()
        expect(address).toBe('0xed17b3f435c03ff69c2cdc6d394932e68375f20f')
        const hasKey = DB3BrowserWallet.hasKey()
        expect(hasKey).toBe(true)
        const recoverWallet = DB3BrowserWallet.recover()
        expect(recoverWallet.getAddress()).toBe(
            '0xed17b3f435c03ff69c2cdc6d394932e68375f20f'
        )
        localStorage.clear()
    })

    test('wallet generate', async () => {
        const wallet = DB3BrowserWallet.generate('DB3_SECP256K1')
        const msg = new Uint8Array(1)
        msg[0] = 0
        const signature = wallet.sign(msg)
        expect(signature).toBeDefined()
        const wallet2 = DB3BrowserWallet.generate('DB3_ED25519')
        const signature2 = wallet.sign(msg)
        expect(signature2).toBeDefined()
        localStorage.clear()
    })
})
