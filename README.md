# db3.js-DB3 Network Javascript API

![npm](https://img.shields.io/npm/v/db3.js?style=flat-square)
![npm](https://img.shields.io/npm/dw/db3.js?style=flat-square)

db3.js is the [db3 network](https://github.com/dbpunk-labs/db3) javascript API and you can write and query JSON documents against the db3 network with db3.js.
and you can combine the [web3.js](https://github.com/web3/web3.js) and  db3.js to build a fully decentralized storage-heavy application

![why](./images/whydb3js.png)


# Build

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
