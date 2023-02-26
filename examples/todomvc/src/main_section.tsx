//
// main_section.tsx
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
import Footer from './footer'
import TodoList from './todo_list'
import { useTodoContext } from './context'

const MainSection = () => {
    const { state, dispatch } = useTodoContext()
    const todosCount = state.todoList.length
    const completedCount = state.todoList.reduce(
        (count, todo) => (todo.entry.doc.status ? count + 1 : count),
        0
    )
    return (
        <section className="main">
            {!!todosCount && (
                <span>
                    <input
                        className="toggle-all"
                        type="checkbox"
                        defaultChecked={completedCount === todosCount}
                    />
                    <label />
                </span>
            )}
            <TodoList />
            {!!todosCount && (
                <Footer
                    completedCount={completedCount}
                    activeCount={todosCount - completedCount}
                />
            )}
        </section>
    )
}

export default MainSection
