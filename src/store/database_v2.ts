//
// database_v2.ts
// Copyright (C) 2023 db3.network Author imotai <codego.me@gmail.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import type {
    CreateCollectionResult,
    Database,
    CreateDBResult,
    MutationResult,
    Collection,
} from './types'

import { DB3ClientV2 } from '../client/client_v2'
import { toHEX } from '../crypto/crypto_utils'
import { Index } from '../proto/db3_database_v2'

/**
 *
 * Create a document database to group the collections
 *
 * ```ts
 * const {db, result} = await createDocumentDatabase(client, "my_db")
 * ```
 * @param client - the db3 client instance
 * @param desc   - the description for the database
 * @returns the {@link CreateDBResult}
 *
 **/
export async function createDocumentDatabase(
    client: DB3ClientV2,
    desc: string
): Promise<CreateDBResult> {
    return new Promise((resolve, reject) => {
        client.createSimpleDatabase(desc).then(([txId, dbId, block, order]) => {
            resolve({
                db: {
                    addr: dbId,
                    client,
                } as Database,
                result: {
                    id: txId,
                    block,
                    order,
                } as MutationResult,
            } as CreateDBResult)
        })
    })
}

/**
 *
 * Query the all databases created by an address
 *
 * ```ts
 * const databases = await showDatabase("0x....", client)
 * ```
 * @param owner - a hex format string address
 * @param client- the db3 client instance
 * @returns the {@link Database}[]
 *
 **/
export async function showDatabase(
    owner: string,
    client: DB3ClientV2
): Promise<Database[]> {
    return new Promise((resolve, reject) => {
        client.getDatabaseOfOwner(owner).then((databases) => {
            const db_list = databases
                .filter((item) => item.database.oneofKind != undefined)
                .map((db) => {
                    if (db.database.oneofKind === 'docDb') {
                        return {
                            addr: '0x' + toHEX(db.database.docDb.address),
                            client,
                            internal: db,
                        }
                    } else if (db.database.oneofKind === 'eventDb') {
                        return {
                            addr: '0x' + toHEX(db.database.eventDb.address),
                            client,
                            internal: db,
                        }
                    } else {
                        //will not go here
                        return {
                            addr: '',
                            client,
                            internal: undefined,
                        }
                    }
                })
            resolve(db_list)
        })
    })
}

/**
 *
 * Create a collection to store json documents and you can specify the index to accelerate query speed
 *
 * ```ts
 * const index1:Index = {
 *    path:'/city', // a top level field name 'city' and the path will be '/city'
 *    indexType: Indextype.StringKey
 * }
 * const {collection, result} = await createCollection(db, "test_collection", [index1])
 * ```
 * current all supported index types are 'IndexType.Uniquekey' , 'IndexType.StringKey', 'IndexType.Int64key' and 'IndexType.Doublekey'
 *
 * @param db          - the instance of database
 * @param name        - the name of collection
 * @param indexFields - the fields for index
 * @returns the {@link CreateCollectionResult}
 *
 **/
export async function createCollection(
    db: Database,
    name: string,
    indexFields: Index[]
): Promise<CreateCollectionResult> {
    return new Promise((resolve, reject) => {
        db.client
            .createCollection(db.addr, name, indexFields)
            .then(([id, block, order]) => {
                const col: Collection = {
                    name,
                    db,
                    indexFields,
                    internal: undefined,
                }

                const result: MutationResult = {
                    id,
                    block,
                    order,
                }

                resolve({
                    collection: col,
                    result,
                } as CreateCollectionResult)
            })
    })
}

/**
 *
 * Query collections in the database
 *
 * ```ts
 * const collections = await showCollection(db)
 * ```
 *
 * @param db  - the instance of database
 * @returns the {@link Collection[]}
 *
 **/
export async function showCollection(db: Database): Promise<Collection[]> {
    return new Promise((resolve, reject) => {
        db.client.getCollectionOfDatabase(db.addr).then((collections) => {
            const collectionList = collections.map((c) => {
                return {
                    name: c.name,
                    db,
                    indexFields: c.indexFields,
                    internal: c,
                } as Collection
            })
            resolve(collectionList)
        })
    })
}
