import { useEffect, useMemo, useState } from "react";
import { Typography, Input, Button, Result} from "antd";
import { useAsyncFn } from "react-use";
import {MetamaskWallet, initializeDB3, DB3Client} from "db3.js";
import "./App.css";

const { TextArea } = Input
const { Title, Text } = Typography

const wallet = new MetamaskWallet()
function App() {
    const [addr, setAddr] = useState("")
	const [res, somkeTest] = useAsyncFn(async () => {
            try {
                await wallet.connect()
                const addr = wallet.getAddress()
                setAddr(addr)
            } catch(e){
                console.log(e)
            }
    }, []);

	return (
		<div className='App'>
			<Button onClick={() => somkeTest()}>connect to metamask</Button>

            <Text>{addr}</Text>

            <TextArea placeholder="textarea with clear icon" allowClear />
        </div>
	);
}

export default App;
