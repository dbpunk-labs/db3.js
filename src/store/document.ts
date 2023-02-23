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

export async function getDocs<DocumentReference>(
    query: Query
): Promise<QueryResult<DocumentData>> {
    const db = query.db
    if (query.type == 'collection') {
        const colref = query as CollectionReference
        const squery: StructuredQuery = {
            collectionName: colref.name,
        }
        const docs = await db.client.runQuery(db.address, squery)
        const new_docs = docs.map((item) => new DocumentReference(colref, item))
        return new QueryResult(db, new_docs)
    } else {
        return new QueryResult(db, [])
    }
}

export async function deleteDoc(
    reference: DocumentReference<unknown>
): Promise<void> {
    const db = reference.collection.db
    const doc = reference.doc as DocumentData
    await db.client.deleteDocument(db.address, reference.collection.name, [
        doc['id'],
    ])
}

export async function updateDoc(
    reference: DocumentReference<unknown>,
    data: any
): Promise<void> {
    const db = reference.collection.db
    const masks = Object.keys(data)
    const doc = reference.doc as DocumentData
    for (const key in data) {
        doc[key] = data[key]
    }
    await db.client.updateDocument(
        db.address,
        reference.collection.name,
        doc,
        doc['id'],
        masks
    )
}
