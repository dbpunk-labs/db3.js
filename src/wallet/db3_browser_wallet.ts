//
// db3_browser_wallet.ts
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

import type { Wallet, WalletType } from './wallet'
import { Ed25519Keypair } from '../crypto/ed25519_keypair'
import { Secp256k1Keypair } from '../crypto/secp256k1_keypair'
import { fromB64 } from '../crypto/crypto_utils'

const WALLET_KEY = '_db3_wallet_key_'
const WALLET_ADDRESS = '_db3_wallet_ADDR_'
export class DB3BrowserWallet implements Wallet {
    keypair: Ed25519Keypair | Secp256k1Keypair
    constructor(keypair: Ed25519Keypair | Secp256k1Keypair) {
        this.keypair = keypair
    }

    sign(message: Uint8Array): Uint8Array {
        return this.keypair.signData(message)
    }

    getAddress(): string {
        return this.keypair.getPublicKey().toAddress()
    }

    static hasKey(): boolean {
        const key = JSON.parse(localStorage.getItem(WALLET_KEY) ?? '{}')
        if (!key.hasOwnProperty('schema')) {
            return false
        }
        return true
    }

    static recover(): DB3BrowserWallet {
        const key = JSON.parse(localStorage.getItem(WALLET_KEY) ?? '{}')
        if (!key.hasOwnProperty('schema')) {
            throw new Error('no key in browser')
        }
        if (key['schema'] == 'Secp256k1') {
            const data = fromB64(key['privateKey'])
            return new DB3BrowserWallet(Secp256k1Keypair.fromSecretKey(data))
        }
        if (key['schema'] == 'ED25519') {
            const data = fromB64(key['privateKey'])
            return new DB3BrowserWallet(Ed25519Keypair.fromSecretKey(data))
        }
        throw new Error('no key in browser')
    }

    static generate(walletType: WalletType): DB3BrowserWallet {
        if (walletType == 'DB3_ED25519') {
            const keypair = Ed25519Keypair.generate()

            const wallet = new DB3BrowserWallet(keypair)
            localStorage.setItem(WALLET_KEY, JSON.stringify(keypair.export()))
            localStorage.setItem(WALLET_ADDRESS, wallet.getAddress())
            return wallet
        }
        if (walletType == 'DB3_SECP259K1') {
            const keypair = Secp256k1Keypair.generate()
            const wallet = new DB3BrowserWallet(keypair)
            localStorage.setItem(WALLET_KEY, JSON.stringify(keypair.export()))
            localStorage.setItem(WALLET_ADDRESS, wallet.getAddress())
            return wallet
        }
        throw new Error('wallet type is not supported')
    }

    static createNew(
        mnemonic: string,
        walletType: WalletType
    ): DB3BrowserWallet {
        if (walletType == 'DB3_ED25519') {
            const keypair = Ed25519Keypair.deriveKeypair(mnemonic)
            localStorage.setItem(WALLET_KEY, JSON.stringify(keypair.export()))
            return new DB3BrowserWallet(keypair)
        }
        if (walletType == 'DB3_SECP259K1') {
            const keypair = Secp256k1Keypair.deriveKeypair(mnemonic)
            localStorage.setItem(WALLET_KEY, JSON.stringify(keypair.export()))
            return new DB3BrowserWallet(keypair)
        }
        throw new Error('wallet type is not supported')
    }
}
