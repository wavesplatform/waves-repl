import * as wt from 'waves-transactions'
import {keyPair, KeyPair, address} from 'waves-crypto'

import Axios from 'axios';
import {compile as cmpl} from "@waves/ride-js"
import {SET_SCRIPT, TRANSACTION_TYPE_NUMBER} from "./crypto";

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

    public contract = (): string => WavesConsoleAPI.env.editors[WavesConsoleAPI.env.selectedEditor]

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

    public broadcast = (tx: any) => {
        return Axios.post(WavesConsoleAPI.env.API_BASE + 'transactions/broadcast', tx)
            .then(x => x.data)
            .catch(x => x.response.data)
    }

    private bufferToBase64(buf) {
        const binstr = Array.prototype.map.call(buf, ch => String.fromCharCode(ch)).join('');
        return btoa(binstr)
    }

    // TEMPORARY!!!!
    public setScript = (params: {
                            script: string,
                            fee: number,
                            timestamp: number
                            version: number,
                            chainId: string
                        }
    ) => {
        let {script, fee, timestamp, version, chainId} = params
        fee = fee || 1000000
        timestamp = timestamp || Date.now()
        chainId = WavesConsoleAPI.env.CHAIN_ID.charCodeAt(0)
        version = version || 1
        const tx: any = {
            type: TRANSACTION_TYPE_NUMBER.SET_SCRIPT,
            version,
            senderPublicKey: this.publicKey(undefined),
            script: 'base64:' + script,
            fee,
            timestamp
        }

        const signature = new SET_SCRIPT({
            chainId,
            fee,
            script: tx.script,
            senderPublicKey: tx.senderPublicKey,
            timestamp
        }).getSignature(this.privateKey(undefined))

        return {
            ...tx, fee, proofs: [signature]
        }
    }
}