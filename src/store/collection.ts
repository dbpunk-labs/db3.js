import { Index } from '../proto/db3_database'
import { DB3Store } from './database'
import { DocumentData, DocumentReference } from './document'
import { Query } from './query'

export class CollectionReference {
    readonly type = 'collection'
    readonly db: DB3Store
    readonly name: string
    constructor(db: DB3Store, name: string) {
        this.db = db
        this.name = name
    }
}

export async function collection(
    db: DB3Store,
    name: string,
    index: Index[]
): Promise<CollectionReference>

export async function collection(
    db: DB3Store,
    name: string,
    index: Index[]
): Promise<CollectionReference> {
    const collections = await db.getCollections()
    if (!collections || !collections[name]) {
        await db.client.createCollection(db.address, name, index)
    }
    return new CollectionReference(db, name)
}
