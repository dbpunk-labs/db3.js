import { useEffect, useMemo, useState } from 'react'
import {
    List,
    Card,
    Divider,
    Typography,
    Input,
    Button,
    Result,
    Space,
    notification
} from 'antd'
import { useAsyncFn } from 'react-use'
import {
    MetamaskWallet,
    initializeDB3,
    DB3Client,
    collection,
    DB3Store,
    addDoc,
    getDocs,
    Index,
    DocumentReference,
    EventMessage
} from 'db3.js'
import './App.css'
import { Buffer } from 'buffer'

globalThis.Buffer = Buffer
const { TextArea } = Input
const { Title, Text } = Typography
const wallet = new MetamaskWallet(window)
const client = new DB3Client('http://127.0.0.1:26659', wallet)


interface Todo {
    text: string
}

const openNotification = (msg:EventMessage) => {
  notification.open({
    message: 'Mutation ' + msg.event.mutationEvent.hash ,
    description: msg.event.mutationEvent.sender,
    onClick: () => {
      console.log('Notification Clicked!');
    },
  });
};

function App() {
    const [token, setToken] = useState('')
    const [db, setStore] = useState(new DB3Store('fake', client))
    const [addr, setAddr] = useState('')
    const [evmAddr, setEvmAddr] = useState('')
    const [database, setDatabase] = useState('')
    const [docs, setDocs] = useState(new Array<DocumentReference<Todo>>(0))

    const [res, connect] = useAsyncFn(async () => {
        try {
            await wallet.connect()
            const addr = wallet.getAddress()
            setAddr(addr)
            const evmAddr = wallet.getEvmAddress()
            setEvmAddr(evmAddr)
        } catch (e) {
            console.log(e)
        }
    }, [wallet])

    const [resx, subscribe] = useAsyncFn(async () => {
        try {
            const call = await client.subscribe_mutation()
            for await (let response of call.response) {
                openNotification(response)
            }
        } catch (e) {
            console.log(e)
        }
    }, [client])


    const [res2, createDatabase] = useAsyncFn(async () => {
        try {
            const [dbid, txid] = await client.createDatabase()
            setDatabase(dbid)
            setStore(new DB3Store(dbid, client))
            await new Promise((r) => setTimeout(r, 1000))
        } catch (e) {
            console.log(e)
        }
    }, [client])

    const [query_session, getQuerySessionToken] = useAsyncFn(async () => {
        try {
            const token = await client.keepSessionAlive()
            setToken(token)
        } catch (e) {
            console.log(e)
        }
    }, [client])

    const [res3, createCollection] = useAsyncFn(async () => {
        try {
            const indexList: Index[] = [
                {
                    name: 'ownerIndex',
                    id: 1,
                    fields: [
                        {
                            fieldPath: 'owner',
                            valueMode: {
                                oneofKind: 'order',
                                order: 1,
                            },
                        },
                    ],
                },
            ]
            const collectionRef = await collection<Todo>(db, 'todos', indexList)
            await new Promise((r) => setTimeout(r, 1000))
        } catch (e) {
            console.log(e)
        }
    }, [db])

    const [res4, addDocument] = useAsyncFn(async () => {
        try {
            const collectionRef = await collection<Todo>(db, 'todos')
            const result = await addDoc<Todo>(collectionRef, {
                text: 'db3 network',
            } as Todo)
            await new Promise((r) => setTimeout(r, 1000))
        } catch (e) {
            console.log(e)
        }
    }, [db])
    const [res5, queryDocument] = useAsyncFn(async () => {
        try {
            const collectionRef = await collection<Todo>(db, 'todos')
            const result = await getDocs<Todo>(collectionRef)
            setDocs(result.docs)
        } catch (e) {
            console.log(e)
        }
    }, [db])

    return (
        <div className="App">
            <Space
                direction="vertical"
                size="middle"
                style={{ display: 'flex' }}
            >
                <Card title="Connect to Metamask" size="large">
                    <p>DB3 Network Address:{addr}</p>
                    <p>Evm Chain Address:{evmAddr}</p>
                    <Button type="primary" ghost onClick={() => connect()}>
                        Connect
                    </Button>
                </Card>
                <Card title="Open subscription" size="large">
                    <Button
                        type="primary"
                        ghost
                        onClick={() => subscribe()}
                    >
                        subscribe
                    </Button>
                </Card>

                <Card title="Create a Database" size="large">
                    <p>Database Address:{database}</p>
                    <Button
                        type="primary"
                        ghost
                        onClick={() => createDatabase()}
                    >
                        Create
                    </Button>
                </Card>
                <Card title="Get Query Session Token" size="large">
                    <p>Token:{token}</p>
                    <Button
                        type="primary"
                        ghost
                        onClick={() => getQuerySessionToken()}
                    >
                        Get
                    </Button>
                </Card>

                <Card title="Create a Collection" size="large">
                    <p>Database Address:{database}</p>
                    <p>Collection Name:todos</p>
                    <Button
                        type="primary"
                        ghost
                        onClick={() => createCollection()}
                    >
                        Create
                    </Button>
                </Card>

                <Card title="Write a document" size="large">
                    <p>Database Address:{database}</p>
                    <p>Collection Name:todos</p>
                    <p>document:add a document with a text field 'db3 network'</p>
                    <Button type="primary" ghost onClick={() => addDocument()}>
                        Add
                    </Button>
                </Card>

                <Card title="Query all document" size="large">
                    <p>Database Address:{database}</p>
                    <p>Collection Name:todos</p>
                    <p>Documents</p>
                    <List
                        size="small"
                        bordered
                        dataSource={docs}
                        renderItem={(item) => (
                            <List.Item>{item.entry.doc.text}</List.Item>
                        )}
                    />

                    <Button
                        type="primary"
                        ghost
                        onClick={() => queryDocument()}
                    >
                        Query
                    </Button>
                </Card>
            </Space>
        </div>
    )
}

export default App
