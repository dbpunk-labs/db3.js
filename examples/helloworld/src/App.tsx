import { useEffect, useMemo, useState } from "react";
import { Input, Button,Result} from "antd";
import { useAsyncFn } from "react-use";
import {DB3BrowserWallet, initializeDB3, DB3Client} from "db3.js";
import "./App.css";

const mnemonic =
        'result crisp session latin must fruit genuine question prevent start coconut brave speak student dismiss'
const wallet = DB3BrowserWallet.createNew(mnemonic, 'DB3_SECP259K1')

function App() {
	const [res, somkeTest] = useAsyncFn(async () => {
            try {
                const client = new DB3Client('http://127.0.0.1:26659', wallet)
                const [dbId, txId] = await client.createDatabase()
            } catch(e){
                console.log(e)
            }
    }, []);
	return (
		<div className='App'>
			<Button onClick={() => somkeTest()}>create db</Button>
        </div>
	);
}

export default App;
