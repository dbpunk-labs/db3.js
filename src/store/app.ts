import { Wallet } from '../wallet/wallet'
import { DB3Store } from './database'

export function initializeApp(
    node: string,
    dbAddress: string,
    wallet: Wallet
): DB3Store {
    return new DB3Store(node, dbAddress, wallet)
}
