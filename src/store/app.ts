//
// app.ts
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
// @ts-nocheck

import { DB3Client } from '../client/client'
import { Wallet } from '../wallet/wallet'
import { DB3Store } from './database'
import { DB3Account } from './account'
import { DB3Network } from './network'

export interface DB3SdkRuntime {
    db: DB3Store
    db3Account: DB3Account
    DB3Network: DB3Network
}

export function initializeDB3(
    node: string,
    dbAddress: string,
    wallet: Wallet
): DB3SdkRuntime {
    const dbClient = new DB3Client(node, wallet)
    const db = new DB3Store(dbAddress, dbClient)
    const db3Account = new DB3Account(wallet.getAddress(), dbClient)
    const db3Network = new DB3Network(dbClient)
    const runtime: DB3SdkRuntime = {
        db,
        db3Account,
        db3Network,
    }
    return runtime
}
