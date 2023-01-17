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

import { DB3Transaction } from './DB3Transaction'
import { DStringList } from './DStringList'

export class DB3Database implements IDBDatabase {
    constructor() {
        this.name = ''
        this.objectStoreNames = new DStringList()
        this.version = 1
    }
    name: string
    objectStoreNames: DOMStringList
    version: number
    close() {}
    transaction(
        storeNames: string | string[],
        mode?: IDBTransactionMode | undefined,
        options?: IDBTransactionOptions | undefined
    ) {
        return new DB3Transaction()
    }
    onabort() {}
    onerror() {}
    onclose() {}
    onversionchange() {}
    createObjectStore(
        name: string,
        options?: IDBObjectStoreParameters | undefined
    ): any {}
    deleteObjectStore(name: string): void {}
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
