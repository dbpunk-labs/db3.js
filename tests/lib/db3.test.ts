import { describe, expect, test } from '@jest/globals'
import { DB3 } from '../../src/lib/db3'

import fetch, { Headers, Request, Response } from 'node-fetch'
import { Ed25519Keypair } from '../../src/crypto/ed25519_keypair'
import { toHEX } from '../../src/crypto/crypto_utils'

if (!globalThis.fetch) {
    globalThis.fetch = fetch
    globalThis.Headers = Headers
    globalThis.Request = Request
    globalThis.Response = Response
}

describe('test db3js api', () => {
    const seed = new Uint8Array(32)
    for (let i = 0; i < 32; i++) {
        seed[i] = 0
    }
    const keypair = Ed25519Keypair.fromSeed(seed)
    async function getSign() {
        return async function (
            data: Uint8Array
        ): Promise<[Uint8Array, Uint8Array]> {
            return [
                await keypair.signData(data),
                keypair.getPublicKey().toBytes(),
            ]
        }
    }

    function nonce() {
        return Date.now().toString()
    }

    let accountAddress = keypair.getPublicKey().toAddress()
    let dbAddress

    test('can create database', async () => {
        try {
            const sign = await getSign()
            const db3_instance = new DB3('http://127.0.0.1:26659', {
                accountAddress,
                sign,
                nonce,
            })

            const [dbID, tid] = await db3_instance.createDB()
            dbAddress = dbID
            await new Promise((r) => setTimeout(r, 2000))
            const { db } = await db3_instance.getDB(dbID)
            expect(dbID).toEqual(`0x${toHEX(db!.address)}`)
        } catch (error) {
            console.error('doc meta smoke test error', error)
            expect(1).toBe(0)
        }
    })

    test('can create collection', async () => {
        try {
            const sign = await getSign()
            const db3_instance = new DB3('http://127.0.0.1:26659', {
                accountAddress,
                sign,
                nonce,
            })
            await db3_instance.createCollection(dbAddress, 'cities', [
                {
                    name: 'idx1',
                    id: 1,
                    fields: [
                        {
                            fieldPath: 'state',
                            valueMode: { oneofKind: 'order', order: 1 },
                        },
                    ],
                },
            ])

            await new Promise((r) => setTimeout(r, 2000))
            const collections = await db3_instance.getCollection(dbAddress)
            console.log(collections)
            expect(collections && collections['cities']).toBeDefined()
        } catch (error) {
            console.error('doc meta smoke test error', error)
            expect(1).toBe(0)
        }
    })

    test('can create doc', async () => {
        const sign = await getSign()
        const db3_instance = new DB3('http://127.0.0.1:26659', {
            accountAddress,
            sign,
            nonce,
        })
        const hash = await db3_instance.createDoc(dbAddress, 'cities', {
            name: 'la',
            state: 'ca',
        })
        await new Promise((r) => setTimeout(r, 2000))
        const documents = await db3_instance.getDoc(dbAddress, 'cities')
        expect(documents.length > 0).toBe(true)
    })
})
