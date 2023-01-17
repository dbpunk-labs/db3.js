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
import { DB3OpenDBRequest } from './DB3OpenDBRequest'
import { DB3, DbSimpleDesc } from './db3'

interface IDBFactoryOptions {
    node: string
    sign(target: Uint8Array): Promise<[Uint8Array, Uint8Array]>
    nonce(): number
}
export class DB3Factory implements IDBFactory {
    constructor(options: IDBFactoryOptions) {
        const { node, sign, nonce } = options
        this.db3 = new DB3(node, {
            sign,
            nonce,
        })
    }
    private db3: DB3
    private databaseMap: Record<string, IDBOpenDBRequest> = {}
    open(name: string, desc: DbSimpleDesc): IDBOpenDBRequest {
        if (this.databaseMap[name]) {
            return this.databaseMap[name]
        }
        const request = new DB3OpenDBRequest()
        this.db3
            .createSimpleDb({ name, ...desc })
            .then(() => {
                request.dispatchEvent(new Event('upgradeneeded'))
                request.dispatchEvent(new Event('success'))
            })
            .catch((error) => {
                console.error(error)
                request.dispatchEvent(new Event('error'))
            })

        return request
    }
    async databases(): Promise<IDBDatabaseInfo[]> {
        const { dbList } = await this.db3.getDatabases()
        return dbList
    }
    deleteDatabase(name: string): IDBOpenDBRequest {
        return new DB3OpenDBRequest()
    }
    cmp(first: any, second: any): number {
        return 1
    }
}
