//
// store.test.ts
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
    DB3BrowserWallet,
    initializeDB3,
    DB3Client,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    DocumentData,
    where,
    query,
    limit,
    listMyDatabases,
    listDatabases,
} from '../src/index'
import { Index, Index_IndexField_Order } from '../src/proto/db3_database'
import { toHEX } from '../src/crypto/crypto_utils'
import { and } from '../src/store/query'

interface Todo {
    text: string
    owner: string
}
describe('test db3.js store module', () => {
    test('test mock', async () => {
        expect(0).toBe(0)
    })
    //    const mnemonic =
    //        'result crisp session latin must fruit genuine question prevent start coconut brave speak student dismiss'
    //    const wallet = DB3BrowserWallet.createNew(mnemonic, 'DB3_SECP256K1')
    //    test('test list my database', async () => {
    //        const mnemonic =
    //            'result crisp session latin must fruit genuine question prevent are coconut brave speak student dismiss'
    //        const wallet = DB3BrowserWallet.createNew(mnemonic, 'DB3_SECP256K1')
    //        const client = new DB3Client(
    //            'http://127.0.0.1:26659',
    //            'http://127.0.0.1:26639',
    //            wallet
    //        )
    //        const [dbId, txId] = await client.createDatabase('test')
    //        await new Promise((r) => setTimeout(r, 2000))
    //        const dbs = await listMyDatabases(
    //            'http://127.0.0.1:26659',
    //            'http://127.0.0.1:26639',
    //            wallet
    //        )
    //        expect(dbs.length).toEqual(1)
    //        expect(dbs[0].desc).toEqual('test')
    //        const dbs2 = await listDatabases(
    //            'http://127.0.0.1:26659',
    //            'http://127.0.0.1:26639',
    //            wallet.getAddress(),
    //            wallet
    //        )
    //        expect(dbs2.length).toEqual(1)
    //        expect(dbs2[0].desc).toEqual('test')
    //    })
    //    test('test document curd', async () => {
    //        const client = new DB3Client(
    //            'http://127.0.0.1:26659',
    //            'http://127.0.0.1:26639',
    //            wallet
    //        )
    //        const [dbId, txId] = await client.createDatabase()
    //        const { db } = initializeDB3(
    //            'http://127.0.0.1:26659',
    //            'http://127.0.0.1:26639',
    //            dbId,
    //            wallet
    //        )
    //        const indexList: Index[] = [
    //            {
    //                name: 'idx1',
    //                id: 1,
    //                fields: [
    //                    {
    //                        fieldPath: 'owner',
    //                        valueMode: {
    //                            oneofKind: 'order',
    //                            order: Index_IndexField_Order.ASCENDING,
    //                        },
    //                    },
    //                ],
    //            },
    //        ]
    //        await new Promise((r) => setTimeout(r, 1000))
    //        const collectionRef = await collection<Todo>(db, 'todos', indexList)
    //        await new Promise((r) => setTimeout(r, 1000))
    //        const database = await db.getDatabase()
    //        expect('0x' + toHEX(database.address)).toBe(dbId)
    //        // create doc
    //        const result = await addDoc<Todo>(collectionRef, {
    //            text: 'beijing',
    //            owner: wallet.getAddress(),
    //        } as Todo)
    //
    //        await new Promise((r) => setTimeout(r, 1550))
    //        const docs = await getDocs<Todo>(collectionRef)
    //        expect(docs.size).toBe(1)
    //        expect(docs.docs[0].entry.doc['text']).toBe('beijing')
    //        expect(docs.docs[0].entry.owner).toBe(wallet.getAddress())
    //
    //        // update
    //        await updateDoc(docs.docs[0], {
    //            new_field: 'new_field',
    //            text: 'shanghai',
    //            owner: wallet.getAddress(),
    //        })
    //        await new Promise((r) => setTimeout(r, 2000))
    //        const docs3 = await getDocs<Todo>(collectionRef)
    //        expect(docs3.size).toBe(1)
    //        expect(docs.docs[0].entry.id).toBe(docs3.docs[0].entry.id)
    //        expect(docs3.docs[0].entry.doc['text']).toBe('shanghai')
    //        expect(docs3.docs[0].entry.doc['new_field']).toBe('new_field')
    //        expect(docs3.docs[0].entry.owner).toBe(wallet.getAddress())
    //        // delete
    //        await deleteDoc(docs.docs[0])
    //        await new Promise((r) => setTimeout(r, 1400))
    //        const docs2 = await getDocs<Todo>(collectionRef)
    //        expect(docs2.size).toBe(0)
    //    })
    //
    //    test('test document query limit', async () => {
    //        const client = new DB3Client(
    //            'http://127.0.0.1:26659',
    //            'http://127.0.0.1:26639',
    //            wallet
    //        )
    //        const [dbId, txId] = await client.createDatabase()
    //        const { db } = initializeDB3(
    //            'http://127.0.0.1:26659',
    //            'http://127.0.0.1:26639',
    //            dbId,
    //            wallet
    //        )
    //        const indexList: Index[] = [
    //            {
    //                name: 'idx1',
    //                id: 1,
    //                fields: [
    //                    {
    //                        fieldPath: 'owner',
    //                        valueMode: {
    //                            oneofKind: 'order',
    //                            order: Index_IndexField_Order.ASCENDING,
    //                        },
    //                    },
    //                ],
    //            },
    //        ]
    //        const collectionRef = await collection<Todo>(db, 'todos', indexList)
    //        await new Promise((r) => setTimeout(r, 2000))
    //        // create doc
    //        const result = await addDoc<Todo>(collectionRef, {
    //            text: 'text1',
    //            owner: wallet.getAddress(),
    //        } as Todo)
    //
    //        await new Promise((r) => setTimeout(r, 2000))
    //        // create doc
    //        const result1 = await addDoc<Todo>(collectionRef, {
    //            text: 'text2',
    //            owner: wallet.getAddress(),
    //        } as Todo)
    //        await new Promise((r) => setTimeout(r, 2000))
    //        const docs = await getDocs<Todo>(query<Todo>(collectionRef, limit(1)))
    //        expect(docs.size).toBe(1)
    //    })
    //
    //    test('test document query with field filter', async () => {
    //        const client = new DB3Client(
    //            'http://127.0.0.1:26659',
    //            'http://127.0.0.1:26639',
    //            wallet
    //        )
    //        const [dbId, txId] = await client.createDatabase()
    //        const { db } = initializeDB3(
    //            'http://127.0.0.1:26659',
    //            'http://127.0.0.1:26639',
    //            dbId,
    //            wallet
    //        )
    //        const indexList: Index[] = [
    //            {
    //                name: 'idx1',
    //                id: 1,
    //                fields: [
    //                    {
    //                        fieldPath: 'owner',
    //                        valueMode: {
    //                            oneofKind: 'order',
    //                            order: Index_IndexField_Order.ASCENDING,
    //                        },
    //                    },
    //                ],
    //            },
    //            {
    //                name: 'idx_name',
    //                id: 2,
    //                fields: [
    //                    {
    //                        fieldPath: 'name',
    //                        valueMode: {
    //                            oneofKind: 'order',
    //                            order: Index_IndexField_Order.ASCENDING,
    //                        },
    //                    },
    //                ],
    //            },
    //        ]
    //        const collectionRef = await collection<Todo>(db, 'todos', indexList)
    //        await new Promise((r) => setTimeout(r, 2000))
    //        // create doc
    //        const result = await addDoc<Todo>(collectionRef, {
    //            text: 'text1',
    //            name: 'Bill',
    //            owner: wallet.getAddress(),
    //        } as Todo)
    //
    //        await addDoc<Todo>(collectionRef, {
    //            text: 'text2',
    //            name: 'John',
    //            owner: wallet.getAddress(),
    //        } as Todo)
    //        await addDoc<Todo>(collectionRef, {
    //            text: 'text3',
    //            name: 'John',
    //            owner: wallet.getAddress(),
    //        } as Todo)
    //        await addDoc<Todo>(collectionRef, {
    //            text: 'text4',
    //            name: 'Mike',
    //            owner: wallet.getAddress(),
    //        } as Todo)
    //
    //        await new Promise((r) => setTimeout(r, 2000))
    //        {
    //            const docs = await getDocs<Todo>(
    //                query<Todo>(
    //                    collectionRef,
    //                    where('owner', '==', wallet.getAddress())
    //                )
    //            )
    //            expect(docs.size).toBe(4)
    //        }
    //        {
    //            const docs = await getDocs<Todo>(
    //                query<Todo>(collectionRef, where('owner', '==', 'xxx'))
    //            )
    //            expect(docs.size).toBe(0)
    //        }
    //
    //        {
    //            const docs = await getDocs<Todo>(
    //                query<Todo>(collectionRef, where('name', '<', 'John'))
    //            )
    //            expect(docs.size).toBe(1)
    //            expect(docs.docs[0].entry.doc.name).toBe('Bill')
    //        }
    //
    //        {
    //            const docs = await getDocs<Todo>(
    //                query<Todo>(collectionRef, where('name', '<=', 'John'))
    //            )
    //            expect(docs.size).toBe(3)
    //            expect(docs.docs[0].entry.doc.name).toBe('Bill')
    //            expect(docs.docs[1].entry.doc.name).toBe('John')
    //            expect(docs.docs[2].entry.doc.name).toBe('John')
    //        }
    //
    //        {
    //            const docs = await getDocs<Todo>(
    //                query<Todo>(collectionRef, where('name', '==', 'John'))
    //            )
    //            expect(docs.size).toBe(2)
    //            expect(docs.docs[0].entry.doc.name).toBe('John')
    //            expect(docs.docs[1].entry.doc.name).toBe('John')
    //        }
    //        {
    //            const docs = await getDocs<Todo>(
    //                query<Todo>(collectionRef, where('name', '>=', 'John'))
    //            )
    //            expect(docs.size).toBe(3)
    //            expect(docs.docs[0].entry.doc.name).toBe('John')
    //            expect(docs.docs[1].entry.doc.name).toBe('John')
    //            expect(docs.docs[2].entry.doc.name).toBe('Mike')
    //        }
    //        {
    //            const docs = await getDocs<Todo>(
    //                query<Todo>(collectionRef, where('name', '>', 'John'))
    //            )
    //            expect(docs.size).toBe(1)
    //            expect(docs.docs[0].entry.doc.name).toBe('Mike')
    //        }
    //    })
    //
    //    test('test document query with composite filter', async () => {
    //        const client = new DB3Client(
    //            'http://127.0.0.1:26659',
    //            'http://127.0.0.1:26639',
    //            wallet
    //        )
    //        const [dbId, txId] = await client.createDatabase()
    //        const { db } = initializeDB3(
    //            'http://127.0.0.1:26659',
    //            'http://127.0.0.1:26639',
    //            dbId,
    //            wallet
    //        )
    //        const indexList: Index[] = [
    //            {
    //                name: 'idx_combine',
    //                id: 1,
    //                fields: [
    //                    {
    //                        fieldPath: 'owner',
    //                        valueMode: {
    //                            oneofKind: 'order',
    //                            order: Index_IndexField_Order.ASCENDING,
    //                        },
    //                    },
    //                    {
    //                        fieldPath: 'name',
    //                        valueMode: {
    //                            oneofKind: 'order',
    //                            order: Index_IndexField_Order.ASCENDING,
    //                        },
    //                    },
    //                ],
    //            },
    //        ]
    //        const collectionRef = await collection<Todo>(db, 'todos', indexList)
    //        await new Promise((r) => setTimeout(r, 2000))
    //        // create doc
    //        const result = await addDoc<Todo>(collectionRef, {
    //            text: 'text1',
    //            name: 'Bill',
    //            owner: wallet.getAddress(),
    //        } as Todo)
    //
    //        await addDoc<Todo>(collectionRef, {
    //            text: 'text2',
    //            name: 'John',
    //            owner: wallet.getAddress(),
    //        } as Todo)
    //        await addDoc<Todo>(collectionRef, {
    //            text: 'text3',
    //            name: 'John',
    //            owner: wallet.getAddress(),
    //        } as Todo)
    //
    //        await new Promise((r) => setTimeout(r, 2000))
    //        const docs = await getDocs<Todo>(
    //            query<Todo>(
    //                collectionRef,
    //                and(
    //                    where('owner', '==', wallet.getAddress()),
    //                    where('name', '==', 'Bill')
    //                )
    //            )
    //        )
    //        expect(docs.size).toBe(1)
    //        expect(docs.docs[0].entry.doc.name).toBe('Bill')
    //        expect(docs.docs[0].entry.doc.text).toBe('text1')
    //
    //        const docs2 = await getDocs<Todo>(
    //            query<Todo>(
    //                collectionRef,
    //                and(
    //                    where('owner', '==', wallet.getAddress()),
    //                    where('name', '==', 'John')
    //                )
    //            )
    //        )
    //        expect(docs2.size).toBe(2)
    //        expect(docs2.docs[0].entry.doc.name).toBe('John')
    //        expect(docs2.docs[0].entry.doc.text).toBe('text2')
    //        expect(docs2.docs[1].entry.doc.name).toBe('John')
    //        expect(docs2.docs[1].entry.doc.text).toBe('text3')
    //
    //        const docs3 = await getDocs<Todo>(
    //            query<Todo>(
    //                collectionRef,
    //                and(
    //                    where('owner', '==', wallet.getAddress()),
    //                    where('name', '==', 'Mike')
    //                )
    //            )
    //        )
    //        expect(docs3.size).toBe(0)
    //    })
})
