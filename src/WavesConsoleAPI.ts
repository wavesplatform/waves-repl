import * as wt from '@waves/waves-transactions';
import { libs, TSeedTypes, TTx, TTxParams } from '@waves/waves-transactions/';
import { compile as cmpl } from '@waves/ride-js';

const {keyPair, address, stringToUint8Array, signBytes} = wt.libs.crypto;

export type TSignature = {
    name: string
    args: TArg[]
    doc?: string
    description?: string
};

export type TArg = {
    name: string
    type: string
    doc?: string
};

export class WavesConsoleAPI {
    static env: any;

    [key: string]: any;

    private static injectEnv = <T extends (pp: any, ...args: any) => any>(f: T) => (po: TTxParams, seed?: TSeedTypes | null): ReturnType<typeof f> =>
        f({chainId: WavesConsoleAPI.env.CHAIN_ID, ...po}, seed === null ? null : seed || WavesConsoleAPI.env.SEED);

    public static setEnv(env: any) {
        WavesConsoleAPI.env = env;
    }

    private currentAddress() {
        return libs.crypto.address(WavesConsoleAPI.env.SEED, WavesConsoleAPI.env.CHAIN_ID);
    }

    private bufferToBase64(buf: Uint8Array) {
        const binstr = Array.prototype.map.call(buf, (ch: number) => String.fromCharCode(ch)).join('');
        return btoa(binstr);
    }

    public alias = WavesConsoleAPI.injectEnv(wt.alias);

    public burn = WavesConsoleAPI.injectEnv(wt.burn);

    public cancelLease = WavesConsoleAPI.injectEnv(wt.cancelLease);

    public cancelOrder = WavesConsoleAPI.injectEnv(wt.cancelOrder);

    public data = WavesConsoleAPI.injectEnv(wt.data);

    public issue = WavesConsoleAPI.injectEnv(wt.issue);

    public reissue = WavesConsoleAPI.injectEnv(wt.reissue);

    public lease = WavesConsoleAPI.injectEnv(wt.lease);

    public massTransfer = WavesConsoleAPI.injectEnv(wt.massTransfer);

    public order = WavesConsoleAPI.injectEnv(wt.order);

    public transfer = WavesConsoleAPI.injectEnv(wt.transfer);

    public setScript = WavesConsoleAPI.injectEnv(wt.setScript);

    public setAssetScript = WavesConsoleAPI.injectEnv(wt.setAssetScript);

    public invokeScript = WavesConsoleAPI.injectEnv(wt.invokeScript);

    public sponsorship = WavesConsoleAPI.injectEnv(wt.sponsorship);

    public signTx = WavesConsoleAPI.injectEnv(wt.signTx);

    public stringToUint8Array = stringToUint8Array;

    public signBytes = (bytes: Uint8Array, seed?: string) => signBytes(bytes, seed || WavesConsoleAPI.env.SEED);

    public balance = (address?: string, apiBase?: string) =>
        wt.nodeInteraction.balance(address || this.currentAddress(), apiBase || WavesConsoleAPI.env.API_BASE);

    public assetBalance = async (assetId: string, address?: string, apiBase?: string) =>
        wt.nodeInteraction.assetBalance(assetId, address || this.currentAddress(), apiBase || WavesConsoleAPI.env.API_BASE);

    public balanceDetails = async (address?: string, apiBase?: string) =>
        wt.nodeInteraction.balanceDetails(address || this.currentAddress(), apiBase || WavesConsoleAPI.env.API_BASE);


    public accountData = (address?: string, apiBase?: string) =>
        wt.nodeInteraction.accountData(address || this.currentAddress(), apiBase || WavesConsoleAPI.env.API_BASE);

    public accountDataByKey = (key: string, address?: string, apiBase?: string) =>
        wt.nodeInteraction.accountDataByKey(key, address || this.currentAddress(), apiBase || WavesConsoleAPI.env.API_BASE);

    public currentHeight = async (apiBase?: string) =>
        wt.nodeInteraction.currentHeight(apiBase || WavesConsoleAPI.env.API_BASE);

    public broadcast = (tx: TTx, apiBase?: string) => wt.broadcast(tx, apiBase || WavesConsoleAPI.env.API_BASE);

    public file = (tabName?: string): string => {
        if (typeof WavesConsoleAPI.env.file !== 'function') {
            throw new Error('File content API is not available. Please provide it to the console');
        }
        return WavesConsoleAPI.env.file(tabName);
    };

    public contract = (): string => this.file();

    public keyPair = (seed?: string) => keyPair(seed || WavesConsoleAPI.env.SEED);

    public publicKey = (seed?: string): string =>
        this.keyPair(seed).public;

    public privateKey = (seed: string): string =>
        this.keyPair(seed).private;

    public address = (seed?: string, chainId?: string) => address(
        seed || WavesConsoleAPI.env.SEED,
        chainId || WavesConsoleAPI.env.CHAIN_ID
    );

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

    public help = (func?: Function): TSignature[] | string => {
        let
            pos: number = -1,
            al0: string = '',
            type: string = typeof func,
            params: Array<any> = [],
            aliases: Array<string> = [];

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
                }

                return 0;
            });

            // Get position of help in list
            pos = aliases.indexOf('help');

            // Move help to the top of list
            aliases.unshift(aliases.splice(pos, 1)[0]);
        }

        // Compile help text from pieces
        return WavesConsoleAPIHelp.compileText(aliases);
    };

}

/**
 * Item for commands list
 *
 * @interface IWavesConsoleAPIHelpCommand
 */
export interface IWavesConsoleAPIHelpCommand {
    readonly summary?: string,
    readonly description?: string,
    readonly params?: Array<string> | null
}

/**
 * Item for variables types list
 *
 * @interface IWavesConsoleAPIHelpVariable
 */
export interface IWavesConsoleAPIHelpVariable {
    readonly optional?: boolean,
    readonly type?: string,
    readonly summary?: string
}

/**
 * Item for common texts pieces (headers, etc)
 *
 * @interface IWavesConsoleApiHelpCommon
 */
export interface IWavesConsoleApiHelpCommon {
    readonly header?: string,
    readonly summary?: string
}

/**
 * Help parsers and text compilers
 *
 * @static
 * @class WavesConsoleAPIHelp
 */
export class WavesConsoleAPIHelp {

    /**
     * Common texts pieces
     *
     * @static
     * @member {object} common
     */
    public static common: { [key: string]: IWavesConsoleApiHelpCommon } = {
        list: {
            header: 'Available functions:'
        },
        args: {
            header: 'Arguments:'
        }
    };

    /**
     * Commands descriptions vocabulary
     *
     * @static
     * @member {object} texts
     */
    public static texts: { [key: string]: IWavesConsoleAPIHelpCommand } = {
        balance: {
            summary: '' +
                'Retrieve information about waves account balance',
            description: '' +
                'Returns Promise<number>.',
            params: ['address', 'nodeUrl']
        },
        assetBalance: {
            summary: '' +
                'Retrieve information about asset account balance',
            description: '' +
                'Returns Promise<number>.',
            params: ['assetId', 'address', 'nodeUrl']
        },
        balanceDetails: {
            summary: '' +
                'Retrieve full waves balance details',
            description: '' +
                'Returns Promise<Object>.',
            params: ['address', 'nodeUrl']
        },
        accountData: {
            summary: '' +
                'Get all data from account dictionary ',
            description: '' +
                'Returns Promise<Object>.',
            params: ['address', 'nodeUrl']
        },
        accountDataByKey: {
            summary: '' +
                'Get data from account dictionary by key',
            description: '' +
                'Returns Promise<Data>.',
            params: ['key', 'address', 'nodeUrl']
        },
        clear: {
            summary: '' +
                'clear console;',
            description: '' +
                '',
            params: null
        },
        file: {
            summary: '' +
                'Gets editor contents for tab',
            description: '' +
                'Used inside web-ide or vscode plugin.',
            params: ['tabName']
        },
        data: {
            summary: '' +
                'Creates signed data transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed DataTransaction as a second argument.',
            params: ['params', 'seed']
        },
        issue: {
            summary: '' +
                'Creates signed issue transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed IssueTransaction as a second argument.',
            params: ['params', 'seed']
        },
        order: {
            summary: '' +
                'Creates and signs Order for exchange transactions',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign order accordingly and will ' +
                'add one proof per seed. Also you can use already signed ' +
                'Order as a second argument.',
            params: ['params', 'seed']
        },
        contract: {
            summary: '' +
                'Open editor tab content',
            description: '' +
                '',
            params: null
        },
        keyPair: {
            summary: '' +
                'Generates keyPair from seed',
            description: '' +
                '',
            params: ['seed']
        },
        publicKey: {
            summary: '' +
                'Generates publicKey from seed',
            description: '' +
                '',
            params: ['seed']
        },
        privateKey: {
            summary: '' +
                'Generates privateKey from seed',
            description: '' +
                '',
            params: ['seed']
        },
        address: {
            summary: '' +
                'Generates address from seed',
            description: '' +
                '',
            params: ['seed']
        },
        compile: {
            summary: '' +
                'Gets editor contents for tab',
            description: '' +
                'Accepts plain text of a contract as an argument. Returns compiled contract in base64.',
            params: ['code']
        },
        broadcast: {
            summary: '' +
                'Sends transaction to the Waves network using REST API',
            description: '' +
                'Returns Promise.',
            params: ['tx', 'apiBase']
        },
        deploy: {
            summary: '' +
                'Compile currently selected contract and deploy it to default account',
            description: '' +
                '',
            params: ['params', 'seed']
        },
        help: {
            summary: '' +
                'Help for the available API functions',
            description: '' +
                'You can use help() to get list of available functions ' +
                'or help(functionName) to get info for the specified function.',
            params: ['func']
        },
        transfer: {
            summary: '' +
                'Creates signed transfer transaction',
            description: '' +
                '',
            params: ['params', 'seed']
        },
        massTransfer: {
            summary: '' +
                'Creates signed massTransfer transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed MassTransferTransaction as a second argument.',
            params: ['params', 'seed']
        },
        reissue: {
            summary: '' +
                'Creates signed reissue transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use already ' +
                'signed ReissueTransaction as a second argument.',
            params: ['params', 'seed']
        },
        burn: {
            summary: '' +
                'Creates signed burn transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed BurnTransaction as a second argument.',
            params: ['params', 'seed']
        },
        lease: {
            summary: '' +
                'Creates signed lease transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed LeaseTransaction as a second argument.',
            params: ['params', 'seed']
        },
        cancelLease: {
            summary: '' +
                'Creates signed cancelLease transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed CancelLeaseTransaction as a second argument.',
            params: ['params', 'seed']
        },
        cancelOrder: {
            summary: '' +
                'Creates signed cancelOrder request',
            description: '' +
                '',
            params: ['params', 'seed']
        },
        alias: {
            summary: '' +
                'Creates signed createAlias transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed AliasTransaction as a second argument.',
            params: ['params', 'seed']
        },
        setScript: {
            summary: '' +
                'Creates signed setScript transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed SetScriptTransaction as a second argument.',
            params: ['params', 'seed']
        },
        sponsorship: {
            summary: '' +
                'Creates signed setSponsorship transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed SetAssetScriptTransaction as a second argument.',
            params: ['params', 'seed']
        },
        setAssetScript: {
            summary: '' +
                'Creates signed setAssetScript transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed SetAssetScriptTransaction as a second argument.',
            params: ['params', 'seed']
        },
        invokeScript: {
            summary: '' +
                'Creates signed invokeScript transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed CancelLeaseTransaction as a second argument.',
            params: ['params', 'seed']
        },
        signTx: {
            summary: '' +
                'Signs previously created transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed',
            params: ['tx', 'seed']
        }
    };

    /**
     * Variables types vocabulary
     *
     * @static
     * @member {object} types
     */
    public static types: { [key: string]: IWavesConsoleAPIHelpVariable } = {
        tx: {
            summary: 'Transaction object obtained from WavesTransactions library',
            type: 'object'
        },
        code: {
            summary: 'Text of the contract',
            type: 'string'
        },
        seed: {
            optional: true,
            summary: 'Seed string obtained from node (optional, env.SEED by default)',
            type: 'string'
        },
        func: {
            summary: 'Name of the function from API',
            type: 'function'
        },
        params: {
            summary: 'Object with transactions properties',
            type: 'object'
        },
        tabName: {
            summary: 'Tab name for web-ide or vscode plugin',
            type: 'string'
        },
        keyPairOrSeed: {
            summary: 'Seed string or keyPair object from keyPair() function',
            type: 'string'
        },
        apiBase: {
            optional: true,
            summary: 'Url of the node. E.x. "https://nodes.wavesplatform.com". (optional, env.API_BASE by default)',
            type: 'string'
        },
        nodeUrl: {
            optional: true,
            summary: 'Url of the node. E.x. "https://nodes.wavesplatform.com". (optional, env.API_BASE by default)',
            type: 'string'
        },
        address: {
            summary: 'Waves address as base58 string',
            type: 'string'
        },
        key: {
            summary: 'Account data dictionary key',
            type: 'string'
        }
    };

    /**
     * Generates API method argument(s) whole description
     *
     * @static
     * @method compileText
     *
     * @param {Array} aliases
     *
     * @returns {TSignature[]}
     */
    public static compileText(aliases: Array<string>): TSignature[] {
        return aliases.map((alias: any): TSignature => this.compileTextSlice(alias));
    }

    /**
     * Generates API method arguments description
     *
     * @static
     * @method compileTextArguments
     *
     * @param {Array} args
     * @param {string} text
     *
     * @returns {string}
     */
    public static compileTextArguments(args: Array<string>): TArg[] {
        let module: any = WavesConsoleAPIHelp;
        const out: TArg[] = [];
        args.forEach((argument: string) => {
            if (module.types[argument]) {
                out.push({
                    name: argument,
                    type: module.types[argument].type,
                    doc: module.types[argument].summary
                });
            }

        });
        return out;
    }

    /**
     * Generates API specified method description
     *
     * @static
     * @method compileTextSlice
     *
     * @param {string} alias
     *
     * @returns {string}
     */
    public static compileTextSlice(alias: string): TSignature {
        const signature: TSignature = {
            name: alias,
            args: [],
            doc: '',
            description: ''
        };
        let
            module: any = WavesConsoleAPIHelp,
            params: Array<string> = module.texts[alias] && module.texts[alias].params ?
                module.texts[alias].params :
                [],
            args: Array<string> = params.slice();
        // Check optional and obligatory function params
        if (args) {
            args = args.map((arg) => {
                return module.types[arg] && module.types[arg].optional ? `[${arg}]` : `${arg}`;
            });
        }

        if (module.texts[alias]) {
            // Add summary text
            if (module.texts[alias].summary) {
                signature.doc =  module.texts[alias].summary;
            }
            // Add arguments description
            if (args.length) {
                signature.args = module.compileTextArguments(params);
            }
            // Add full description
            if ( module.texts[alias].description) {
                signature.description = module.texts[alias].description;
            }
        }
        return signature;
    }

}
