//
// collection.ts
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
// @ts-nocheck

import { Index } from '../proto/db3_database'
import { DB3Store } from './database'
import { DocumentReference } from './document'
import type { DocumentData } from '../client/client'
import { Query } from './query'

export class CollectionReference<T = DocumentData> extends Query<T> {
    readonly type = 'collection'
    readonly db: DB3Store
    readonly name: string
    constructor(db: DB3Store, name: string) {
        super(db)
        this.name = name
        this.db = db
    }
}
export function collection<T = DocumentData>(
    db: DB3Store,
    name: string,
    index?: Index[]
): Promise<CollectionReference<T>>

export function collection<T = DocumentData>(
    db: DB3Store,
    name: string,
    index?: Index[]
): Promise<CollectionReference<T>> {
    return new Promise((resolve, reject) => {
        db.getCollections(name).then((collection) => {
            if (!collection) {
                db.client
                    .createCollection(db.address, name, index)
                    .then((txid) => {
                        resolve(new CollectionReference<T>(db, name))
                    })
            } else {
                resolve(new CollectionReference<T>(db, name))
            }
        })
    })
}
