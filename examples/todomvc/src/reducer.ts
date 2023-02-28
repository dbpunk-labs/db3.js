//no-tscheck
import { Reducer } from 'react'
import type { AsyncActionHandlers } from 'use-reducer-async'
import {
    DocumentReference,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    DB3Store,
    collection,
    query,
    where,
} from 'db3.js'

export interface Todo {
    text: string
    status: boolean
    owner: string
}

export interface TodoState {
    todoList: Array<DocumentReference<Todo>>
    loading: boolean
    db: DB3Store
    collection: string
    userAddress: string
    visibility: string
}

export enum TodoActionkind {
    INSERT = 'INSERT',
    UPDATE = 'UPDATE',
    QUERY = 'QUERY',
    DELETE = 'DELETE',
}

export type AsyncAction = {
    collection: string
    type: string
    payload?: Todo
    old_payload?: DocumentReference<Todo>
    db: DB3Store
    visibility: string
    resultSet?: Array<DocumentReference<Todo>>
    userAddress: string
}

export const asyncActionHandlers: AsyncActionHandlers<
    Reducer<Todo, AsyncAction>,
    AsyncAction
> = {
    [TodoActionkind.INSERT]:
        ({ dispatch }) =>
        async (action) => {
            const col = await collection<Todo>(action.db, action.collection)
            await addDoc<Todo>(col, action.payload!)
            await new Promise((r) => setTimeout(r, 1000))
            return dispatch({
                ...action,
                type: TodoActionkind.QUERY,
            })
        },

    [TodoActionkind.UPDATE]:
        ({ dispatch }) =>
        async (action) => {
            await updateDoc<Todo>(action.old_payload!, action.payload)
            await new Promise((r) => setTimeout(r, 1000))
            return dispatch({
                ...action,
                type: TodoActionkind.QUERY,
            })
        },

    [TodoActionkind.DELETE]:
        ({ dispatch }) =>
        async (action) => {
            await deleteDoc<Todo>(action.old_payload!)
            await new Promise((r) => setTimeout(r, 1000))
            return dispatch({
                ...action,
                type: TodoActionkind.QUERY,
            })
        },

    [TodoActionkind.QUERY]:
        ({ dispatch }) =>
        async (action) => {
            const col = await collection<Todo>(action.db, action.collection)
            // get all docs
            const result = await getDocs<Todo>(
                query<Todo>(col, where('owner', '==', action.userAddress))
            )
            return dispatch({
                ...action,
                type: 'REFRESH',
                resultSet: result.docs,
            })
        },
}

export function runFilter(
    visibility: string,
    todos: Array<DocumentReference<Todo>>
) {
    switch (visibility) {
        case 'All':
            return todos
        case 'Completed':
            return todos.filter((t) => t.entry.doc.status)
        case 'Active':
            return todos.filter((t) => !t.entry.doc.status)
        default:
            throw new Error('Unknown filter: ' + visibility)
    }
}

export function reducer(state: TodoState, action: AsyncAction) {
    const { type, resultSet } = action
    switch (type) {
        case 'REFRESH':
            return {
                ...state,
                todoList: resultSet,
                visibility: action.visibility,
            }
        case 'LOADING':
            return { ...state, loading: true }
        case 'UNLOADING':
            return { ...state, loading: false }
        default:
            break
    }
    return state
}
