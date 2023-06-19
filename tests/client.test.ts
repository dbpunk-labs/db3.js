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
    test('get my database smoke test', async () => {
        const mnemonic =
            'result crisp session latin must fruit genuine question prevent star coconut brave speak student dismiss'
        const wallet = DB3BrowserWallet.createNew(mnemonic, 'DB3_SECP256K1')
        const client = new DB3Client(
            'http://127.0.0.1:26659',
            'http://127.0.0.1:26639',
            wallet
        )
        const [dbId, txId] = await client.createDatabase()
    })
})
