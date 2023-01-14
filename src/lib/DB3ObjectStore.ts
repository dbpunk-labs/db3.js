import { DB3Transaction } from './DB3Transaction'
import { DStringList } from './DStringList'

export class DB3ObjectStore implements IDBObjectStore {
    constructor() {
        this.name = ''
        this.autoIncrement = false
        this.indexNames = new DStringList()
        this.keyPath = []
        this.transaction = new DB3Transaction()
    }
    transaction: IDBTransaction
    name: string
    keyPath: string | string[]
    indexNames: DOMStringList
    autoIncrement: boolean
    add(value: any, key?: IDBValidKey) {
        return new IDBRequest()
    }
    clear(): IDBRequest<undefined> {
        return new IDBRequest()
    }
    count(query?: IDBValidKey | IDBKeyRange | undefined): IDBRequest<number> {
        return new IDBRequest()
    }
    createIndex(
        name: string,
        keyPath: string | string[],
        options?: IDBIndexParameters | undefined
    ): IDBIndex
    createIndex(
        name: string,
        keyPath: string | Iterable<string>,
        options?: IDBIndexParameters | undefined
    ): IDBIndex
    createIndex(name: unknown, keyPath: unknown, options?: unknown): IDBIndex {
        return new IDBIndex()
    }
    delete(query: IDBValidKey | IDBKeyRange): IDBRequest<undefined> {
        return new IDBRequest()
    }
    deleteIndex(name: string): void {}
    get(query: IDBValidKey | IDBKeyRange): IDBRequest<any> {
        return new IDBRequest()
    }
    getAll(
        query?: IDBValidKey | IDBKeyRange | null | undefined,
        count?: number | undefined
    ): IDBRequest<any[]> {
        return new IDBRequest()
    }
    getAllKeys(
        query?: IDBValidKey | IDBKeyRange | null | undefined,
        count?: number | undefined
    ): IDBRequest<IDBValidKey[]> {
        return new IDBRequest()
    }
    getKey(
        query: IDBValidKey | IDBKeyRange
    ): IDBRequest<IDBValidKey | undefined> {
        return new IDBRequest()
    }
    index(name: string): IDBIndex {
        return new IDBIndex()
    }
    openCursor(
        query?: IDBValidKey | IDBKeyRange | null | undefined,
        direction?: IDBCursorDirection | undefined
    ): IDBRequest<IDBCursorWithValue | null> {
        return new IDBRequest()
    }
    openKeyCursor(
        query?: IDBValidKey | IDBKeyRange | null | undefined,
        direction?: IDBCursorDirection | undefined
    ): IDBRequest<IDBCursor | null> {
        return new IDBRequest()
    }
    put(value: any, key?: IDBValidKey | undefined): IDBRequest<IDBValidKey> {
        return new IDBRequest()
    }
}
