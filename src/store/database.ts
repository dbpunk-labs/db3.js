import { Wallet } from '../wallet/wallet'

export class DB3Store {
    readonly node: string
    readonly dbAddress: string
    readonly wallet: Wallet
    constructor(node: string, dbAddress: string, wallet: Wallet) {
        this.node = node
        this.dbAddress = dbAddress
        this.wallet = wallet
    }
}
