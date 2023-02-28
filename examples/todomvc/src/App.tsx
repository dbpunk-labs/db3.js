import React, { ChangeEvent, KeyboardEvent, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useReducerAsync } from 'use-reducer-async'
import { asyncActionHandlers, reducer, TodoActionkind } from './reducer'
import { DB3BrowserWallet, initializeDB3, DocumentReference } from 'db3.js'
import TodoContext from './context'
import Header from './header'
import MainSection from './main_section'

function App() {
    const mnemonic =
        'result crisp session latin must fruit genuine question prevent start coconut brave speak student dismiss'
    const wallet = DB3BrowserWallet.createNew(mnemonic, 'DB3_SECP259K1')
    const userAddress = wallet.getAddress()
    const dbAddress = '0x24542b758574342517b67403e1c6ef9160a9d246'
    const db = initializeDB3('http://grpc.testnet.db3.network', dbAddress, wallet)
    const collection = 'todos'
    const [inited, setInited] = useState(false)
    const [state, dispatch] = useReducerAsync(
        reducer,
        {
            todoList: [],
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
        })
        setInited(true)
    }

    const providerState = {
        state,
        dispatch,
    }
    return (
        <TodoContext.Provider value={providerState}>
            <div className=" App">
                <Header />
                <MainSection />
            </div>
        </TodoContext.Provider>
    )
}
export default App
