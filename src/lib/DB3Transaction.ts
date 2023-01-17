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

import { DB3Database } from './DB3Database'
import { DB3ObjectStore } from './DB3ObjectStore'
import { DStringList } from './DStringList'

export class DB3Transaction implements IDBTransaction {
    constructor() {
        this.db = new DB3Database()
        this.durability = 'default'
        this.error = null
        this.objectStoreNames = new DStringList()
        this.mode = 'readonly'
    }
    mode: IDBTransactionMode
    readonly durability: IDBTransactionDurability
    readonly db: IDBDatabase
    readonly error: DOMException | null
    readonly objectStoreNames: DOMStringList

    onabort() {}
    oncomplete() {}
    onerror() {}
    abort() {}
    commit() {}
    objectStore(name: string) {
        return new DB3ObjectStore()
    }
    addEventListener(
        type: unknown,
        listener: unknown,
        options?: unknown
    ): void {}
    removeEventListener(
        type: unknown,
        listener: unknown,
        options?: unknown
    ): void {}
    dispatchEvent(event: Event): boolean {
        return true
    }
}
