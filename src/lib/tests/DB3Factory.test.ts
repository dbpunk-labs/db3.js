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
import { describe, expect, test } from '@jest/globals'
import { DB3Factory } from '../DB3Factory'
import fetch, { Headers, Request, Response } from 'node-fetch'
import { sign, getATestStaticKeypair, getAddress } from '../keys'
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

if (!globalThis.fetch) {
    globalThis.fetch = fetch
    globalThis.Headers = Headers
    globalThis.Request = Request
    globalThis.Response = Response
}

describe('test indexedDB3 api', () => {
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

    test('indexedDB3 open', async () => {
        try {
            const sign = await getSign()
            const indexedDB3 = new DB3Factory({
                node: 'http://127.0.0.1:26659',
                sign,
                nonce,
            })
            const desc = {
                desc: 'desc_db',
                erc20Token: 'usdt',
                price: 1,
                queryCount: 100,
            }
            indexedDB3.open('mydatabase', desc)
            await new Promise((r) => setTimeout(r, 2000))
            const databases = await indexedDB3.databases()
            expect(databases[0].name).toBe('mydatabase')
        } catch (error) {
            console.log('doc meta smoke test error', error)
        }
    })

    test('DB3OpenDBRequest event listener', async () => {
        const sign = await getSign()
        const indexedDB3 = new DB3Factory({
            node: 'http://127.0.0.1:26659',
            sign,
            nonce,
        })
        const desc = {
            desc: 'desc_db',
            erc20Token: 'usdt',
            price: 1,
            queryCount: 100,
        }
        const request = indexedDB3.open('mydatabase', desc)
        const promise = new Promise((resolve, reject) => {
            request.onsuccess = function (event) {
                resolve(event.type)
            }
        })
        const type = await promise
        expect(type).toBe('success')
    })

    test('indexedDB3 open in wpt_test', async () => {
        try {
            window.db3Js = {}
            const indexedDB3 = new DB3Factory({
                node: 'http://127.0.0.1:26659',
                sign: getSign,
                nonce,
            })
            const desc = {
                desc: 'desc_db',
                erc20Token: 'usdt',
                price: 1,
                queryCount: 100,
            }
            indexedDB3.open('mydatabase', desc)
            await new Promise((r) => setTimeout(r, 2000))
            const databases = await indexedDB3.databases()
            expect(databases[0].name).toBe('mydatabase')
        } catch (error) {
            console.log('doc meta smoke test error', error)
        }
    })
})
