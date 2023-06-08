//
// app_v2.ts
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

import { DB3Account } from '../account/db3_account'
import { DB3ClientV2 } from '../client/client_v2'
import { Hex } from 'viem'

export function createAccountFromPrivateKey(key: Hex): DB3Account {
    return DB3Account.createFromPrivateKey(key)
}

export function createRandomAccount(): DB3Account {
    return DB3Account.genRandomAccount()
}

export function initializeClient(
    storage: string,
    indexer: string,
    account: DB3Account
): DB3ClientV2 {
    return new DB3ClientV2(storage, account)
}
