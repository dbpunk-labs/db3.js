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
    let db_address

    test('can create database', async () => {
        try {
            const sign = await getSign()
            const db3_instance = new DB3('http://127.0.0.1:26659', {
                accountAddress,
                sign,
                nonce,
            })

            const [db_address, tid] = await db3_instance.createDB()
            await new Promise((r) => setTimeout(r, 2000))
            const db = await db3_instance.getDB(db_address)
            console.log(db_address, db)
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

            const result = await db3_instance.createCollection(
                'cities',
                db_address
            )
            const result1 = await db3_instance.createCollection(
                'cities',
                db_address
            )
            console.log(toHEX(result), toHEX(result1))
            await new Promise((r) => setTimeout(r, 2000))
        } catch (error) {
            console.error('doc meta smoke test error', error)
            expect(1).toBe(0)
        }
    })
})
