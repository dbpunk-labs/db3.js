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
import { DB3ClientV2 } from '../src/client/client_v2'
import { DB3Account } from '../src/account/db3_account'

describe('test db3.js client module', () => {
    test('create database smoke test v2', async () => {
        const privateKey =
            '0xca6ade874391db77a7a66e542f800ba4f89f249cb7c785371eeacbaa3ef74cfd'
        const db3_account = DB3Account.createFromPrivateKey(privateKey)
        expect(db3_account.getAddress()).toBe(
            '0xBbE29f26dc7ADEFEf6592FA34a2EFa037585087C'
        )
        const client = new DB3ClientV2('http://127.0.0.1:26619', db3_account)
        await client.syncNonce()
        const [txId, dbId] = await client.createSimpleDatabase()
        expect(txId).toBe(
            '0xaf2a873a6b5b1e75c34dcc941c0a638a785069862d07799c1b2ed358b690d238'
        )
        expect(dbId).toBe('0x50caab853a8440a929e6f58f51365d836726bc5e')
    })
})
