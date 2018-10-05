import * as wt from 'waves-transactions'
import {keyPair, KeyPair, address} from 'waves-crypto'
import Axios from 'axios'
import {compile as cmpl} from "@waves/ride-js"

export class WavesConsoleAPI {
    static env: any;

    [key: string]: any;

    public static setEnv(env: any) {
        WavesConsoleAPI.env = env;
    }

    constructor() {
        Object.keys(wt).forEach(key => {
            this[key] = (params: any, seed: any) => (wt as any)[key](seed || WavesConsoleAPI.env.SEED,
                {...params, chainId: WavesConsoleAPI.env.CHAIN_ID})
        })
    }

    public file = (tabName: string): string =>
        (WavesConsoleAPI.env.editors.filter((e: any) => e.label == tabName)[0] || {code: ''}).code

    public contract = (): string => {
        try {
            return WavesConsoleAPI.env.editors[WavesConsoleAPI.env.selectedEditor].code
        } catch (e) {
            throw new Error('No active contract tab found')
        }
    };

    public keyPair = (seed: string): KeyPair => keyPair(seed || WavesConsoleAPI.env.SEED)

    public publicKey = (seed: string): string =>
        this.keyPair(seed).public;

    public privateKey = (seed: string): string =>
        this.keyPair(seed).private;

    public address = (keyPairOrSeed: KeyPair | string) => address(
        keyPairOrSeed || WavesConsoleAPI.env.SEED,
        WavesConsoleAPI.env.CHAIN_ID
    );

    public compile = (code: string): string => {
        const r = cmpl(code);
        if (r.error)
            throw new Error(r.error);
        return this.bufferToBase64(new Uint8Array(r.result));
    };

    public broadcast = async (tx: any) => {
        const url = new URL('transactions/broadcast', WavesConsoleAPI.env.API_BASE).href;
        const resp = await Axios.post(url, tx);
        return resp.data
    };

    public deploy = async (params?: { fee?: number, senderPublicKey?: string, script?: string }, seed?: string | string[]) => {
        let txParams = params || {};
        txParams.script = txParams.script === undefined ? this.compile(this.contract()) : txParams.script;

        const setScriptTx = this['setScript'](txParams, seed);
        return this.broadcast(setScriptTx);
    };

    private bufferToBase64(buf: Uint8Array) {
        const binstr = Array.prototype.map.call(buf, (ch: number) => String.fromCharCode(ch)).join('');
        return btoa(binstr)
    }
}