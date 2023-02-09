/**
 * Copyright 2023 db3 network
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// @ts-nocheck
// TODO: fix typescript errors
import { describe, expect, test } from '@jest/globals'
import { DB3 } from '../db3'
import {
    DocMetaManager,
    DocStore,
    DocIndex,
    DocKey,
    DocKeyType,
    genPrimaryKey,
    object2Buffer,
} from '../doc_store'
import { sign, getATestStaticKeypair, getAddress } from '../keys'
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
import fetch, { Headers, Request, Response } from 'node-fetch'

if (!globalThis.fetch) {
    globalThis.fetch = fetch
    globalThis.Headers = Headers
    globalThis.Request = Request
    globalThis.Response = Response
}

describe('test db3js api', () => {
    async function getSign() {
        const [sk, public_key] = await getATestStaticKeypair()
        return async function (
            data: Uint8Array
        ): Promise<[Uint8Array, Uint8Array]> {
            return [await sign(data, sk), public_key]
        }
    }
    function nonce() {
        return Date.now()
    }

    test('doc meta smoke test', async () => {
        try {
            const sign = await getSign()
            const db3_instance = new DB3('http://127.0.0.1:26659', {
                sign,
                nonce,
            })
            const doc_meta_mgr = new DocMetaManager(db3_instance)
            const my_transaction_meta = {
                keys: [
                    {
                        name: 'address',
                        keyType: DocKeyType.STRING,
                    },
                    {
                        name: 'ts',
                        keyType: DocKeyType.NUMBER,
                    },
                ],
                ns: 'my_trx',
                docName: 'transaction',
            }
            const result = await doc_meta_mgr.create_doc_meta(
                my_transaction_meta,
                'test_transaction'
            )
            await new Promise((r) => setTimeout(r, 2000))
            const docs = await doc_meta_mgr.get_all_doc_metas('my_trx')
            expect(docs.length).toBe(1)
            expect(docs[0].doc_name).toBe('transaction')
            expect(docs[0].desc).toBe('test_transaction')
            expect(docs[0].index.ns).toBe('my_trx')
        } catch (error) {
            console.error('doc meta smoke test error', error)
            expect(1).toBe(0)
        }
    })

    test('database smoke test', async () => {
        try {
            const sign = await getSign()
            const db3 = new DB3('http://127.0.0.1:26659', { sign, nonce })
            const result = await db3.createSimpleDb({
                name: 'test_db',
                desc: 'desc_db',
                erc20Token: 'usdt',
                price: 1,
                queryCount: 100,
            })
            await new Promise((r) => setTimeout(r, 2000))
            const response = await db3.getDatabases()
            expect(
                response.dbList.find((item) => item.name === 'test_db')?.name
            ).toBe('test_db')
        } catch (error) {
            console.log('namespace smoke test error', error)
            expect(1).toBe(0)
        }
    })

    test('test submitMutation', async () => {
        const sign = await getSign()
        const db3_instance = new DB3('http://127.0.0.1:26659', { sign, nonce })
        const result = await db3_instance.submitMutaition({
            ns: 'my_twitter',
            gasLimit: 10,
            data: { test1: 'value123' },
        })
        expect(result).toBeDefined()
    })

    test('test openQuerySession', async () => {
        const sign = await getSign()
        const db3_instance = new DB3('http://127.0.0.1:26659', { sign, nonce })
        try {
            const { sessionToken } = await db3_instance.openQuerySession()
            expect(typeof sessionToken).toBe('string')
            const response = await db3_instance.closeQuerySession()
            expect(response).toBeDefined()
        } catch (error) {
            console.error(error)
            throw error
        }
    })

    test('test getKey', async () => {
        const sign = await getSign()
        const db3_instance = new DB3('http://127.0.0.1:26659', { sign, nonce })
        try {
            await db3_instance.submitMutaition({
                ns: 'my_twitter',
                gasLimit: 10,
                data: { key123: 'value123' },
            })
            await db3_instance.openQuerySession()
            await new Promise((r) => setTimeout(r, 2000))
            const queryRes = await db3_instance.getKey({
                ns: 'my_twitter',
                keyList: ['key123'],
            })
            const value = new TextDecoder('utf-8').decode(
                queryRes.batchGetValues!.values[0].value
            )
            expect(value).toBe('value123')
        } catch (error) {
            console.error(error)
            throw error
        }
    })

    test('test db3 submit data and query data', async () => {
        const sign = await getSign()
        const db3_instance = new DB3('http://127.0.0.1:26659', { sign, nonce })
        try {
            await db3_instance.submitMutaition({
                ns: 'my_twitter',
                gasLimit: 10,
                data: { test2: 'value123' },
            })
            await new Promise((r) => setTimeout(r, 2000))
            await db3_instance.openQuerySession()
            const queryRes = await db3_instance.getKey({
                ns: 'my_twitter',
                keyList: ['test2'],
            })
            const value = new TextDecoder('utf-8').decode(
                queryRes.batchGetValues!.values[0].value
            )
            expect(value).toBe('value123')
            const closeRes = await db3_instance.closeQuerySession()
            expect(closeRes).toBeDefined()
        } catch (error) {
            console.error(error)
            throw error
        }
    })

    test('gen primary key', async () => {
        const doc_index = {
            keys: [
                {
                    name: 'address',
                    keyType: DocKeyType.STRING,
                },
                {
                    name: 'ts',
                    keyType: DocKeyType.NUMBER,
                },
            ],
            ns: 'ns1',
            docName: 'transaction',
        }
        const transacion = {
            address: '0x11111',
            ts: 9527,
        }
        const pk = genPrimaryKey(doc_index, transacion)
        const uint8ToBase64 = (arr: Uint8Array): string =>
            btoa(
                Array(arr.length)
                    .fill('')
                    .map((_, i) => String.fromCharCode(arr[i]))
                    .join('')
            )
        expect(uint8ToBase64(pk)).toBe('dHJhbnNhY3Rpb24weDExMTExAAAAAAAAJTc=')
        expect(uint8ToBase64(object2Buffer(transacion))).toBe(
            'eyJhZGRyZXNzIjoiMHgxMTExMSIsInRzIjo5NTI3fQ=='
        )
    })

    test('test insert a doc', async () => {
        const sign = await getSign()
        const db3_instance = new DB3('http://127.0.0.1:26659', { sign, nonce })
        const doc_store = new DocStore(db3_instance)
        const doc_index = {
            keys: [
                {
                    name: 'address',
                    keyType: DocKeyType.STRING,
                },
                {
                    name: 'ts',
                    keyType: DocKeyType.NUMBER,
                },
            ],
            ns: 'ns1',
            docName: 'transaction',
        }
        const transacion = {
            address: '0x11111',
            ts: 9527,
            amount: 10,
        }
        const result = await doc_store.insertDocs(
            doc_index,
            [transacion],

            1
        )
        await new Promise((r) => setTimeout(r, 2000))
        const query = {
            address: '0x11111',
            ts: 9527,
        }
        const docs = await doc_store.getDocs(doc_index, [query])
        expect(docs.length).toBe(1)
        expect(docs[0].amount).toBe(10)
    })

    test('query document range by keys', async () => {
        const sign = await getSign()
        const db3_instance = new DB3('http://127.0.0.1:26659', { sign, nonce })
        const doc_store = new DocStore(db3_instance)
        const doc_index = {
            keys: [
                {
                    name: 'address',
                    keyType: DocKeyType.STRING,
                },
                {
                    name: 'ts',
                    keyType: DocKeyType.NUMBER,
                },
            ],
            ns: 'ns1',
            docName: 'transaction',
        }
        const transacions = [
            {
                address: '0x11111',
                ts: 9529,
            },
            {
                address: '0x11112',
                ts: 9530,
            },
            {
                address: '0x11113',
                ts: 9533,
            },
            {
                address: '0x11114',
                ts: 9534,
            },
        ]
        await doc_store.insertDocs(doc_index, transacions, 1)
        await new Promise((r) => setTimeout(r, 2000))
        const res1 = await doc_store.queryDocsByRange(
            'ns1',
            doc_index,
            {
                address: '0x11111',
                ts: 9529,
            },
            {
                address: '0x11114',
                ts: 9534,
            }
        )
        expect(res1[2].address).toBe('0x11113')
    })

    test('delete data by key', async () => {
        const sign = await getSign()
        const db3 = new DB3('http://127.0.0.1:26659', { sign, nonce })
        await db3.submitMutaition({
            ns: 'my_twitter',
            gasLimit: 10,
            data: { user: 'tracy' },
        })
        await new Promise((r) => setTimeout(r, 2000))
        const res = await db3.deleteKey('my_twitter', 'user')
        expect(res).toBeDefined()
    })

    test('delete doc', async () => {
        const sign = await getSign()
        const db3_instance = new DB3('http://127.0.0.1:26659', { sign, nonce })
        const doc_store = new DocStore(db3_instance)
        const doc_index = {
            keys: [
                {
                    name: 'address',
                    keyType: DocKeyType.STRING,
                },
                {
                    name: 'ts',
                    keyType: DocKeyType.NUMBER,
                },
            ],
            ns: 'ns2',
            docName: 'transaction',
        }
        const transacion = {
            address: '0x11111',
            ts: 9527,
        }
        await doc_store.insertDocs(doc_index, [transacion], 1)
        await new Promise((r) => setTimeout(r, 2000))
        const res = await doc_store.deleteDoc('ns2', doc_index, transacion)
        expect(res).toBeDefined()
    })
})
