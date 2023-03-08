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
    notification,
    Col,
    Row,
    Statistic,
    QRCode
} from 'antd'
import VirtualList from 'rc-virtual-list'
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
    EventMessage,
    DB3Network,
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

interface DB3Message {
    mtype: string
    msg: string
    key: string
}

const openNotification = (msg: EventMessage) => {
    notification.open({
        message: 'Mutation ' + msg.event.mutationEvent.hash,
        description: msg.event.mutationEvent.sender,
        onClick: () => {
            console.log('Notification Clicked!')
        },
    })
}

function App() {
    const [messages, setMessages] = useState<DB3Message[]>([])
    const [height, setHeight] = useState('NA')
    const [latency, setLatency] = useState('NA')
    const [token, setToken] = useState('')
    const [db, setStore] = useState(new DB3Store('fake', client))
    const [addr, setAddr] = useState('')
    const [evmAddr, setEvmAddr] = useState('')
    const [database, setDatabase] = useState('')
    const [docs, setDocs] = useState(new Array<DocumentReference<Todo>>(0))

    const subscription_handle = (msg: EventMessage) => {
        if (msg.event.oneofKind === 'blockEvent') {
            setHeight(msg.event.blockEvent.height)
        } else {
            try {
                if (
                    msg.event.mutationEvent.to.length == 0 &&
                    msg.event.mutationEvent.collections.length == 0
                ) {
                    const new_messages: DB3Message[] = [
                        {
                            mtype: 'Create Database Done',
                            msg:
                                'create database at height ' +
                                msg.event.mutationEvent.height,
                            key: msg.event.mutationEvent.hash,
                        } as DB3Message,
                    ]

                    setMessages(new_messages.concat(messages.slice(0, 10)))
                } else {
                    const new_messages: DB3Message[] = [
                        {
                            mtype: 'Apply Mutation to collection',
                            msg:
                                'apply crud opertaions to collections ' +
                                msg.event.mutationEvent.collections.join() +
                                ' at height ' +
                                msg.event.mutationEvent.height,
                            key: msg.event.mutationEvent.hash,
                        } as DB3Message,
                    ]
                    setMessages(new_messages.concat(messages.slice(0, 10)))
                }
            } catch (e) {
                console.log(e)
            }
        }
    }

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

    const [query_session, getQuerySessionToken] = useAsyncFn(async () => {
        try {
            const token = await client.keepSessionAlive()
            setToken(token)
            const networkClient = new DB3Network(client)
            const networkState = await networkClient.getState()
            setLatency(networkState.latency)
        } catch (e) {
            console.log(e)
        }
    }, [client])

    const [ctrl, subscribe] = useAsyncFn(async () => {
        try {
            return await client.subscribe(subscription_handle)
        } catch (e) {
            console.log(e)
        }
    }, [client])

    const [res2, createDatabase] = useAsyncFn(async () => {
        try {
            const [dbid, txid] = await client.createDatabase()
            setDatabase(dbid)
            setStore(new DB3Store(dbid, client))
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
            <Space direction="vertical" style={{ display: 'flex' }}>
                <Row>
                    <Col span={8}>
                        <Statistic title="Block" value={height} />
                    </Col>
                    <Col span={8}>
                        <Statistic title="Bills (db3)" value={0} />
                    </Col>
                    <Col span={8}>
                        <Statistic title="Latency (ms)" value={latency} />
                    </Col>
                </Row>
                <List>
                    <VirtualList
                        data={messages}
                        height={100}
                        itemHeight={47}
                        itemKey="key"
                    >
                        {(item: UserItem) => (
                            <List.Item key={item.key}>
                                <List.Item.Meta
                                    title={<a>{item.mtype}</a>}
                                    description={item.msg}
                                />
                            </List.Item>
                        )}
                    </VirtualList>
                </List>
                <Card title="Connect to Metamask" size="large">
                    <p>DB3 Network Address:{addr}</p>
                    <p>Evm Chain Address:{evmAddr}</p>
                    <Button type="primary" ghost onClick={() => connect()}>
                        Connect
                    </Button>
                </Card>

                <Card title="Generate Query Session Token" size="large">
                    <p>Token:{token}</p>
                    <Button
                        type="primary"
                        ghost
                        onClick={() => getQuerySessionToken()}
                    >
                        Generate
                    </Button>
                </Card>

                <Card title="Open subscription" size="large">
                    <Button type="primary" ghost onClick={() => subscribe()}>
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
                    <p>
                        document:add a document with a text field 'db3 network'
                    </p>
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
                <Card title="Experience on the mobile" size="large">
                    <QRCode value={window.location.href} />
                    <p>Scan the QRCode with your metamask on your phone</p>
                </Card>

            </Space>
        </div>
    )
}

export default App
