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
import { toHEX } from '../src/crypto/crypto_utils'
import { DB3Client } from '../src/client/client'
import { DB3BrowserWallet } from '../src/wallet/db3_browser_wallet'
import {
    Index,
    Index_IndexField_Order,
    StructuredQuery,
} from '../src/proto/db3_database'

describe('test db3.js client module', () => {
    test('create database smoke test', async () => {
        const mnemonic =
            'result crisp session latin must fruit genuine question prevent start coconut brave speak student dismiss'
        const wallet = DB3BrowserWallet.createNew(mnemonic, 'DB3_SECP256K1')
        const client = new DB3Client('http://127.0.0.1:26659', wallet)
        const [dbId, txId] = await client.createDatabase()
        await new Promise((r) => setTimeout(r, 2000))
        const db = await client.getDatabase(dbId)
        expect(dbId).toEqual(`0x${toHEX(db!.address)}`)
        const indexList: Index[] = [
            {
                name: 'idx1',
                id: 1,
                fields: [
                    {
                        fieldPath: 'name',
                        valueMode: {
                            oneofKind: 'order',
                            order: Index_IndexField_Order.ASCENDING,
                        },
                    },
                ],
            },
        ]
        await client.createCollection(dbId, 'books', indexList)
        await new Promise((r) => setTimeout(r, 2000))
        const collections = await client.listCollection(dbId)
        expect(collections && collections['books']).toBeDefined()
        await client.createDocument(dbId, 'books', {
            name: 'book1',
            author: 'db3 developers',
        })
        await new Promise((r) => setTimeout(r, 2000))
        const query: StructuredQuery = {
            collectionName: 'books',
        }
        const books = await client.runQuery(dbId, query)
        expect(books.length).toBe(1)
        expect(books[0].doc['name']).toBe('book1')
        const bookId = books[0].id
        const result = await client.deleteDocument(dbId, 'books', [bookId])
        expect(result).toBeDefined()
    })
})
