# What is db3.js

[![npm](https://img.shields.io/npm/v/db3.js?style=flat-square)](https://www.npmjs.com/package/db3.js)
![npm](https://img.shields.io/npm/dw/db3.js?style=flat-square)
[![Coveralls branch](https://img.shields.io/coverallsCoverage/github/dbpunk-labs/db3.js?style=flat-square)](https://coveralls.io/github/dbpunk-labs/db3.js)

db3.js is the [db3 network](https://github.com/dbpunk-labs/db3) javascript API and you can use it to write and query JSON documents against the db3 network.
and you can build fully decentralized applications combining [web3.js](https://github.com/web3/web3.js) and db3.js

![why](./images/whydb3js.png)

# Play with db3.js

```typescript
/*
|----------------------------|
| use db3js open a database  |
|----------------------------|
*/

// build sign function
const sign = await getSign()

// build database factory
const dbFactory = new DB3Factory({
    node: 'http://127.0.0.1:26659',
    sign,
    nonce
})

// open database with an address
const db = dbFactory.open("0x5ca8d43c15fb366d80e221d11a34894eb0975da6")
```

## Show Your Support
Please ⭐️ this repository if this project helped you!


## 0. Checkout

```shell
git clone https://github.com/dbpunk-labs/db3.js.git
git submodule update --recursive
```

## 1. Run DB3 Localnet

```shell
cd tools && bash start_localnet.sh
```

## 2. Run Testcase

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

## 3. Run WPT Case

please setup the wpt environment with [these steps](https://web-platform-tests.org/running-tests/from-local-system.html#system-setup)
```shell
yarn build:wpt
cd thirdparty/wpt && ./wpt serve
```
