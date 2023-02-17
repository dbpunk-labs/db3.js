import { CollectionReference } from './collection'
import { DB3Store } from './database'

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
    readonly db3Store: DB3Store

    /** @hideconstructor */
    constructor(
        db3Store: DB3Store
        /**
         * If provided, the `FirestoreDataConverter` associated with this instance.
         */
    ) {
        this.db3Store = db3Store
    }

    get name(): string {
        return ''
    }

    /**
     * A string representing the path of the referenced document (relative
     * to the root of the database).
     */
    get address(): string {
        return ''
    }
}

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

export async function getDocs(reference: CollectionReference) {
    const db = reference.db
    const docs = await db.client.listDocuments(db.address, reference.name)
    return docs
}

export async function deleteDoc(reference: CollectionReference, ids: string[]) {
    const db = reference.db
    const result = await db.client.deleteDocument(
        db.address,
        reference.name,
        ids
    )
    return result
}
