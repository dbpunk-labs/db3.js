import { DB3Store } from './database'
import { DocumentData, DocumentReference } from './document'
import { Query } from './query'

export class CollectionReference<T = DocumentData> extends Query<T> {
    readonly type = 'collection'
    get name(): string {
        return ''
    }
    get address(): string {
        return ''
    }
}

export function collection(
    db: DB3Store,
    address: string
): CollectionReference<DocumentData>

export function collection(
    db: DB3Store,
    address: string
): CollectionReference<DocumentData> {
    return new CollectionReference(db)
}
