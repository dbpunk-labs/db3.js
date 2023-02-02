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
import {Ed25519Keypair, Ed25519PublicKey} from '../ed25519_keypair'

describe('test db3.js crypto module', () => {
    test("ed25519_keypair smoke test", async () => {
        const seed = new Uint8Array(32)
        for (let i = 0; i < 32; i++) {
            seed[i] = 0
        }
        const keypair = Ed25519Keypair.fromSeed(seed)
        const publicKey = new Ed25519PublicKey(keypiar.publicKey)
        console.log(publicKey.toAddress())
    })
})

