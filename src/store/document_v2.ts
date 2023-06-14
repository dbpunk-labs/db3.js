//
// document_v2.ts
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
    DocumentMutation,
    DocumentMask,
    Mutation_BodyWrapper,
    MutationAction,
} from '../proto/db3_mutation_v2'
import { BSON } from 'db3-bson'

import { fromHEX } from '../crypto/crypto_utils'

import type { Collection, DocumentData } from './types'

export async function deleteDoc(col: Collection, ids: string[]) {
    const documentMutation: DocumentMutation = {
        collectionName: col.name,
        documents: [],
        ids,
        masks: [],
    }
    const body: Mutation_BodyWrapper = {
        body: {
            oneofKind: 'documentMutation',
            documentMutation,
        },
        dbAddress: fromHEX(col.db.addr),
    }

    const dm: Mutation = {
        action: MutationAction.DeleteDocument,
        bodies: [body],
    }

    const payload = Mutation.toBinary(dm)
    const response = await col.db.client.provider.sendMutation(
        payload,
        col.db.client.nonce.toString()
    )

    if (response.code == 0) {
        col.db.client.nonce += 1
        return [response.id, response.block, response.order]
    } else {
        throw new Error('fail to create collection')
    }
}
export async function updateDoc(
    col: Collection,
    id: string,
    doc: DocumentData,
    masks: string[]
) {
    const documentMask: DocumentMask = {
        fields: masks,
    }
    const documentMutation: DocumentMutation = {
        collectionName: col.name,
        documents: [BSON.serialize(doc)],
        ids: [id],
        masks: [documentMask],
    }
    const body: Mutation_BodyWrapper = {
        body: {
            oneofKind: 'documentMutation',
            documentMutation,
        },
        dbAddress: fromHEX(col.db.addr),
    }
    const dm: Mutation = {
        action: MutationAction.UpdateDocument,
        bodies: [body],
    }
    const payload = Mutation.toBinary(dm)
    const response = await col.db.client.provider.sendMutation(
        payload,
        col.db.client.nonce.toString()
    )
    if (response.code == 0) {
        col.db.client.nonce += 1
        return [response.id, response.block, response.order]
    } else {
        throw new Error('fail to create collection')
    }
}
export async function addDoc(col: Collection, doc: DocumentData) {
    const documentMutation: DocumentMutation = {
        collectionName: col.name,
        documents: [BSON.serialize(doc)],
        ids: [],
        masks: [],
    }
    const body: Mutation_BodyWrapper = {
        body: {
            oneofKind: 'documentMutation',
            documentMutation,
        },
        dbAddress: fromHEX(col.db.addr),
    }

    const dm: Mutation = {
        action: MutationAction.AddDocument,
        bodies: [body],
    }

    const payload = Mutation.toBinary(dm)
    const response = await col.db.client.provider.sendMutation(
        payload,
        col.db.client.nonce.toString()
    )
    if (response.code == 0) {
        col.db.client.nonce += 1
        return [response.id, response.block, response.order]
    } else {
        throw new Error('fail to create collection')
    }
}
