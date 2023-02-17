import { DB3Client } from '../client/client'
import { Wallet } from '../wallet/wallet'
import { DB3Store } from './database'

export function initializeDB3(
    node: string,
    dbAddress: string,
    wallet: Wallet
): DB3Store {
    const dbClient = new DB3Client(node, wallet)
    return new DB3Store(dbAddress, dbClient)
}
