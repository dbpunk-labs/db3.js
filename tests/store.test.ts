//
// crypto.test.ts
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
} from '../src/index'
import { Index, Index_IndexField_Order } from '../src/proto/db3_database'

describe('test db3.js store module', () => {
    const mnemonic =
        'result crisp session latin must fruit genuine question prevent start coconut brave speak student dismiss'
    const wallet = DB3BrowserWallet.createNew(mnemonic, 'DB3_SECP259K1')
    test('test document curd', async () => {
        const client = new DB3Client('http://127.0.0.1:26659', wallet)
        const [dbId, txId] = await client.createDatabase()
        const db = initializeDB3('http://127.0.0.1:26659', dbId, wallet)
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

        const collectionRef = await collection(db, 'cities', indexList)
        await new Promise((r) => setTimeout(r, 2000))
        // create doc
        const result = await addDoc(collectionRef, {
            name: 'beijing',
            address: 'north',
        } as DocumentData)

        await new Promise((r) => setTimeout(r, 2000))
        const docs = await getDocs(collectionRef)
        expect(docs.size).toBe(1)
        expect(docs.docs[0].entry.doc['name']).toBe('beijing')
        expect(docs.docs[0].entry.owner).toBe(wallet.getAddress())

        // update
        await updateDoc(docs.docs[0], {
            new_field: 'new_field',
            name: 'shanghai',
        })
        await new Promise((r) => setTimeout(r, 2000))
        const docs3 = await getDocs(collectionRef)
        expect(docs3.size).toBe(1)
        expect(docs.docs[0].entry.id).toBe(docs3.docs[0].entry.id)
        expect(docs3.docs[0].entry.doc['name']).toBe('shanghai')
        expect(docs3.docs[0].entry.doc['new_field']).toBe('new_field')
        expect(docs3.docs[0].entry.owner).toBe(wallet.getAddress())
        // delete
        await deleteDoc(docs.docs[0])
        await new Promise((r) => setTimeout(r, 2000))
        const docs2 = await getDocs(collectionRef)
        expect(docs2.size).toBe(0)
    })
})
