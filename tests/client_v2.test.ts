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
    test('create database v2', async () => {
        const db3_account = DB3Account.genRandomAccount()
        const client = new DB3ClientV2('http://127.0.0.1:26619', db3_account)
        await client.syncNonce()
        try {
            const [txid, dbid, block, order] =
                await client.createSimpleDatabase()
            const header = await client.getMutationHeader(block, order)
            if (!header.header) {
                expect(1).toBe(0)
            }
        } catch (e) {
            expect(1).toBe(0)
        }
    })

    test('test add collection', async () => {
        const db3_account = DB3Account.genRandomAccount()
        const client = new DB3ClientV2('http://127.0.0.1:26619', db3_account)
        try {
            await client.syncNonce()
            const [txId, dbId, block, order] =
                await client.createSimpleDatabase()
            const [txId2, block2, order2] = await client.createDocument(
                dbId,
                'collection1',
                {
                    name: 'book1',
                    author: 'db3 developers',
                }
            )
            const header = await client.getMutationHeader(block2, order2)
            if (!header.header) {
                expect(1).toBe(0)
            }
            await client.deleteDocument(dbId, 'collection1', ['id1'])
            await client.updateDocument(
                dbId,
                'collection1',
                {
                    name: 'book1',
                    author: 'db3 developers',
                },
                'id111',
                ['name', 'author']
            )
        } catch (e) {
            expect(1).toBe(0)
        }
    })
})
