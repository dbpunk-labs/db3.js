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
export function addDoc(
    reference: CollectionReference,
    data: any
): Promise<any> {
    return new Promise((resolve, reject) => {
        const db = reference.db
        db.client
            .createDocument(db.address, reference.name, data)
            .then((result) => {
                resolve(result)
            })
    })
}

//export async function doc<T>(
//    reference: CollectionReference<T>,
//    id: string
//): Promise<DocumentReference<T>> {
//    const db = reference.db
//}

export function getDocs<T = DocumentData>(
    query: Query
): Promise<QueryResult<T>> {
    return new Promise((resolve, reject) => {
        const db = query.db
        if (query.type == 'collection') {
            const colref = query as CollectionReference
            const squery: StructuredQuery = {
                collectionName: colref.name,
            }
            db.client.runQuery<T>(db.address, squery).then((docs) => {
                const new_docs = docs.map(
                    (item) => new DocumentReference<T>(colref, item)
                )
                resolve(new QueryResult<T>(db, new_docs))
            })
        } else {
            resolve(new QueryResult<T>(db, []))
        }
    })
}

export function deleteDoc(
    reference: DocumentReference<unknown>
): Promise<void> {
    const db = reference.collection.db
    const doc = reference.doc as DocumentData
    return new Promise((resolve, reject) => {
        db.client
            .deleteDocument(db.address, reference.collection.name, [doc['id']])
            .then(() => {
                resolve()
            })
    })
}

export function updateDoc(
    reference: DocumentReference<unknown>,
    data: any
): Promise<void> {
    const db = reference.collection.db
    const masks = Object.keys(data)
    const doc = reference.doc as DocumentData
    for (const key in data) {
        doc[key] = data[key]
    }
    return new Promise((resolve, reject) => {
        db.client
            .updateDocument(
                db.address,
                reference.collection.name,
                doc,
                doc['id'],
                masks
            )
            .then(() => {
                resolve()
            })
    })
}
