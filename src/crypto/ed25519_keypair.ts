//
// ed25519_keypair.ts
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

import nacl from 'tweetnacl'
import type { Keypair } from './keypair'
import { SignatureScheme } from './publickey'

export const DEFAULT_ED25519_DERIVATION_PATH = "m/44'/784'/0'/0'/0'"

/**
 * Ed25519 Keypair data
 */
export interface Ed25519KeypairData {
    publicKey: Uint8Array
    secretKey: Uint8Array
}

export class Ed25519Keypair implements Keypair {
    /**
     * Create a new Ed25519 keypair instance.
     * Generate random keypair if no {@link Ed25519Keypair} is provided.
     *
     * @param keypair Ed25519 keypair
     */
    constructor(keypair?: Ed25519KeypairData) {
        if (keypair) {
            this.keypair = keypair
        } else {
            this.keypair = nacl.sign.keyPair()
        }
    }

    /**
     * Generate a new Ed25519 keypair instance.
     *
     */
    static generate(): Ed25519Keypair {
        return new Ed25519Keypair(nacl.sign.keyPair())
    }

    /**
     * Get the key scheme of the keypair ED25519
     */
    getKeyScheme(): SignatureScheme {
        return 'ED25519'
    }

    /**
     * Generate an Ed25519 keypair from a 32 byte seed.
     *
     * @param seed seed byte array
     */
    static fromSeed(seed: Uint8Array): Ed25519Keypair {
        const seedLength = seed.length
        if (seedLength != 32) {
            throw new Error(
                `Wrong seed size. Expected 32 bytes, got ${seedLength}.`
            )
        }
        return new Ed25519Keypair(nacl.sign.keyPair.fromSeed(seed))
    }

    export(): ExportedKeypair {
        return {
            schema: 'ED25519',
            privateKey: toB64(this.keypair.secretKey),
        }
    }
}
