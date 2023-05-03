import { DB3Store } from './database'
import type { DocumentReference } from './document'
import type { CollectionReference } from './collection'
import type { DocumentData } from '../client/client'
import {
    StructuredQuery_CompositeFilter,
    StructuredQuery_FieldFilter,
    StructuredQuery_FieldFilter_Operator,
    StructuredQuery_Filter,
} from '../proto/db3_database'
import {
    Query as InternalQuery,
    parseQueryValue,
    queryWithAddedFilter,
    queryWithLimit,
} from '../core/query'
import {
    CompositeOp,
    Operator,
    parseCompositeOp,
    parseOperator,
} from '../core/filter'

export class Query<T = DocumentData> {
    /** The type of this Firestore reference. */
    readonly type: 'query' | 'collection'
    /**
     * The `Firestore` instance for the Firestore database (useful for performing
     * transactions, etc.).
     */
    readonly db: DB3Store

    readonly _query: InternalQuery<T>

    // This is the lite version of the Query class in the main SDK.

    /** @hideconstructor protected */
    constructor(db3store: DB3Store, _query: InternalQuery<T>) {
        this.db = db3store
        this.type = 'query'
        this._query = _query
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
    | 'and'

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

/**
 * A `QueryFieldFilterConstraint` is used to narrow the set of documents returned by
 * a Firestore query by filtering on one or more document fields.
 * `QueryFieldFilterConstraint`s are created by invoking {@link where} and can then
 * be passed to {@link query} to create a new query instance that also contains
 * this `QueryFieldFilterConstraint`.
 */
export class QueryFieldFilterConstraint extends QueryConstraint {
    /** The type of this query constraint */
    readonly type = 'where'

    /**
     * @internal
     */
    protected constructor(
        private readonly _field: string,
        private _op: Operator,
        private _value: unknown
    ) {
        super()
    }

    static _create(
        _field: string,
        _op: Operator,
        _value: unknown
    ): QueryFieldFilterConstraint {
        return new QueryFieldFilterConstraint(_field, _op, _value)
    }

    _apply<T>(query: Query<T>): Query<T> {
        const filter = this._parse()
        if (query.type == 'collection') {
            const internalQuery: InternalQuery<T> = {
                filters: [filter],
                limit: null,
                collection: query as CollectionReference<T>,
            }
            return new Query(query.db, internalQuery)
        } else {
            return new Query(
                query.db,
                queryWithAddedFilter(query._query, filter)
            )
        }
    }
    _parse(): StructuredQuery_Filter {
        const filter = newQueryFilter(this._field, this._op, this._value)
        return filter
    }
}

/**
 * Filter conditions in a {@link where} clause are specified using the
 * strings '&lt;', '&lt;=', '==', '!=', '&gt;=', '&gt;', 'array-contains', 'in',
 * 'array-contains-any', and 'not-in'.
 */
export type WhereFilterOp =
    | '<'
    | '<='
    | '=='
    | '!='
    | '>='
    | '>'
    | 'array-contains'
    | 'in'
    | 'array-contains-any'
    | 'not-in'

/**
 * Creates a {@link QueryFieldFilterConstraint} that enforces that documents
 * must contain the specified field and that the value should satisfy the
 * relation constraint provided.
 *
 * @param fieldPath - The path to compare
 * @param opStr - The operation string (e.g "&lt;", "&lt;=", "==", "&lt;",
 *   "&lt;=", "!=").
 * @param value - The value for comparison
 * @returns The created {@link QueryFieldFilterConstraint}.
 */
export function where(
    field: string,
    opStr: WhereFilterOp,
    value: unknown
): QueryFieldFilterConstraint {
    const op = opStr as Operator
    return QueryFieldFilterConstraint._create(field, op, value)
}

export function and(
    ...queryConstraints: QueryConstraint[]
): QueryAndConstraint {
    return QueryAndConstraint._create(queryConstraints)
}

export function query<T>(
    query: Query<T>,
    ...queryConstraints: QueryConstraint[]
): Query<T> {
    if (queryConstraints.length == 0) {
        throw new Error('bad query constraint len')
    }
    for (const constraint of queryConstraints) {
        query = constraint._apply(query)
    }
    return query
}

/**
 * A `QueryAndConstraint` is used to narrow the set of documents returned by
 * a Firestore query by filtering on one or more document fields.
 * `QueryFieldFilterConstraint`s are created by invoking {@link where} and can then
 * be passed to {@link query} to create a new query instance that also contains
 * this `QueryFieldFilterConstraint`.
 */
export class QueryAndConstraint extends QueryConstraint {
    /** The type of this query constraint */
    readonly type = 'and'

    /**
     * @internal
     */
    protected constructor(private _filters: QueryConstraint[]) {
        super()
    }

    static _create(_filters: QueryConstraint[]): QueryAndConstraint {
        return new QueryAndConstraint(_filters)
    }

    _apply<T>(query: Query<T>): Query<T> {
        const filter = this._parse()
        if (query.type == 'collection') {
            // convert filters to StructuredQuery_Filter[]

            const internalQuery: InternalQuery<T> = {
                filters: [filter],
                limit: null,
                collection: query as CollectionReference<T>,
            }
            return new Query(query.db, internalQuery)
        } else {
            return new Query(
                query.db,
                queryWithAddedFilter(query._query, filter)
            )
        }
    }

    _parse(): StructuredQuery_Filter {
        const filter = newCompositeFilter(this._filters, CompositeOp.AND)
        return filter
    }
}
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

function newQueryFilter(
    field: string,
    op: Operator,
    value: unknown
): StructuredQuery_Filter {
    const queryOp = parseOperator(op)
    const queryValue = parseQueryValue(value)
    const filter: StructuredQuery_FieldFilter = {
        field,
        op: queryOp,
        value: queryValue,
    }
    return {
        filterType: {
            oneofKind: 'fieldFilter',
            fieldFilter: filter,
        },
    }
}
function newCompositeFilter(
    queryConstraints: QueryConstraint[],
    op: CompositeOp
): StructuredQuery_Filter {
    const filters = []
    // transform queryConstraints to StructuredQuery_Filter[]
    for (const constraint of queryConstraints) {
        // check all queryConstraints are fieldFilter
        if (constraint.type != 'where') {
            throw new Error('unsupport filter type')
        }
        const filter = (constraint as QueryFieldFilterConstraint)._parse()
        if (filter.filterType.oneofKind != 'fieldFilter') {
            throw new Error('unsupport filter type')
        }
        if (
            filter.filterType.fieldFilter.op !=
            StructuredQuery_FieldFilter_Operator.EQUAL
        ) {
            throw new Error('unsupport where op, required ==')
        }
        filters.push(filter)
    }
    // const filters = queryConstraints.map(
    //   (constraint) => (constraint as QueryFieldFilterConstraint)._parse())
    const queryOp = parseCompositeOp(op)
    const filter: StructuredQuery_CompositeFilter = {
        filters: filters,
        op: queryOp,
    }
    return {
        filterType: {
            oneofKind: 'compositeFilter',
            compositeFilter: filter,
        },
    }
}

/**
 * A `QueryLimitConstraint` is used to limit the number of documents returned by
 * a Firestore query.
 * `QueryLimitConstraint`s are created by invoking {@link limit} or
 * {@link limitToLast} and can then be passed to {@link query} to create a new
 * query instance that also contains this `QueryLimitConstraint`.
 */
export class QueryLimitConstraint extends QueryConstraint {
    /**
     * @internal
     */
    protected constructor(
        /** The type of this query constraint */
        readonly type: 'limit',
        private readonly _limit: number
    ) {
        super()
    }

    static _create(type: 'limit', _limit: number): QueryLimitConstraint {
        return new QueryLimitConstraint(type, _limit)
    }

    _apply<T>(query: Query<T>): Query<T> {
        if (query.type == 'collection') {
            const internalQuery: InternalQuery<T> = {
                filters: [],
                limit: null,
                collection: query as CollectionReference<T>,
            }
            return new Query(
                query.db,
                queryWithLimit(internalQuery, this._limit)
            )
        } else {
            return new Query(
                query.db,
                queryWithLimit(query._query, this._limit)
            )
        }
    }
}

/**
 * Creates a {@link QueryLimitConstraint} that only returns the first matching
 * documents.
 *
 * @param limit - The maximum number of items to return.
 * @returns The created {@link QueryLimitConstraint}.
 */
export function limit(limit: number): QueryLimitConstraint {
    return QueryLimitConstraint._create('limit', limit)
}
