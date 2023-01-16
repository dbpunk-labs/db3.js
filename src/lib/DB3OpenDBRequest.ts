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
