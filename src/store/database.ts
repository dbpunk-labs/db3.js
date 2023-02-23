import { DB3Client } from '../client/client'
import { Collection } from '../proto/db3_database'

export class DB3Store {
    readonly address: string
    readonly client: DB3Client
    _collections: Record<string, Collection> | undefined
    constructor(address: string, client: DB3Client) {
        this.address = address
        this.client = client
    }
    async getCollections() {
        if (!this._collections) {
            const collections = await this.client.listCollection(this.address)
            this._collections = collections
        }
        return this._collections
    }
}
