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
import {
    DB3ClientV2,
    createClient,
    syncAccountNonce,
    getMutationHeader,
    getMutationBody,
    scanMutationHeaders,
} from '../src/client/client_v2'
import {
    addDoc,
    deleteDoc,
    updateDoc,
    queryDoc,
} from '../src/store/document_v2'
import { createRandomAccount } from '../src/account/db3_account'
import {
    createDocumentDatabase,
    showDatabase,
    createCollection,
} from '../src/store/database_v2'
import { Index, IndexType } from '../src/proto/db3_database_v2'

interface Profile {
    city: string
    author: string
    age: number
}

describe('test db3.js client module', () => {
    async function createTestClient() {
        const db3_account = createRandomAccount()
        const client = createClient(
            'http://127.0.0.1:26619',
            'http://127.0.0.1:26639',
            db3_account
        )
        const nonce = await syncAccountNonce(client)
        return client
    }

    test('create client smoke test', async () => {
        const client = await createTestClient()
        expect(1).toBe(client.nonce)
    })

    test('test query document', async () => {
        const client = await createTestClient()
        try {
            const { db, result } = await createDocumentDatabase(client, 'db1')
            const index: Index = {
                path: '/city',
                indexType: IndexType.StringKey,
            }
            {
                const { collection, result } = await createCollection(
                    db,
                    'col',
                    [index]
                )
                await new Promise((r) => setTimeout(r, 3000))
                const [txId2, block2, order2] = await addDoc(collection, {
                    city: 'beijing',
                    author: 'imotai',
                    age: 10,
                })
                await new Promise((r) => setTimeout(r, 3000))
                const queryStr = '/[age > 8]'
                const resultSet = await queryDoc<Profile>(collection, queryStr)
                console.log(resultSet)
            }
        } catch (e) {
            console.log(e)
            expect(1).toBe(0)
        }
    })
    test('create database v2', async () => {
        const client = await createTestClient()
        try {
            const { db, result } = await createDocumentDatabase(client, 'desc')
            const header = await getMutationHeader(
                client,
                result.block,
                result.order
            )
            if (!header.header) {
                expect(1).toBe(0)
            }
            const body = await getMutationBody(client, result.id)
            expect(body).toBeDefined()
            const databases = await showDatabase(client.account.address, client)
            expect(1).toBe(databases.length)
        } catch (e) {
            console.log(e)
            expect(1).toBe(0)
        }
    })

    test('test scan mutation headers', async () => {
        const client = await createTestClient()
        try {
            const { db, result } = await createDocumentDatabase(client, 'desc')
            const headers = await scanMutationHeaders(client, 0, 1)
            expect(headers.length).toBe(1)
        } catch (e) {
            console.log(e)
            expect(1).toBe(0)
        }
    })

    test('test add large mutations', async () => {
        const client = await createTestClient()
        try {
            for (var i = 0; i < 1; i++) {
                const { db, result } = await createDocumentDatabase(
                    client,
                    'desc'
                )
                const index: Index = {
                    path: '/city',
                    indexType: IndexType.StringKey,
                }
                {
                    const { collection, result } = await createCollection(
                        db,
                        'col',
                        [index]
                    )
                    const [txId2, block2, order2] = await addDoc(collection, {
                        name: 'book1',
                        author: 'db3 developers',
                        id: '0x10b1b560b2fd9a66ae5bce29e5050ffcef6bcc9663d5d116e9877b6a4dda13aa',
                        time: 1686285013,
                        fee: 0.069781,
                    })
                    await updateDoc(
                        collection,
                        'id111',
                        {
                            name: 'book1',
                            author: 'db3 developers',
                        },
                        ['name', 'author']
                    )
                    await deleteDoc(collection, ['id1'])
                }
            }
        } catch (e) {
            console.log(e)
            expect(1).toBe(0)
        }
    })
})
