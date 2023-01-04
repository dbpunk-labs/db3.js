# db3.js-DB3 Network Javascript API

![npm](https://img.shields.io/npm/v/db3js?style=flat-square)
![npm](https://img.shields.io/npm/dw/db3js?style=flat-square)

db3.js is the [db3 network](https://github.com/dbpunk-labs/db3) javascript API and you can write and query JSON documents against the db3 network with db3.js.
and you can combine the [web3.js](https://github.com/web3/web3.js) and db3.js to build a fully decentralized storage-heavy application

![why](./images/whydb3js.png)

# How to use db3.js

The goal of db3.js is compatible with [the indexeddb api](https://www.w3.org/TR/IndexedDB/) and you can use db3.js like using indexeddb, even you can use all libraries based on indexeddb e.g. [rxdb](https://github.com/pubkey/rxdb). 

## Using db3.js like using the indexeddb API

```javascript
const request = db3.open("library");
let db;
request.onsuccess = function() {
  db = request.result;
};
// put some documents
const tx = db.transaction("books", "readwrite");
const store = tx.objectStore("books");
store.put({title: "Quarry Memories", author: "Fred", isbn: 123456});
store.put({title: "Water Buffaloes", author: "Fred", isbn: 234567});
store.put({title: "Bedrock Nights", author: "Barney", isbn: 345678});
// use index to query documents
const index = store.index("by_title");
const request = index.get("Bedrock Nights");
request.onsuccess = function() {
  const matching = request.result;
  if (matching !== undefined) {
    // A match was found.
    report(matching.isbn, matching.title, matching.author);
  } else {
    // No match was found.
    report(null);
  }
};
```

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
