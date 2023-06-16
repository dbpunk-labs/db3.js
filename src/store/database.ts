//
// database.ts
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

import { DB3Client } from '../client/client'
import { Collection, Database } from '../proto/db3_database'

export class DB3Store {
    readonly address: string
    readonly client: DB3Client
    _database: Database | undefined
    _collections: Record<string, Collection> | undefined
    constructor(address: string, client: DB3Client) {
        this.address = address
        this.client = client
        this._database = undefined
        this._collections = undefined
    }

    async getCollections(name: string) {
        return undefined
    }

    async getDatabase() {
    }
}
