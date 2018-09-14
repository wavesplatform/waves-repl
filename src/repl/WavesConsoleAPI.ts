import * as wt from 'waves-transactions'
import Axios from 'axios';
import {compile as cmpl} from "@waves/ride-js"

export interface KeyPair {
    public: string
    private: string
}

export class WavesConsoleAPI {
    static env: any;

    public static setEnv(env: any) {
        WavesConsoleAPI.env = env;
    }

    constructor() {
        Object.keys(wt).forEach(key => {
            this[key] = (params) => wt[key](WavesConsoleAPI.env.SEED, params)
        })
    }

    public compile = (code: string): string => {
        const r = cmpl(code)
        if (r.error)
            return r.error
        return this.bufferToBase64(new Uint8Array(r.result))
    }

    public broadcast = (tx: any) => {
        return Axios.post(WavesConsoleAPI.env.API_BASE + 'transactions/broadcast', tx)
            .then(x => x.data)
            .catch(x => x.response.data)
    }

    private bufferToBase64(buf) {
        const binstr = Array.prototype.map.call(buf, ch => String.fromCharCode(ch)).join('');
        return btoa(binstr)
    }
}

// const api = new WavesConsoleAPI()
// console.log(Object.getOwnPropertyNames(api))