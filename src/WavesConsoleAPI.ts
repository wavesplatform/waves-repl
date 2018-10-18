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
                {chainId: WavesConsoleAPI.env.CHAIN_ID, ...params})
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

    public keyPair = (seed?: string): KeyPair => keyPair(seed || WavesConsoleAPI.env.SEED)

    public publicKey = (seed?: string): string =>
        this.keyPair(seed).public;

    public privateKey = (seed: string): string =>
        this.keyPair(seed).private;

    public address = (seed?: string, chainId?: string) => address(
        seed || WavesConsoleAPI.env.SEED,
       chainId || WavesConsoleAPI.env.CHAIN_ID
    );

    public compile = (code: string): string => {
        const r = cmpl(code);
        if (r.error)
            throw new Error(r.error);
        return this.bufferToBase64(new Uint8Array(r.result));
    };

    public broadcast = async (tx: any, apiBase?: string) => {
        const url = new URL('transactions/broadcast', apiBase || WavesConsoleAPI.env.API_BASE).href;
        try{
            const resp = await Axios.post(url, tx);
            return resp.data
        }catch (e) {
            if (e.response && e.response.status === 400){
                throw new Error(e.response.data.message)
            }else throw e
        }
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

    public help = (func?: Function): string => {
        var
            pos: number = -1,
            al0: string = '',
            type: string = typeof func,
            params: Array<any> = [],
            aliases: Array<any> = [];

        // Try to find function name
        for (al0 in this) {
            if ((type == 'undefined' || func == this[al0])) {
                params = this[al0].toString().match(/^(function\s*)?\(([^)]*)\)/g);

                // Check if function has params
                if (params[0].match(/\([^)]+\)/)) {
                    params = params instanceof Array && params.length ? params : [];
                    params = params[0] ? params : [];
                    params = params[0].
                             replace(/function\s*/, '').
                             replace(/[()]/g, '').
                             split(/\s*,\s*/);
                } else {
                    params = [];
                }

                aliases.push(<any>{alias: al0, params : params});
            }
        }

        // Sort functions list and move help help to the top
        if (aliases.length > 1) {
            aliases.sort((a, b) => {
                if (a.alias > b.alias) {
                    return 1;
                } else if (a.alias < b.alias) {
                    return -1;
                }

                return 0;
            });

            // Get position of help in list
            aliases.forEach((item, index) => {
                if (item.alias == 'help') {
                    pos = index;
                }
            });

            // Move help to the top of list
            aliases.unshift(aliases.splice(pos, 1)[0]);
        }

        // Compile help text from pieces
        return WavesConsoleAPIHelp.compileText(aliases);
    }

}

/**
 * Item for commands list
 *
 * @interface WavesConsoleAPIHelpCommand
 */
interface WavesConsoleAPIHelpCommand {
    readonly summary?: string,
    readonly description?: string
}

/**
 * Item for variables types list
 *
 * @interface WavesConsoleAPIHelpVariable
 */
interface WavesConsoleAPIHelpVariable {
    readonly optional?: boolean,
    readonly type?: string,
    readonly summary?: string
}

/**
 * Item for common texts pieces (headers, etc)
 *
 * @interface WavesConsoleApiHelpCommon
 */
interface WavesConsoleApiHelpCommon {
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
    public static common: {[key:string]:WavesConsoleApiHelpCommon} = {
        list: {
            header: 'Available functions:'
        },
        args: {
            header: 'Arguments:'
        }
    }

    /**
     * Commands descriptions vocabulary
     *
     * @static
     * @member {object} texts
     */
    public static texts: {[key:string]:WavesConsoleAPIHelpCommand} = {
        file: {
            summary: '' +
                'Gets editor contents for tab',
            description: '' +
                'Used inside web-ide or vscode plugin.'
        },
        data: {
            summary: '' +
                'Creates signed data transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed DataTransaction as a second agrument.'
        },
        issue: {
            summary: '' +
                'Creates signed issue transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed IssueTransaction as a second agrument.'
        },
        contract: {
            summary: '' +
                'Open editor tab content',
            description: '' +
                ''
        },
        keyPair: {
            summary: '' +
                'Generates keyPair from seed',
            description: '' +
                ''
        },
        publicKey: {
            summary: '' +
                'Generates publicKey from seed',
            description: '' +
                ''
        },
        privateKey: {
            summary: '' +
                'Generates privateKey from seed',
            description: '' +
                ''
        },
        address: {
            summary: '' +
                'Generates address from seed',
            description: '' +
                ''
        },
        compile: {
            summary: '' +
                'Gets editor contents for tab',
            description: '' +
                ' Accepts plain text of a contract as an argument. Returns compiled contract in base64.'
        },
        broadcast: {
            summary: '' +
                'Sends transaction to the Waves network using REST API',
            description: '' +
                'Returns Promise.'
        },
        deploy: {
            summary: '' +
                'Compile currently selected contract and deploy it to default account',
            description: '' +
                ''
        },
        help: {
            summary: '' +
                'Help for the available API functions',
            description: '' +
                'You can use help() to get list of available functions ' +
                'or help(functionName) to get info for the specified function.'
        },
        transfer: {
            summary: '' +
                'Creates signed transfer transaction',
            description: '' +
                ''
        },
        massTransfer: {
            summary: '' +
                'Creates signed massTransfer transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed MassTransferTransaction as a second agrument.'
        },
        reissue: {
            summary: '' +
                'Creates signed reissue transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use already ' +
                'signed ReissueTransaction as a second agrument.'
        },
        burn: {
            summary: '' +
                'Creates signed burn transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed BurnTransaction as a second agrument.'
        },
        lease: {
            summary: '' +
                'Creates signed lease transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed LeaseTransaction as a second agrument.'
        },
        cancelLease: {
            summary: '' +
                'Creates signed cancelLease transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed CancelLeaseTransaction as a second agrument.'
        },
        alias: {
            summary: '' +
                'Creates signed createAlias transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed AliasTransaction as a second agrument.'
        },
        setScript: {
            summary: '' +
                'Creates signed setScript transaction',
            description: '' +
                'You can use this function with multiple seeds. ' +
                'In this case it will sign transaction accordingly ' +
                'and will add one proof per seed. Also you can use ' +
                'already signed SetScriptTransaction as a second agrument.'
        }
    };

    /**
     * Variables types vocabulary
     *
     * @static
     * @member {object} types
     */
    public static types: {[key:string]:WavesConsoleAPIHelpVariable} = {
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
            type : 'string'
        },
        apiBase: {
            optional: true,
            summary: 'Url of the node. E.x. "https://nodes.wavesplatform.com". (optional, env.API_BASE by default)',
            type: 'string'
        }
    }

    /**
     * Generates API method argument(s) whole description
     *
     * @static
     * @method compileText
     *
     * @param {Array} aliases
     *
     * @returns {string}
     */
    public static compileText(aliases: Array<string>): string {
        var
            last = aliases.length - 1,
            module: any = WavesConsoleAPIHelp,
            full: boolean = aliases.length == 1 ? true : false,
            text: string = '';

        // Compile text for each command
        aliases.forEach((item: any, index: number) => {
            text = this.compileTextSlice(item.alias, item.params, full, text);

            // Add ; or .
            if (!full) {
                if (index == last) {
                    text = `${text}.`;
                } else {
                    text = `${text};`;
                }
            }
        });

        // Add header for commands list
        if (full === false) {
            text = `${module.common.list.header}\n${text}`;
        }

        return text;
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
    public static compileTextArguments(args: Array<string>, text: string): string {
        var
            last: number = args.length - 1,
            type: string = '',
            summary: string = '',
            module: any = WavesConsoleAPIHelp;

        // Add arguments list header
        text = `${text}\n\n${module.common.args.header}`;

        // Add each argument info
        args.forEach((argument: string, index: number) => {
            text = `${text}\n${index + 1}. ${argument}`;

            if (module.types[argument]) {
                summary = module.types[argument].summary;
                summary = summary.substring(0, 1).toLowerCase() + summary.substring(1);
                type = module.types[argument].type;
                type = type ? type : '';

                // Add argument type
                if (type) {
                    text = `${text}: ${type}`
                }

                // Add argument summary
                if (summary) {
                    text = `${text} — ${summary}`;
                }

                // Add ; or .
                if (index == last) {
                    text = `${text}.`
                } else {
                    text = `${text};`
                }
            }
        });

        return text;
    }

    /**
     * Generates API specified method description
     *
     * @static
     * @method compileTextSlice
     *
     * @param {Array} args
     * @param {string} text
     *
     * @returns {string}
     */
    public static compileTextSlice(alias: string, params: Array<string>, full: boolean, text: string): string {
        var
            module: any = WavesConsoleAPIHelp,
            summary: string = '',
            description: string = '',
            type: string = '',
            vals: undefined|Array<string>,
            args: Array<string>;

        // Check optional and obligatory function params
        args = params.map((arg) => {
            return module.types[arg].optional ? `${arg}?` : `${arg}`;
        });

        // Add common function info
        if (full) {
            text = `${alias}(${args.join(', ')})`;
        } else {
            text = `${text}\n${alias}(${args.join(', ')})`;
        }

        if (module.texts[alias]) {
            // Add summary text
            if (module.texts[alias].summary) {
                summary = module.texts[alias].summary;
                summary = summary.substring(0, 1).toLowerCase() +
                          summary.substring(1);
                text = `${text} — ${summary}`;

                if (full) {
                    text = `${text}.`;
                }
            }

            // Add arguments description
            if (full && params.length) {
                text = module.compileTextArguments(params, text);
            }

            // Add full description
            if (full && module.texts[alias].description) {
                description = module.texts[alias].description;
                text = `${text}\n\n${description}`;
            }
        }

        return text;
    }

}
