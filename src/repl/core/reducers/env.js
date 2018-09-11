import { SET_ENV } from '../actions/Env';
import { bindWavesLib } from '../lib/bindWavesLib';

const defaultState = {

};

const reducer = (state = defaultState, action) => {
  if (action.type === SET_ENV) {
    const newState = Object.assign({}, state, action.value)
    bindWavesLib(newState)
    return newState
  }
  return state;
};

export default reducer;
