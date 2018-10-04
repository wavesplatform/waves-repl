import {getContainer} from './run';
import {WavesConsoleAPI} from "../../WavesConsoleAPI";

const consoleApi = new WavesConsoleAPI()

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
}

export const bindAPItoIFrame = () => {
    try {
        const iframeWindow = getContainer().contentWindow;
        Object.keys(consoleApi).forEach(key => iframeWindow[key] = consoleApi[key]);
    } catch (e) {
        console.error(e)
    }
}
