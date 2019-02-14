import {getContainer} from './run';
import {WavesConsoleAPI} from "../../WavesConsoleAPI";
import { TTx } from "@waves/waves-transactions/";

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

const getApiMethodWrappers = (consoleApi: WavesConsoleAPI, console: Console):  IApiMethodWrappers => {
    return {
        broadcast: (tx: TTx, apiBase?: string) => {
            return new Promise((resolve, reject) => {
                consoleApi.broadcast(tx, apiBase || WavesConsoleAPI.env.API_BASE)
                    .then((res: any) => {
                        resolve(res);

                        const htmlString = `<a href="http://wavesexplorer.com/tx/${res.id}" target="_blank">Link to transaction in wavesexplorer</a>`;

                        console.push({
                            html: true,
                            value: htmlString,
                            type: 'log',
                        });
                    })
                    .catch((error: any) => {
                        reject(error);
                    });
            });
        }
    };
};
