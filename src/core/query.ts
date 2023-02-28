//
// query.ts
// Copyright (C) 2023 db3.network Author imotai <codego.me@gmail.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import {
    StructuredQuery_Filter,
    StructuredQuery_Value,
    StructuredQuery_Limit,
} from '../proto/db3_database'

import type { CollectionReference } from '../store/collection'

/**
 * The Query interface defines all external properties of a query.
 *
 * QueryImpl implements this interface to provide memoization for `queryOrderBy`
 * and `queryToTarget`.
 */
export interface Query<T> {
    readonly filters: StructuredQuery_Filter[]
    readonly limit: StructuredQuery_Limit | null
    readonly collection: CollectionReference<T>
}

export function parseQueryValue(value: unknown): StructuredQuery_Value {
    if (typeof value === 'string') {
        return {
            valueType: {
                oneofKind: 'stringValue',
                stringValue: value,
            },
        }
    }

    if (typeof value === 'boolean') {
        return {
            valueType: {
                oneofKind: 'booleanValue',
                booleanValue: value,
            },
        }
    }
    //TODO add other types
    return {
        valueType: {
            oneofKind: undefined,
        },
    }
}

export function queryWithAddedFilter<T>(
    query: Query<T>,
    filter: StructuredQuery_Filter
): Query<T> {
    const newFilters = query.filters.concat([filter])
    return {
        ...query,
        filters: newFilters,
    }
}
export function queryWithLimit<T>(query: Query<T>, limit: number): Query<T> {
    const slimit: StructuredQuery_Limit = {
        limit,
    }
    return {
        ...query,
        limit: slimit,
    }
}
