//
// filter.ts
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

import { StructuredQuery_CompositeFilter_Operator, StructuredQuery_FieldFilter_Operator } from "../proto/db3_database";
// The operator of a FieldFilter
export const enum Operator {
    LESS_THAN = '<',
    LESS_THAN_OR_EQUAL = '<=',
    EQUAL = '==',
    NOT_EQUAL = '!=',
    GREATER_THAN = '>',
    GREATER_THAN_OR_EQUAL = '>=',
    ARRAY_CONTAINS = 'array-contains',
    IN = 'in',
    NOT_IN = 'not-in',
    ARRAY_CONTAINS_ANY = 'array-contains-any',
}
// The operator of a CompositeFilter
export const enum CompositeOp {
    AND = 'and',
    OR = 'or',
}

export function parseOperator(
    op: Operator
): StructuredQuery_FieldFilter_Operator {
    switch (op) {
        case Operator.EQUAL: {
            return StructuredQuery_FieldFilter_Operator.EQUAL
        }
        case Operator.LESS_THAN: {
            return StructuredQuery_FieldFilter_Operator.LESS_THAN
        }
        case Operator.LESS_THAN_OR_EQUAL: {
            return StructuredQuery_FieldFilter_Operator.LESS_THAN_OR_EQUAL
        }
        case Operator.GREATER_THAN: {
            return StructuredQuery_FieldFilter_Operator.GREATER_THAN
        }
        case Operator.GREATER_THAN_OR_EQUAL: {
            return StructuredQuery_FieldFilter_Operator.GREATER_THAN_OR_EQUAL
        }
        default: {
            throw new Error('the op is not supported')
        }
    }
}

export function parseCompositeOp(
  op: CompositeOp
): StructuredQuery_CompositeFilter_Operator {
    switch (op) {
        case CompositeOp.AND: {
            return StructuredQuery_CompositeFilter_Operator.AND
        }
        default: {
            throw new Error('the op is not supported')
        }
    }
}
