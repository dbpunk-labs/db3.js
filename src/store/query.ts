import { DB3Store } from './database'
import type { DocumentData, DocumentReference } from './document'

export class Query<T = DocumentData> {
    /** The type of this Firestore reference. */
    readonly type: 'query' | 'collection'
    /**
     * The `Firestore` instance for the Firestore database (useful for performing
     * transactions, etc.).
     */
    readonly db: DB3Store

    // This is the lite version of the Query class in the main SDK.

    /** @hideconstructor protected */
    constructor(
        db3store: DB3Store
        /**
         * If provided, the `FirestoreDataConverter` associated with this instance.
         */
    ) {
        this.db = db3store
        this.type = 'query'
    }
}

export type QueryConstraintType =
    | 'where'
    | 'orderBy'
    | 'limit'
    | 'limitToLast'
    | 'startAt'
    | 'startAfter'
    | 'endAt'
    | 'endBefore'

export abstract class AppliableConstraint {
    /**
     * Takes the provided {@link Query} and returns a copy of the {@link Query} with this
     * {@link AppliableConstraint} applied.
     */
    abstract _apply<T>(query: Query<T>): Query<T>
}

/**
 * A `QueryConstraint` is used to narrow the set of documents returned by a
 * Firestore query. `QueryConstraint`s are created by invoking {@link where},
 * {@link orderBy}, {@link startAt}, {@link startAfter}, {@link
 * endBefore}, {@link endAt}, {@link limit}, {@link limitToLast} and
 * can then be passed to {@link query} to create a new query instance that
 * also contains this `QueryConstraint`.
 */
export abstract class QueryConstraint extends AppliableConstraint {
    /** The type of this query constraint */
    abstract readonly type: QueryConstraintType

    /**
     * Takes the provided {@link Query} and returns a copy of the {@link Query} with this
     * {@link AppliableConstraint} applied.
     */
    abstract _apply<T>(query: Query<T>): Query<T>
}

//export function query<T>(
//    query: Query<T>,
//    ...queryConstraints: QueryConstraint[]
//): Query<T> {
//
//}

export class QueryResult<T = DocumentData> {
    readonly docs: Array<DocumentReference<T>>
    readonly db: DB3Store
    constructor(db3store: DB3Store, docs: Array<DocumentReference<T>>) {
        this.db = db3store
        this.docs = docs
    }
    get empty(): boolean {
        return this.docs.length == 0
    }
    get size(): number {
        return this.docs.length
    }
}
