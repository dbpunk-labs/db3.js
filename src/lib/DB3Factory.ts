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
