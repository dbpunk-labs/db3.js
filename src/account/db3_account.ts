//
// db3_account.ts
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

import type { WalletClient, SignTypedDataParameters, Address, Hex } from 'viem'
import * as secp from '@noble/secp256k1'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { toHEX } from '../crypto/crypto_utils'

export class DB3Account {
    readonly client: WalletClient
    readonly address: Address

    constructor(client: WalletClient, address: Address) {
        this.client = client
        this.address = address
    }

    static genRandomAccount(): DB3Account {
        const rawKey = '0x' + toHEX(secp.utils.randomPrivateKey())
        return DB3Account.createFromPrivateKey(rawKey as Hex)
    }

    static createFromPrivateKey(privateKey: Hex): DB3Account {
        const account = privateKeyToAccount(privateKey)
        const client = createWalletClient({
            account,
            chain: mainnet,
            transport: http(),
        })
        const addr = account.address
        return new DB3Account(client, addr)
    }

    //
    // get the current account address
    //
    getAddress() {
        return this.address
    }

    //
    // sign the data with eip712
    //
    async sign(data: SignTypedDataParameters) {
        return await this.client.signTypedData(data)
    }
}
