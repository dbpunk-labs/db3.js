//@ts-nocheck
//
// client.ts
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
    PayloadType,
    DatabaseMutation,
    DatabaseAction,
    CollectionMutation,
    DocumentMutation,
    DocumentMask,
} from '../proto/db3_mutation'
import type { DocumentData, DocumentEntry } from './base'
import { EventMessage } from '../proto/db3_event'
import { BroadcastMeta, ChainId, ChainRole } from '../proto/db3_base'
import { StorageProvider } from '../provider/storage_provider'
import { Wallet } from '../wallet/wallet'
import { DbId } from '../crypto/id'
import { toB64, fromHEX, toHEX } from '../crypto/crypto_utils'
import { Database, Index, StructuredQuery } from '../proto/db3_database'
import { QuerySessionInfo } from '../proto/db3_session'
import * as log from 'loglevel'
import { BSON } from 'db3-bson'

//
//
// the db3 client for developers
//
//
export class DB3Client {
    readonly provider: StorageProvider
    querySessionInfo: QuerySessionInfo | undefined
    sessionToken: string | undefined
    wallet: Wallet
    querySessionEnabled: boolean
    hasCheckedQuerySession: boolean
    /**
     * new a db3 client with db3 node url and wallet
     *
     */
    constructor(url: string, indexer_url: string, wallet: Wallet) {
        this.provider = new StorageProvider(url, indexer_url, wallet)
        this.wallet = wallet
        this.querySessionEnabled = true
        this.hasCheckedQuerySession = false
    }

    /**
     * create a database and return the address of it
     *
     */
    async createDatabase(desc: string = ''): Promise<[string, string]> {
        const meta: BroadcastMeta = {
            nonce: this.provider.getNonce().toString(),
            chainId: ChainId.MainNet,
            chainRole: ChainRole.StorageShardChain,
        }
        const dm: DatabaseMutation = {
            meta,
            collectionMutations: [],
            documentMutations: [],
            dbAddress: new Uint8Array(),
            action: DatabaseAction.CreateDB,
            dbDesc: desc,
        }
        const payload = DatabaseMutation.toBinary(dm)
        const txId = await this.provider.sendMutation(
            payload,
            PayloadType.DatabasePayload
        )
        const dbId = new DbId(this.wallet.getAddress(), +meta.nonce)
        return [dbId.getHexAddr(), txId.getB64()]
    }

    async listDatabases(sender: string) {
        const dbs = await this.provider.listDatabases(sender)
        const new_dbs = dbs.map((x) => ({
            ...x,
            sender: '0x' + toHEX(x.sender),
            address: '0x' + toHEX(x.address),
        }))
        return new_dbs
    }
    /**
     * get a database information
     *
     */
    async getDatabase(addr: string) {
        const response = await this.provider.getDatabase(addr)
        if (response.dbs.length > 0) {
            return response.dbs[0]
        } else {
            return undefined
        }
    }

    async listCollection(databaseAddress: string) {
        const db = await this.getDatabase(databaseAddress)
        return db?.collections
    }

    /**
     * create a collection
     *
     */
    async createCollection(
        databaseAddress: string,
        name: string,
        index: Index[]
    ) {
        const meta: BroadcastMeta = {
            nonce: this.provider.getNonce().toString(),
            chainId: ChainId.MainNet,
            chainRole: ChainRole.StorageShardChain,
        }
        const collection: CollectionMutation = {
            index,
            collectionName: name,
        }
        const dm: DatabaseMutation = {
            meta,
            collectionMutations: [collection],
            documentMutations: [],
            dbAddress: fromHEX(databaseAddress),
            action: DatabaseAction.AddCollection,
            dbDesc: '',
        }
        const payload = DatabaseMutation.toBinary(dm)
        const txId = await this.provider.sendMutation(
            payload,
            PayloadType.DatabasePayload
        )
        return txId.getB64()
    }

    async getState() {
        return await this.provider.getState()
    }

    async getAccount(address: string) {
        const binaryAddr = fromHEX(address)
        return await this.provider.getAccount(binaryAddr)
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

        const meta: BroadcastMeta = {
            nonce: this.provider.getNonce().toString(),
            chainId: ChainId.MainNet,
            chainRole: ChainRole.StorageShardChain,
        }

        const dm: DatabaseMutation = {
            meta,
            action: DatabaseAction.AddDocument,
            dbAddress: fromHEX(databaseAddress),
            collectionMutations: [],
            documentMutations: [documentMutation],
            dbDesc: '',
        }
        const payload = DatabaseMutation.toBinary(dm)
        const txId = await this.provider.sendMutation(
            payload,
            PayloadType.DatabasePayload
        )
        return txId.getB64()
    }

    async getDocument(id: string) {
        const response = await this.provider.getDocument(id)
        return {
            id: toB64(response.document.id),
            doc: BSON.deserialize(response.document.doc),
            owner: '0x' + toHEX(response.document.owner),
            tx: toB64(response.document.txId),
        }
    }

    async runQuery<T>(dbAddress: string, query: StructuredQuery) {
        const response = await this.provider.runQuery(dbAddress, query)
        return response.documents.map(
            (item) =>
                ({
                    doc: BSON.deserialize(item.doc) as T,
                    id: toB64(item.id),
                    owner: '0x' + toHEX(item.owner),
                    tx: toB64(item.txId),
                } as DocumentEntry<T>)
        )
    }

    async subscribe(messageHandle: (e: EventMessage) => void) {
        if (!this.querySessionEnabled) {
            const response = await this.provider.openSession()
            const token = response.sessionToken
            const ctrl = this.provider.subscribe(token, messageHandle)
            return ctrl
        } else {
            const token = await this.keepSessionAlive()
            const ctrl = this.provider.subscribe(token, messageHandle)
            return ctrl
        }
    }

    async deleteDocument(
        databaseAddress: string,
        collectionName: string,
        ids: string[]
    ) {
        const meta: BroadcastMeta = {
            nonce: this.provider.getNonce().toString(),
            chainId: ChainId.MainNet,
            chainRole: ChainRole.StorageShardChain,
        }
        const documentMutation: DocumentMutation = {
            collectionName,
            documents: [],
            ids,
            masks: [],
        }
        const dm: DatabaseMutation = {
            meta,
            collectionMutations: [],
            documentMutations: [documentMutation],
            dbAddress: fromHEX(databaseAddress),
            action: DatabaseAction.DeleteDocument,
            dbDesc: '',
        }
        const payload = DatabaseMutation.toBinary(dm)
        return this.provider.sendMutation(payload, PayloadType.DatabasePayload)
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
        const meta: BroadcastMeta = {
            nonce: this.provider.getNonce().toString(),
            chainId: ChainId.MainNet,
            chainRole: ChainRole.StorageShardChain,
        }
        const documentMask: DocumentMask = {
            fields: masks,
        }
        //TODO add mask
        const documentMutation: DocumentMutation = {
            collectionName,
            documents: [BSON.serialize(document)],
            ids: [id],
            masks: [documentMask],
        }
        const dm: DatabaseMutation = {
            meta,
            collectionMutations: [],
            documentMutations: [documentMutation],
            dbAddress: fromHEX(databaseAddress),
            action: DatabaseAction.UpdateDocument,
            dbDesc: '',
        }
        const payload = DatabaseMutation.toBinary(dm)
        return this.provider.sendMutation(payload, PayloadType.DatabasePayload)
    }

    async keepSessionAlive() {
        if (!this.hasCheckedQuerySession) {
            const state = await this.getState()
            this.querySessionEnabled = state.querySessionEnabled
            this.hasCheckedQuerySession = true
        }

        if (!this.querySessionEnabled) {
            return ''
        }

        if (!this.querySessionInfo || !this.sessionToken) {
            const response = await this.provider.openSession()
            this.sessionToken = response.sessionToken
            this.querySessionInfo = response.querySessionInfo
            log.info('create a new session token ', response.sessionToken)
            return this.sessionToken
        }
        // TODO
        if (this.querySessionInfo.queryCount > 1000) {
            log.info(
                'submit query session with count ',
                this.querySessionInfo.queryCount
            )
            await this.provider.closeSession(
                this.sessionToken,
                this.querySessionInfo
            )
            const response = await this.provider.openSession()
            this.sessionToken = response.sessionToken
            this.querySessionInfo = response.querySessionInfo
            log.info('create a new session token ', response.sessionToken)
            return this.sessionToken
        }
        if (!this.sessionToken) {
            log.warn('no session token')
            throw new Error('sessioToken is not found')
        }
        return this.sessionToken
    }
}
