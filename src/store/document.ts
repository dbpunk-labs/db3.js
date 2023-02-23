import { CollectionReference, collection } from './collection'
import { DB3Store } from './database'
import { Query, QueryResult } from './query'
import { StructuredQuery } from '../proto/db3_database'

export interface DocumentData {
    [field: string]: any
}

export class DocumentReference<T = DocumentData> {
    /** The type of this Firestore reference. */
    readonly type = 'document'

    /**
     * The {@link Firestore} instance the document is in.
     * This is useful for performing transactions, for example.
     */
    readonly collection: CollectionReference<T>
    readonly doc: T

    /** @hideconstructor */
    constructor(collection: CollectionReference<T>, doc: T) {
        this.collection = collection
        this.doc = doc
    }

    /**
     * return a base64 string
     */

    get id(): string {
        return this.doc['id']
    }

    /**
     * return the owner address in hex format
     */
    get owner(): string {
        return this.doc['owner']
    }

    /**
     * return the transacion id
     */
    get tx(): string {
        return this.doc['tx']
    }
}

//
// add a document with collection reference
//
export async function addDoc(
    reference: CollectionReference,
    data: any
): Promise<any> {
    const db = reference.db
    const result = await db.client.createDocument(
        db.address,
        reference.name,
        data
    )
    return result
}

//export async function doc<T>(
//    reference: CollectionReference<T>,
//    id: string
//): Promise<DocumentReference<T>> {
//    const db = reference.db
//}

export async function getDocs<T>(query: Query<T>): Promise<QueryResult<T>> {
    const db = query.db
    if (query.type == 'collection') {
        const squery: StructuredQuery = {
            collectionName: query.name,
        }
        const col = await collection(db, query.name)
        const docs = await db.client.runQuery(db.address, squery)
        const new_docs = docs.map((item) => new DocumentReference(col, item))
        return new QueryResult(db, new_docs)
    } else {
        return []
    }
}

export async function deleteDoc(
    reference: DocumentReference<unknown>
): Promise<void> {
    const db = reference.collection.db
    await db.client.deleteDocument(db.address, reference.collection.name, [
        reference.id,
    ])
}

export async function updateDoc(
    reference: DocumentReference<unknown>,
    data: any
): Promise<void> {
    const db = reference.collection.db
    const masks = Object.keys(data)
    for (const key in data) {
        reference.doc[key] = data[key]
    }
    await db.client.updateDocument(
        db.address,
        reference.collection.name,
        reference.doc,
        reference.id,
        masks
    )
}
