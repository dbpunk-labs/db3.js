//
// header.tsx
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

import React from 'react'
import TodoTextInput from './todo_input'
import { useTodoContext } from './context'
import { TodoActionkind } from './reducer'

function Header() {
    const { state, dispatch } = useTodoContext()
    function addTodo(text: string) {
        dispatch({
            type: TodoActionkind.INSERT,
            payload: {
                text: text,
                status: false,
                owner: state.userAddress,
            },
            db: state.db,
            collection: state.collection,
            visibility: state.visibility,
        })
    }
    return (
        <header className="header">
            <h1>todos</h1>
            <TodoTextInput
                newTodo
                onSave={(text: string) => {
                    if (text.length !== 0) {
                        addTodo(text)
                    }
                }}
                placeholder="What needs to be done?"
            />
        </header>
    )
}
export default Header
