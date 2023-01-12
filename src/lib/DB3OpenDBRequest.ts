import { DB3Database } from './DB3Database'
import { DB3ObjectStore } from './DB3ObjectStore'
import { DB3Transaction } from './DB3Transaction'

class RequestEventTarget extends EventTarget {
    constructor() {
        super()
    }
}

export class DB3OpenDBRequest implements IDBOpenDBRequest {
    constructor() {
        this.error = null
        this.readyState = 'done'
        this.result = new DB3Database()
        this.source = new DB3ObjectStore()
        this.eventTarget = new RequestEventTarget()
        this.eventTarget.addEventListener('upgradeneeded', (event) => {
            this.onupgradeneeded && this.onupgradeneeded(event)
        })
        this.eventTarget.addEventListener('success', (event) => {
            this.onsuccess && this.onsuccess(event)
        })
        this.eventTarget.addEventListener('blocked', (event) => {
            this.onblocked && this.onblocked(event)
        })
        this.eventTarget.addEventListener('error', (event) => {
            this.onerror && this.onerror(event)
        })
    }
    readonly eventTarget: EventTarget
    readonly readyState: IDBRequestReadyState
    readonly result: IDBDatabase
    readonly source: IDBObjectStore | IDBIndex | IDBCursor
    readonly transaction: IDBTransaction | null = null
    readonly error: DOMException | null
    onblocked: ((event: Event) => void) | null = null
    onupgradeneeded: ((event: Event) => void) | null = null
    onsuccess: ((event: Event) => void) | null = null
    onerror: ((event: Event) => void) | null = null
    addEventListener(type: string, listener: (event: Event) => void) {
        this.eventTarget.addEventListener(type, listener)
    }
    removeEventListener(type: string, listener: (event: Event) => void) {
        this.eventTarget.removeEventListener(type, listener)
    }
    dispatchEvent(event: Event) {
        return this.eventTarget.dispatchEvent(event)
    }
}
