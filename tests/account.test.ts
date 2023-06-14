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
    createRandomAccount,
    createFromPrivateKey,
    signTypedData,
} from '../src/account/db3_account'

describe('test db3.js account module', () => {
    function nonce() {
        return Date.now().toString()
    }
    test('test rangdom account', async () => {
        const account1 = createRandomAccount()
        const account2 = createRandomAccount()
        expect(account1.address).not.toBe(account2.address)
    })

    test('test sign typed data', async () => {
        const privateKey =
            '0xc98f180100bd3ccde3250ae535cdb4346aebc9c2d87636716cb5232380562ca2'
        const db3_account = createFromPrivateKey(privateKey)
        expect(db3_account.address).toBe(
            '0x9359AEc97e905f7666B29F7Eba67c766E8C5CB1B'
        )
        const message = {
            types: {
                EIP712Domain: [],
                Message: [
                    { name: 'payload', type: 'bytes' },
                    { name: 'nonce', type: 'string' },
                ],
            },
            domain: {},
            primaryType: 'Message',
            message: {
                payload: '0x0',
                nonce: '0',
            },
        }
        const sig = await signTypedData(db3_account, message)
        expect(sig).toBe(
            '0x9e7cd84dfe5817da2d938abc2191b430448496dceb52c30f9465d3cdfaa4bbcd03ac2d3158c0f712baa05d31a098acce1d6659d2dcca590603f2e454d6a642581b'
        )
    })
})
