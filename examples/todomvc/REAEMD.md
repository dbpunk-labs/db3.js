# TODO MVC based on db3 network


## Link db3.js

```
yarn link db3.js
```

## Create Database and Collection

```
db3>-$ new-db
 database address                           | mutation id 
--------------------------------------------+----------------------------------------------
 0x904188b512b6f89f54393e1a09647885b0832c9d | uZufF1CqD23cx1HHocqTkCAVUi0fdbosdLmtuvWWhCg= 
db3>-$ new-collection --addr 0xd9a7b49ea4bbff268f13a0420f520647e2da587f --name todos --index '{"id":0, "name":"owner_idx","fields":[{"field_path":"owner","value_mode":{"Order":1}}]}'
send add collection done!
 mutation_id 
----------------------------------------------
 iK4x3IVDWThYiJnPe7+waKq4iC8REzoZ6iWy3A8Xmfk= 
```

## Update the database address


```typescript
 14     const wallet = DB3BrowserWallet.createNew(mnemonic, 'DB3_SECP259K1')
 15     const userAddress = wallet.getAddress()
 16     const dbAddress = '0xd9a7b49ea4bbff268f13a0420f520647e2da587f'
 17     const db = initializeDB3('http://127.0.0.1:26659', dbAddress, wallet)
 18     const collection = 'todos'
 19     const [inited, setInited] = useState(false)
```
replace the db3Address with new address 0x904188b512b6f89f54393e1a09647885b0832c9d
