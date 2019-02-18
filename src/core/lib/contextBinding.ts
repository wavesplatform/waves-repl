import {getContainer} from './run';
import {WavesConsoleAPI} from "../../WavesConsoleAPI";
import { TTx, libs } from "@waves/waves-transactions/";
import axios from 'axios';

import {Console} from '../components/Console';

export const updateIFrameEnv = (env:any) => {
    // add all waves functions to iframe global scope
    try {
        WavesConsoleAPI.setEnv(env)
        const iframeWindow = getContainer().contentWindow;
        // Object.keys(consoleApi).forEach(key => iframeWindow[key] = w[key]);
        iframeWindow['env'] = env
    } catch (e) {
        console.error(e)
    }
};

export const bindAPItoIFrame = (consoleApi: WavesConsoleAPI, console: Console) => {
    const apiMethodWrappers: IApiMethodWrappers = getApiMethodWrappers(consoleApi, console);

    try {
        const iframeWindow = getContainer().contentWindow;

        Object.keys(consoleApi)
            .forEach(key => {
                key in apiMethodWrappers
                    ? iframeWindow[key] = apiMethodWrappers[key]
                    : iframeWindow[key] = consoleApi[key]
            });
    } catch (e) {
        console.error(e)
    }
}

interface IApiMethodWrappers {
    [key:string]: any
};

const getNetworkByte = (api: string) => {
    return axios.get(`${api}/addresses`)
        .then(res => {
            const address = res.data[0];

            const byte = libs.marshall.serializePrimitives.BASE58_STRING(address)[1];
            
            return String.fromCharCode(byte);
        })
};

const getApiMethodWrappers = (consoleApi: WavesConsoleAPI, console: Console):  IApiMethodWrappers => {
    return {
        broadcast: (tx: TTx, apiBase?: string) => {
            const api = apiBase || WavesConsoleAPI.env.API_BASE;

            const pushExplorerLinkToConsole = (href: string) => {
                const htmlString = `<a href="${href}" target="_blank">Link to transaction in wavesexplorer</a>`;

                console.push({
                    html: true,
                    value: htmlString,
                    type: 'log',
                });
            };

            consoleApi.broadcast(tx, api)
                .then((res: any) => {
                    const wavesNodes = ['https://nodes.wavesplatform.com', 'https://testnodes.wavesplatform.com'];

                    if (wavesNodes.includes(api)) {
                        const subdomain = api.split['.'][0];

                        const href = (subdomain === 'nodes')
                            ? 'http://wavesexplorer.com/tx/${res.id}'
                            : 'http://wavesexplorer.com/testnet/tx/${res.id}'

                        pushExplorerLinkToConsole(href);

                        return res;

                    } else {
                        getNetworkByte(api)
                            .then(networkByte => {

                                const isWavesNetwork = networkByte === 'W' || networkByte === 'T';

                                if (isWavesNetwork) {
                                    const href = networkByte === 'W'
                                        ? 'http://wavesexplorer.com/tx/${res.id}'
                                        : 'http://wavesexplorer.com/testnet/tx/${res.id}'

                                    pushExplorerLinkToConsole(href);

                                    return res;
                                };

                                return res;
                            });
                    };
                })
        }
    };
};
