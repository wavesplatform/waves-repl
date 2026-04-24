import {
  Middleware,
  Action,
} from 'redux'

import { SET_THEME, SET_LAYOUT } from '../actions/Settings';
import { ADD_HISTORY } from '../actions/Input';
import { SET_ENV } from "../actions/Env";

const save = (key: string, value:any, store = 'session') => {
    try {
        const storage = store === 'session' ? window.sessionStorage : window.localStorage
        storage.setItem(
            `jsconsole.${key}`,
            JSON.stringify(value)
        );
    } catch (e) {
    }
};

const saveToStorage: Middleware = store => next => action => {
    const nextAction = next(action);
    const typedAction = action as Action;
    const state:any = store.getState(); // new state after action was applied

    if (typedAction.type === SET_THEME || typedAction.type === SET_LAYOUT) {
        save('settings', state.settings, 'local');
    }

    if (typedAction.type === ADD_HISTORY) {
        save('history', state.history);
    }

    if (typedAction.type === SET_ENV) {
        save('env', state.env);
    }

    return nextAction;
};

export default saveToStorage;
