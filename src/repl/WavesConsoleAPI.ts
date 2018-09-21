import * as wt from 'waves-transactions'
import {keyPair, KeyPair, address} from 'waves-crypto'

import Axios from 'axios';
import {compile as cmpl} from "@waves/ride-js"

export class WavesConsoleAPI {
    static env: any;

    public static setEnv(env: any) {
        WavesConsoleAPI.env = env;
    }

    constructor() {
        Object.keys(wt).forEach(key => {
            this[key] = (params, seed) => wt[key](seed || WavesConsoleAPI.env.SEED,
                {...params, chainId: WavesConsoleAPI.env.CHAIN_ID})
        })
    }

    public file = (tabName: string): string =>
        (WavesConsoleAPI.env.editors.filter(e => e.label == tabName)[0] || {code: ''}).code

    public contract = (): string => {
        try {
            return  WavesConsoleAPI.env.editors[WavesConsoleAPI.env.selectedEditor].code
        }catch (e) {
            return ''
        }
    }

    public keyPair = (seed: string): KeyPair => keyPair(seed || WavesConsoleAPI.env.SEED)

    public publicKey = (seed: string): string =>
        this.keyPair(seed).public

    public privateKey = (seed: string): string =>
        this.keyPair(seed).private

    public address = (keyPairOrSeed: KeyPair | string) => address(
        keyPairOrSeed || WavesConsoleAPI.env.SEED,
        WavesConsoleAPI.env.CHAIN_ID
    )

    public compile = (code: string): string => {
        const r = cmpl(code)
        if (r.error)
            return r.error
        return this.bufferToBase64(new Uint8Array(r.result))
    }

    public broadcast = async (tx: any) => {
        const url = new URL('transactions/broadcast', WavesConsoleAPI.env.API_BASE).href;
        const resp = await Axios.post(url, tx)
        return resp.data
    }

    private bufferToBase64(buf) {
        const binstr = Array.prototype.map.call(buf, ch => String.fromCharCode(ch)).join('');
        return btoa(binstr)
    }
}