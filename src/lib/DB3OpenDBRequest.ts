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
import { DB3Database } from './DB3Database'
import { DB3ObjectStore } from './DB3ObjectStore'
import { DB3Transaction } from './DB3Transaction'

export class DB3OpenDBRequest extends EventTarget implements IDBOpenDBRequest {
    constructor() {
        super()
        this.error = null
        this.readyState = 'done'
        this.result = new DB3Database()
        this.source = null
        this.addEventListener('upgradeneeded', (event) => {
            this.onupgradeneeded && this.onupgradeneeded(event)
        })
        this.addEventListener('success', (event) => {
            this.onsuccess && this.onsuccess(event)
        })
        this.addEventListener('blocked', (event) => {
            this.onblocked && this.onblocked(event)
        })
        this.addEventListener('error', (event) => {
            this.onerror && this.onerror(event)
        })
    }
    readonly readyState: IDBRequestReadyState
    readonly result: IDBDatabase
    readonly source: IDBObjectStore | IDBIndex | IDBCursor
    readonly transaction: IDBTransaction | null = null
    readonly error: DOMException | null
    onblocked: ((event: Event) => void) | null = null
    onupgradeneeded: ((event: Event) => void) | null = null
    onsuccess: ((event: Event) => void) | null = null
    onerror: ((event: Event) => void) | null = null
}
