export class DStringList implements DOMStringList {
    constructor() {
        this.length = 1
    }
    length: number;
    [index: number]: string
    contains(string: string): boolean {
        return true
    }
    item() {
        return null
    }
    *[Symbol.iterator]() {
        return ''
    }
}
