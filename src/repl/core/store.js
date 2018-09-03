import reducers from './reducers';
import { createStore, compose, applyMiddleware } from 'redux';
import { SET_THEME, SET_LAYOUT } from './actions/Settings';
import { ADD_HISTORY } from './actions/Input';
import { SET_ENV} from "./actions/Env";

const save = (key, value, store = 'session') => {
  try {
    window[`${store}Storage`].setItem(
      `jsconsole.${key}`,
      JSON.stringify(value)
    );
  } catch (e) {}
};

const middleware = [
  applyMiddleware(store => next => action => {
    const nextAction = next(action);
    const state = store.getState(); // new state after action was applied

    if (action.type === SET_THEME || action.type === SET_LAYOUT) {
      save('settings', state.settings, 'local');
    }

    if (action.type === ADD_HISTORY || action.type === SET_ENV) {
      save('env', state.env);
    }

    return nextAction;
  }),
];

if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  middleware.push(window.__REDUX_DEVTOOLS_EXTENSION__());
}

const finalCreateStore = compose(...middleware)(createStore);

const defaults = {};
try {
  defaults.settings = JSON.parse(
    localStorage.getItem('console.settings') || '{}'
  );
  defaults.history = JSON.parse(
    sessionStorage.getItem('console.history') || '[]'
  );
  defaults.env = JSON.parse(
    sessionStorage.getItem('console.env') || '{}'
  );
} catch (e) {
  console.log(e);
}

const store = finalCreateStore(reducers, defaults);
export default store;