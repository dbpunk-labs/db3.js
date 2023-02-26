import { CollectionReference, collection } from './collection'
import { DB3Store } from './database'
import { Query, QueryResult } from './query'
import { StructuredQuery } from '../proto/db3_database'
import { DocumentEntry } from '../client/client'

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
    readonly entry: DocumentEntry<T>

    /** @hideconstructor */
    constructor(collection: CollectionReference<T>, entry: DocumentEntry<T>) {
        this.collection = collection
        this.entry = entry
    }
}

//
// add a document with collection reference
//
export function addDoc<T = DocumentData>(
    reference: CollectionReference,
    data: T
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

export function deleteDoc<T = DocumentData>(
    reference: DocumentReference<T>
): Promise<void> {
    const db = reference.collection.db
    const id = reference.entry.id
    return new Promise((resolve, reject) => {
        db.client
            .deleteDocument(db.address, reference.collection.name, [id])
            .then(() => {
                resolve()
            })
    })
}

export function updateDoc<T = DocumentData>(
    reference: DocumentReference<T>,
    data: any
): Promise<void> {
    const db = reference.collection.db
    const masks = Object.keys(data)
    const doc = reference.entry.doc as DocumentData
    const id = reference.entry.id
    for (const key in data) {
        doc[key] = data[key]
    }
    return new Promise((resolve, reject) => {
        db.client
            .updateDocument(
                db.address,
                reference.collection.name,
                doc,
                id,
                masks
            )
            .then(() => {
                resolve()
            })
    })
}
