import { DB3Transaction } from "./DB3Transaction";
import { DStringList } from "./DStringList";

export class DB3Database implements IDBDatabase {
	constructor() {
		this.name = "";
		this.objectStoreNames = new DStringList();
		this.version = 1;
	}
	name: string;
	objectStoreNames: DOMStringList;
	version: number;
	close() {}
	transaction(
		storeNames: string | string[],
		mode?: IDBTransactionMode | undefined,
		options?: IDBTransactionOptions | undefined,
	) {
		return new DB3Transaction();
	}
	onabort() {}
	onerror() {}
	onclose() {}
	onversionchange() {}
	createObjectStore(
		name: string,
		options?: IDBObjectStoreParameters | undefined,
	): any {}
	deleteObjectStore(name: string): void {}
	addEventListener(
		type: unknown,
		listener: unknown,
		options?: unknown,
	): void {}
	removeEventListener(
		type: unknown,
		listener: unknown,
		options?: unknown,
	): void {}
	dispatchEvent(event: Event): boolean {
		return true;
	}
}