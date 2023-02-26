//
// todo_item.ts
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

import React, { useState } from 'react'
import classnames from 'classnames'
import TodoTextInput from './todo_input'
import { TodoActionkind, Todo } from './reducer'
import { useTodoContext } from './context'
import { DocumentReference } from 'db3.js'

export interface ITodoItem {
    todo: DocumentReference<Todo>
}

function TodoItem(props: ITodoItem) {
    const [editing, setEditing] = useState(false)
    const { state, dispatch } = useTodoContext()
    const todo = props.todo
    function handleDoubleClick() {
        setEditing(true)
    }

    function completeTodo() {
        dispatch({
            type: TodoActionkind.UPDATE,
            payload: {
                ...todo.entry.doc,
                status: !todo.entry.doc.status,
            },
            old_payload: todo,
            db: todo.collection.db,
            collection: todo.collection.name,
            visibility: state.visibility,
        })
    }

    function deleteTodo() {
        dispatch({
            type: TodoActionkind.DELETE,
            payload: todo.entry.doc,
            old_payload: todo,
            db: todo.collection.db,
            collection: todo.collection.name,
            visibility: state.visibility,
        })
    }

    function updateTodo(text: string) {
        if (text.length === 0) {
            dispatch({
                type: TodoActionkind.DELETE,
                payload: todo.entry.doc,
                old_payload: todo,
                db: todo.collection.db,
                collection: todo.collection.name,
                visibility: state.visibility,
            })
        } else {
            dispatch({
                type: TodoActionkind.UPDATE,
                payload: {
                    ...todo.entry.doc,
                    text: text,
                },
                old_payload: todo,
                db: todo.collection.db,
                collection: todo.collection.name,
                visibility: state.visibility,
            })
        }
        setEditing(false)
    }
    let element
    if (editing) {
        element = (
            <TodoTextInput
                text={todo.entry.doc.text}
                editing={editing}
                onSave={(text) => updateTodo(text)}
            />
        )
    } else {
        element = (
            <div className="view">
                <input
                    className="toggle"
                    type="checkbox"
                    checked={todo.entry.doc.status}
                    onChange={() => completeTodo()}
                />
                <label onDoubleClick={() => handleDoubleClick()}>
                    {todo.entry.doc.text}
                </label>
                <button className="destroy" onClick={() => deleteTodo()} />
            </div>
        )
    }
    return (
        <li
            className={classnames({
                completed: todo.entry.doc.status,
                editing: editing,
            })}
        >
            {element}
        </li>
    )
}
export default TodoItem
