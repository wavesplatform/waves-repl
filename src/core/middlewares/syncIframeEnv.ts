import {
  Middleware,
  Action,
} from 'redux'

import { updateIFrameEnv } from '../lib/contextBinding';
import { SET_ENV } from "../actions/Env";

const syncIFrameEnv: Middleware = store => next => action => {
    const nextAction = next(action);
    const typedAction = action as Action;
    const state:any = store.getState(); // new state after action was applied

    if (typedAction.type === SET_ENV) {
        updateIFrameEnv(state.env)
    }
    return nextAction;
};

export default syncIFrameEnv;
