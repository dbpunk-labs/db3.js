//
// link.tsx
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

import React, { ReactNode } from 'react'
import classnames from 'classnames'
import { useTodoContext } from './context'
import { TodoActionkind } from './reducer'

export interface ILink {
    children: ReactNode
    filter: string
}
function Link(props: ILink) {
    const { state, dispatch } = useTodoContext()
    function doFilter(filter: string) {
        dispatch({
            db: state.db,
            collection: state.collection,
            type: TodoActionkind.QUERY,
            visibility: filter,
        })
    }
    return (
        <a
            className={classnames({
                selected: props.filter === state.visibility,
            })}
            style={{ cursor: 'pointer' }}
            onClick={() => doFilter(props.filter)}
        >
            {props.children}
        </a>
    )
}

export default Link
