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

import dcrypto from '@deliberative/crypto'
import sha3 from 'js-sha3'

export async function generateKey() {
    const mnemonic = await dcrypto.generateMnemonic()
    const keypair = await dcrypto.keyPairFromMnemonic(mnemonic)
    return [keypair.secretKey, keypair.publicKey]
}

export async function getATestStaticKeypair() {
    const mnemonic =
        'prefer name genius napkin pig tree twelve blame meat market market soda'
    const keypair = await dcrypto.keyPairFromMnemonic(mnemonic)
    return [keypair.secretKey, keypair.publicKey]
}

export async function sign(data: Uint8Array, privateKey: Uint8Array) {
    const signature = await dcrypto.sign(data, privateKey)
    return signature
}

export async function getAddress(publicKey: Uint8Array) {
    return '0x' + sha3.keccak_256(publicKey.subarray(1)).substring(24)
}
