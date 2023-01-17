/**
 * Copyright 2023 db3 network
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
