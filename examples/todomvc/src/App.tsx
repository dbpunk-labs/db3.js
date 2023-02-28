// @ts-nocheck
//
// App.ts
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
import { useAsyncFn } from 'react-use'
import { useReducerAsync } from 'use-reducer-async'
import {
    asyncActionHandlers,
    reducer,
    TodoActionkind,
    TodoState,
    Todo,
} from './reducer'
import { DB3BrowserWallet, initializeDB3, DocumentReference } from 'db3.js'
import TodoContext from './context'
import Header from './header'
import MainSection from './main_section'

function getWallet() {
    try {
        const wallet = DB3BrowserWallet.recover()
        return wallet
    } catch (e) {
        const wallet = DB3BrowserWallet.generate('DB3_SECP259K1')
        return wallet
    }
}
function App() {
    const wallet = getWallet()
    const userAddress = wallet.getAddress()
    const dbAddress = '0xf01d36b4edb28d6acc3970a37e54c751aad4cd07'
    const { db } = initializeDB3('http://127.0.0.1:26659', dbAddress, wallet)
    const collection = 'todos'
    const [inited, setInited] = useState(false)
    const [state, dispatch] = useReducerAsync(
        reducer,
        {
            todoList: new Array<DocumentReference<Todo>>(0),
            loading: false,
            db,
            collection,
            userAddress,
            visibility: 'All',
        },
        asyncActionHandlers
    )

    if (!inited) {
        dispatch({
            db,
            collection,
            type: TodoActionkind.QUERY,
            visibility: 'All',
            userAddress,
        })
        setInited(true)
    }

    const providerState = {
        state,
        dispatch,
    }

    return (
        <TodoContext.Provider value={providerState}>
            <aside className="learn">
                <header>
                    <h3>TodoMVC Dapp Information</h3>
                    <span className="source-links">
                        <h5>Database Address</h5>
                        <a>{dbAddress}</a>
                        <h5>Collection Name</h5>
                        <a>{collection}</a>
                    </span>
                    <h3>Account Information</h3>
                    <span className="source-links">
                        <h5>Address</h5>
                        <a>{state.userAddress}</a>
                    </span>
                    <h3>DB3 Network Community</h3>
                    <span className="source-links">
                        <h5>Example</h5>
                        <a href="https://github.com/dbpunk-labs/db3.js/tree/main/examples/todomvc">
                            Source
                        </a>
                        <h5>db3.js</h5>
                        <a href="https://github.com/dbpunk-labs/db3.js">
                            Source
                        </a>
                        <h5>db3 network</h5>
                        <a href="https://github.com/dbpunk-labs/db3">Source</a>
                    </span>
                </header>
                <blockquote className="quote speech-bubble">
                    DB3 Network is an open-source and decentralized firebase
                    firestore alternative for building fully decentralized dApps
                    quickly with minimal engineering effort. <p></p>
                    <footer>
                        <a href="https://github.com/dbpunk-labs/db3">
                            DB3 Network
                        </a>
                    </footer>
                </blockquote>
            </aside>
            <div className="todoapp">
                <Header />
                <MainSection />
            </div>
        </TodoContext.Provider>
    )
}
export default App
