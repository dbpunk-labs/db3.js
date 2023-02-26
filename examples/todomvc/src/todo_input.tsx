//
// todo_input.tsx
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

import React, {
    useState,
    Component,
    ChangeEvent,
    KeyboardEvent,
    FocusEvent,
} from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

export interface ITodoTextInput {
    onSave: (text: string) => void
    text?: string
    placeholder?: string
    editing?: boolean
    newTodo?: boolean
}

function TodoTextInput(props: ITodoTextInput) {
    const [todo, setTodo] = useState('')
    function handleSubmit(e: KeyboardEvent) {
        if (e.which === 13) {
            props.onSave(todo)
            if (props.newTodo) {
                setTodo('')
            }
        }
    }
    function handleBlur(text: string) {
        if (props.newTodo) {
            props.onSave(text)
        }
    }
    return (
        <input
            className={classnames({
                edit: props.editing,
                'new-todo': props.newTodo,
            })}
            type="text"
            placeholder={props.placeholder}
            autoFocus={true}
            value={todo}
            onBlur={(e) => handleBlur(e.currentTarget.value)}
            onChange={(e) => setTodo(e.currentTarget.value)}
            onKeyDown={(e) => handleSubmit(e)}
        />
    )
}

export default TodoTextInput
