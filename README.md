# What is db3.js

[![npm](https://img.shields.io/npm/v/db3.js?style=flat-square)](https://www.npmjs.com/package/db3.js)
![npm](https://img.shields.io/npm/dw/db3.js?style=flat-square)
[![Coveralls branch](https://img.shields.io/coverallsCoverage/github/dbpunk-labs/db3.js?style=flat-square)](https://coveralls.io/github/dbpunk-labs/db3.js)

db3.js is the [db3 network](https://github.com/dbpunk-labs/db3) javascript API and you can use it to write and query JSON documents against the db3 network.
and you can build fully decentralized applications combining [web3.js](https://github.com/web3/web3.js) and db3.js

![why](./images/whydb3js.png)

# Play with db3.js

## Install db3.js

```
yarn add db3.js
```

## Use db3.js in action

### Build db3 client

```typescript
// the key seed
const mnemonic ='...'
// create a wallet
const wallet = DB3BrowserWallet.createNew(mnemonic, 'DB3_SECP259K1')
// build db3 client
const client = new DB3Client('http://127.0.0.1:26659', wallet)
```
### Create a database

```typescript
const [dbId, txId] = await client.createDatabase()
const db = initializeDB3('http://127.0.0.1:26659', dbId, wallet)
```

### Create a collection

```typescript
// add a index to collection
const indexList: Index[] = [
            {
                name: 'idx1',
                id: 1,
                fields: [
                    {
                        fieldPath: 'name',
                        valueMode: {
                            oneofKind: 'order',
                            order: Index_IndexField_Order.ASCENDING,
                        },
                    },
                ],
            },
]
// create a collecion
const collectionRef = await collection(db, 'cities', indexList)
// add a doc to collection
const result = await addDoc(collectionRef, {
    name: 'beijing',
    address: 'north',
})
// get all docs from collection
const docs = await getDocs(collectionRef)
```

## Show Your Support
Please ⭐️ this repository if this project helped you!


# Contribution

## 1. Checkout

```shell
git clone https://github.com/dbpunk-labs/db3.js.git
git submodule update --recursive
```

## 2. Run DB3 Localnet

```shell
cd tools && bash start_localnet.sh
```

## 3. Run Testcase

```shell
git submodule update
# install the dependency
yarn
# generate the protobuf
make
# run test
yarn test
# format the code
yarn prettier --write src
# run benchmark
yarn benny-sdk
```
