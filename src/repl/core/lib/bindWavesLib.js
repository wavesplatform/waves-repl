import {getContainer} from '../lib/run';
import {waves} from "../../waves";

export const bindWavesLib = (env) => {
    // add all waves functions to iframe global scope
    try {
        const iframeWindow = getContainer().contentWindow;
        const w = waves(env)
        Object.keys(w).forEach(key => iframeWindow[key] = w[key]);
    } catch (e) {

    }
}