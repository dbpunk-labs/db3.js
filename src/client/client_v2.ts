//
// client_v2.ts
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

import {
    Mutation,
    MutationAction,
    CollectionMutation,
    DocumentMutation,
    DocumentMask,
    Mutation_BodyWrapper,
    DocumentDatabaseMutation,
} from '../proto/db3_mutation_v2'
import type { DocumentData, DocumentEntry } from './base'
import { Index } from '../proto/db3_database'
import { StorageProviderV2 } from '../provider/storage_provider_v2'
import { DB3Account } from '../account/db3_account'
import { fromHEX } from '../crypto/crypto_utils'
import { BSON } from 'db3-bson'
//
//
// the db3 client v2 for developers
//
//
export class DB3ClientV2 {
    readonly storage_provider: StorageProviderV2
    account: DB3Account
    nonce: number
    /**
     * new a db3 client v2 with db3 node url and wallet
     *
     */
    constructor(url: string, account: DB3Account) {
        this.storage_provider = new StorageProviderV2(url, account)
        this.account = account
        this.nonce = 0
    }

    async syncNonce() {
        const nonce = await this.storage_provider.getNonce()
        this.nonce = parseInt(nonce)
    }

    getNonce() {
        return this.nonce
    }

    getAccount() {
        return this.account.address
    }

    /**
     * create a database and return the address of it
     *
     */
    async createSimpleDatabase(
        desc: string = ''
    ): Promise<[string, string, string, number]> {
        const docDatabaseMutation: DocumentDatabaseMutation = {
            dbDesc: desc,
        }

        const body: Mutation_BodyWrapper = {
            body: { oneofKind: 'docDatabaseMutation', docDatabaseMutation },
            dbAddress: new Uint8Array(0),
        }

        const dm: Mutation = {
            action: MutationAction.CreateDocumentDB,
            bodies: [body],
        }

        const payload = Mutation.toBinary(dm)
        const response = await this.storage_provider.sendMutation(
            payload,
            this.nonce.toString()
        )

        if (response.code == 0) {
            this.nonce += 1
            return [
                response.id,
                response.items[0].value,
                response.block,
                response.order,
            ]
        } else {
            throw new Error('fail to create database')
        }
    }

    /**
     * create a collection
     */
    async createCollection(
        databaseAddress: string,
        name: string,
        index: Index[]
    ): Promise<[string, string, number]> {
        const collection: CollectionMutation = {
            index,
            collectionName: name,
        }

        const body: Mutation_BodyWrapper = {
            body: {
                oneofKind: 'collectionMutation',
                collectionMutation: collection,
            },
            dbAddress: fromHEX(databaseAddress),
        }

        const dm: Mutation = {
            action: MutationAction.AddCollection,
            bodies: [body],
        }

        const payload = Mutation.toBinary(dm)
        const response = await this.storage_provider.sendMutation(
            payload,
            this.nonce.toString()
        )

        if (response.code == 0) {
            this.nonce += 1
            return [response.id, response.block, response.order]
        } else {
            throw new Error('fail to create collection')
        }
    }

    /**
     * create a document
     *
     */
    async createDocument(
        databaseAddress: string,
        collectionName: string,
        document: DocumentData
    ) {
        const documentMutation: DocumentMutation = {
            collectionName,
            documents: [BSON.serialize(document)],
            ids: [],
            masks: [],
        }
        const body: Mutation_BodyWrapper = {
            body: {
                oneofKind: 'documentMutation',
                documentMutation,
            },
            dbAddress: fromHEX(databaseAddress),
        }
        const dm: Mutation = {
            action: MutationAction.AddDocument,
            bodies: [body],
        }
        const payload = Mutation.toBinary(dm)
        const response = await this.storage_provider.sendMutation(
            payload,
            this.nonce.toString()
        )
        if (response.code == 0) {
            this.nonce += 1
            return [response.id, response.block, response.order]
        } else {
            throw new Error('fail to create collection')
        }
    }

    async deleteDocument(
        databaseAddress: string,
        collectionName: string,
        ids: string[]
    ) {
        const documentMutation: DocumentMutation = {
            collectionName,
            documents: [],
            ids,
            masks: [],
        }
        const body: Mutation_BodyWrapper = {
            body: {
                oneofKind: 'documentMutation',
                documentMutation,
            },
            dbAddress: fromHEX(databaseAddress),
        }
        const dm: Mutation = {
            action: MutationAction.DeleteDocument,
            bodies: [body],
        }
        const payload = Mutation.toBinary(dm)
        const response = await this.storage_provider.sendMutation(
            payload,
            this.nonce.toString()
        )
        if (response.code == 0) {
            this.nonce += 1
            return [response.id, response.block, response.order]
        } else {
            throw new Error('fail to create collection')
        }
    }

    //
    //
    // update document with a mask
    //
    //
    async updateDocument(
        databaseAddress: string,
        collectionName: string,
        document: Record<string, any>,
        id: string,
        masks: string[]
    ) {
        const documentMask: DocumentMask = {
            fields: masks,
        }
        const documentMutation: DocumentMutation = {
            collectionName,
            documents: [BSON.serialize(document)],
            ids: [id],
            masks: [documentMask],
        }
        const body: Mutation_BodyWrapper = {
            body: {
                oneofKind: 'documentMutation',
                documentMutation,
            },
            dbAddress: fromHEX(databaseAddress),
        }
        const dm: Mutation = {
            action: MutationAction.UpdateDocument,
            bodies: [body],
        }
        const payload = Mutation.toBinary(dm)
        const response = await this.storage_provider.sendMutation(
            payload,
            this.nonce.toString()
        )
        if (response.code == 0) {
            this.nonce += 1
            return [response.id, response.block, response.order]
        } else {
            throw new Error('fail to create collection')
        }
    }

    async getMutationHeader(block: string, order: number) {
        const response = await this.storage_provider.getMutationHeader(
            block,
            order
        )
        return response
    }

    async getMutationBody(id: string) {
        const response = await this.storage_provider.getMutationBody(id)
        if (response.body) {
            return this.storage_provider.parseMutationBody(response.body)
        }
        throw new Error('mutation not found')
    }

    async scanMutationHeaders(start: number, limit: number) {
        const response = await this.storage_provider.scanMutationHeaders(
            start,
            limit
        )
        return response.headers
    }

    async scanRollupRecords(start: number, limit: number) {
        const response = await this.storage_provider.scanRollupRecords(
            start,
            limit
        )
        return response.records
    }
}
