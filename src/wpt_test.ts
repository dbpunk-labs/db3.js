// @ts-nocheck
import { DB3Factory } from './lib/DB3Factory'
import { generateKey, sign } from './lib/keys'
globalThis.DB3Factory = DB3Factory
globalThis.__sign = sign
globalThis.__generateKey = generateKey
