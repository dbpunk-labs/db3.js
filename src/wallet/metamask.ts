//
// metamask.ts
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

import { Buffer } from 'buffer'
import type { Wallet, WalletType } from './wallet'
import { SIGNATURE_SCHEME_TO_FLAG } from '../crypto/publickey'
import {
    TypedDataUtils,
    TypedMessage,
    MessageTypes,
    SignTypedDataVersion,
} from '@metamask/eth-sig-util'
import { fromRpcSig, setLengthLeft } from '@ethereumjs/util'
import { toHEX } from '../crypto/crypto_utils'
import { Secp256k1PublicKey } from '../crypto/secp256k1_publickey'
import { recoverPublicKey } from '@noble/secp256k1'

interface Window {
    ethereum: any
}

const SECP256K1_SIGNATURE_LEN = 65
const SECP256K1_PUBLIC_LEN = 33
const DB3_SECP256K1_SIGNATURE_LEN =
    SECP256K1_SIGNATURE_LEN + SECP256K1_PUBLIC_LEN + 1

export interface TypedData {
    [field: string]: any
}

export class MetamaskWallet implements Wallet<TypedData, Promise<Uint8Array>> {
    readonly window: Window
    private addr: string
    private publicKey: Secp256k1PublicKey | undefined

    constructor(window: Window) {
        this.window = window
        this.addr = ''
        this.publicKey = undefined
    }

    async connect() {
        if (this.addr.length == 0) {
            const response = await this.window.ethereum.request({
                method: 'eth_requestAccounts',
            })
            this.addr = response[0]
            await this.generateAddr()
        }
    }

    getAddress(): string {
        return this.publicKey!.toAddress()
    }

    getEvmAddress(): string {
        return this.addr
    }

    getType(): WalletType {
        return 'MetaMask'
    }

    private async generateAddr() {
        const message = {
            types: {
                EIP712Domain: [],
                Message: [{ name: 'action', type: 'string' }],
            },
            domain: {},
            primaryType: 'Message',
            message: {
                action: 'generate db3 addr',
            },
        }
        const msgParams = JSON.stringify(message)
        const from = this.addr
        const sig = await this.window.ethereum.request({
            method: 'eth_signTypedData_v3',
            params: [from, msgParams],
        })
        const hashedmsg = TypedDataUtils.eip712Hash(
            message as TypedMessage<MessageTypes>,
            SignTypedDataVersion.V3
        )
        const { v, r, s } = fromRpcSig(sig)
        const rid = this.calculateSigRecovery(v)
        const signatureBuffer = new Uint8Array(64)
        signatureBuffer.set(r, 0)
        signatureBuffer.set(s, 32)
        const publicKey = recoverPublicKey(
            hashedmsg,
            signatureBuffer,
            Number(rid),
            true
        )
        this.publicKey = new Secp256k1PublicKey(publicKey)
        return this.publicKey.toAddress()
    }

    async sign(message: TypedData): Promise<Uint8Array> {
        const msgParams = JSON.stringify(message)
        const from = this.addr
        const sig = await this.window.ethereum.request({
            method: 'eth_signTypedData_v3',
            params: [from, msgParams],
        })
        const hashedmsg = TypedDataUtils.eip712Hash(
            message as TypedMessage<MessageTypes>,
            SignTypedDataVersion.V3
        )
        const { v, r, s } = fromRpcSig(sig)
        const rid = this.calculateSigRecovery(v)
        const signatureBuffer = new Uint8Array(64)
        signatureBuffer.set(r, 0)
        signatureBuffer.set(s, 32)
        const publicKey = recoverPublicKey(
            hashedmsg,
            signatureBuffer,
            Number(rid),
            true
        )
        const buf = new Uint8Array(DB3_SECP256K1_SIGNATURE_LEN)
        buf[0] = SIGNATURE_SCHEME_TO_FLAG['Secp256k1']
        buf.set(signatureBuffer, 1)
        buf.set([Number(rid)], 65)
        buf.set(publicKey, 66)
        return buf
    }

    calculateSigRecovery(v: bigint, chainId?: bigint): bigint {
        if (v === BigInt(0) || v === BigInt(1)) return v

        if (chainId === undefined) {
            return v - BigInt(27)
        }
        return v - (chainId * BigInt(2) + BigInt(35))
    }
}
