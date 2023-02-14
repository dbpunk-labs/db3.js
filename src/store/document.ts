import { CollectionReference } from './collection'
import { DB3Store } from './database'
import { Query } from './query'

export type Primitive = string | number | boolean | undefined | null

export type WithFieldValue<T> =
    | T
    | (T extends Primitive
          ? T
          : T extends {}
          ? { [K in keyof T]: WithFieldValue<T[K]> }
          : never)

export type UpdateData<T> = T extends Primitive
    ? T
    : T extends {}
    ? { [K in keyof T]?: UpdateData<T[K]> }
    : Partial<T>
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

export function doc<T>(
    reference: CollectionReference<T>,
    path?: string,
    ...pathSegments: string[]
): DocumentReference<T>

export function doc<T>(
    parent: DB3Store | CollectionReference<T> | DocumentReference<unknown>,
    path?: string
): DocumentReference {
    return {}
}

export function addDoc<T>(
    reference: CollectionReference<T>,
    data: WithFieldValue<T>
): Promise<DocumentReference<T>> {
    return {}
}

export function updateDoc<T>(
    reference: DocumentReference<T>,
    data: UpdateData<T>
): Promise<void> {}

export function setDoc<T>(
    reference: DocumentReference<T>,
    data: PartialWithFieldValue<T>,
    options?: SetOptions
): Promise<void> {}

export function getDoc<T>(
    reference: DocumentReference<T>
): Promise<DocumentData<T>> {}

export function getDocs<T>(query: Query<T>): Promise<QuerySnapshot<T>> {}

export function deleteDoc(
    reference: DocumentReference<unknown>
): Promise<void> {}
