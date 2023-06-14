//
// database_v2.test.ts
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
import { createRandomAccount } from '../src/account/db3_account'
import {
    createDocumentDatabase,
    showDatabase,
    createCollection,
    showCollection,
} from '../src/store/database_v2'

import { Index, IndexType } from '../src/proto/db3_database_v2'

describe('test db3.js sdk database', () => {
    test('database smoke test from sdk', async () => {
        // test create database and show database
        const account = createRandomAccount()
        const client = new DB3ClientV2('http://127.0.0.1:26619', account)
        await client.syncNonce()
        const databases1 = await showDatabase(account.address, client)
        expect(databases1.length).toBe(0)
        const { db, result } = await createDocumentDatabase(client, 'test_db')
        expect(db).toBeDefined()
        expect(result).toBeDefined()
        expect(result.id).toBeTruthy()
        const databases2 = await showDatabase(account.address, client)
        expect(databases2.length).toBe(1)
        expect(databases2[0].addr).toBe(db.addr)
        expect(databases2[0].internal.database.oneofKind).toBe('docDb')
        expect(databases2[0].internal.database.docDb.desc).toBe('test_db')
    })

    test('collection smoke test from sdk', async () => {
        const account = createRandomAccount()
        const client = new DB3ClientV2('http://127.0.0.1:26619', account)
        await client.syncNonce()

        const { db, result } = await createDocumentDatabase(client, 'test_db2')
        const collections = await showCollection(db)
        expect(collections.length).toBe(0)

        const index: Index = {
            path: '/city',
            indexType: IndexType.StringKey,
        }
        {
            const { collection, result } = await createCollection(db, 'col1', [
                index,
            ])
            expect(collection).toBeDefined()
            expect(result).toBeDefined()
            expect(result.id).toBeTruthy()
        }
    })
})
