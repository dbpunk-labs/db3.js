import { DB3Database } from "./DB3Database";
import { DB3ObjectStore } from "./DB3ObjectStore";
import { DStringList } from "./DStringList";

export class DB3Transaction implements IDBTransaction {
	constructor() {
		this.db = new DB3Database();
		this.durability = "default";
		this.error = null;
		this.objectStoreNames = new DStringList();
		this.mode = "readonly";
	}
	mode: IDBTransactionMode;
	readonly durability: IDBTransactionDurability;
	readonly db: IDBDatabase;
	readonly error: DOMException | null;
	readonly objectStoreNames: DOMStringList;

	onabort() {}
	oncomplete() {}
	onerror() {}
	abort() {}
	commit() {}
	objectStore(name: string) {
		return new DB3ObjectStore();
	}
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