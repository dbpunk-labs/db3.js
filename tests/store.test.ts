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
                        fieldPath: 'BJ',
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
        const result = await addDoc(collectionRef, {
            name: 'beijing',
            address: 'north',
        })
        await new Promise((r) => setTimeout(r, 2000))
        const docs = await getDocs(collectionRef)
        expect(docs.length).toBe(1)
        expect(docs[0]['doc']['name']).toBe('beijing')
    })
})
