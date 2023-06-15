/**
 * Copyright 2023 db3 network
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//export { Account } from './proto/db3_account'
//export { Index, Database } from './proto/db3_database'
//export { EventMessage, EventType } from './proto/db3_event'
//export { DB3BrowserWallet } from './wallet/db3_browser_wallet'
//export { MetamaskWallet } from './wallet/metamask'
//export { DB3Client } from './client/client'
//export { initializeDB3, listMyDatabases, listDatabases } from './store/app'
////export { DB3Store } from './store/database'
//export { collection, CollectionReference } from './store/collection'
//export {
//    addDoc,
//    getDocs,
//    deleteDoc,
//    updateDoc,
//    DocumentReference,
//} from './store/document'
//export { limit, where, query } from './store/query'
//export { DB3Network } from './store/network'

//===================v2======================

export {
    createFromPrivateKey,
    createRandomAccount,
    signTypedData,
} from './account/db3_account'

export { addDoc, updateDoc, deleteDoc, queryDoc } from './store/document_v2'

export {
    createClient,
    syncAccountNonce,
    getMutationHeader,
    getMutationBody,
    scanMutationHeaders,
    scanGcRecords,
    scanRollupRecords,
} from './client/client_v2'

export {
    createDocumentDatabase,
    showDatabase,
    createCollection,
    showCollection,
} from './store/database_v2'

export { Index, IndexType } from './proto/db3_database_v2'
