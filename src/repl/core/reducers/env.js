import { SET_ENV } from '../actions/Env';
import { bindWavesLib } from '../lib/bindWavesLib';

const defaultState = {

};

const reducer = (state = defaultState, action) => {
  if (action.type === SET_ENV) {
    bindWavesLib(action.value)
    return action.value;
  }
  return state;
};

export default reducer;
