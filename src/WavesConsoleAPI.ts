import * as wt from '@waves/waves-transactions';
import {  TSeedTypes, TTx} from '@waves/waves-transactions/';
import { compile as cmpl } from '@waves/ride-js';
import { TSchemaType } from '../scripts/buildHelp';

const envFuncsSchema = require('./schemas/envFunctions.json');

export class WavesConsoleAPI {
    static env: any;

    [key: string]: any;

    public static setEnv(env: any) {
        WavesConsoleAPI.env = env;
    }

    public broadcast = (tx: TTx, apiBase?: string) => wt.broadcast(tx, apiBase || WavesConsoleAPI.env.API_BASE);

    public file = (tabName?: string): string => {
        if (typeof WavesConsoleAPI.env.file !== 'function') {
            throw new Error('File content API is not available. Please provide it to the console');
        }
        return WavesConsoleAPI.env.file(tabName);
    };

    public contract = (): string => this.file();


    public compile = (code: string): string => {
        const resultOrError = cmpl(code);
        if ('error' in resultOrError) throw new Error(resultOrError.error);

        return resultOrError.result.base64;
    };

    public deploy = async (params?: { fee?: number, senderPublicKey?: string, script?: string }, seed?: TSeedTypes) => {
        let txParams = {additionalFee: 400000, script: this.compile(this.contract()), ...params};

        const setScriptTx = this['setScript'](txParams, seed);
        return this['broadcast'](setScriptTx);
    };

    public help = (func?: Function) => {
        let pos: number = -1;
        let al0: string = '';
        let type: string = typeof func;
        let aliases: Array<string> = [];

        // Try to find function name
        for (al0 in this) {
            if ((type == 'undefined' || func == this[al0])) {
                aliases.push(al0);
            }
        }

        // Sort functions list and move help help to the top
        if (aliases.length > 1) {
            aliases.sort((a, b) => {
                if (a > b) {
                    return 1;
                } else if (a < b) {
                    return -1;
                } else {
                    return 0;
                }
            });

            // Get position of help in list
            pos = aliases.indexOf('help');

            // Move help to the top of list
            aliases.unshift(aliases.splice(pos, 1)[0]);
        }
        return (envFuncsSchema as TSchemaType[]).filter(({name}: TSchemaType) => aliases.includes(name));
    };

}
