import React from 'react';
import { Provider } from 'react-redux';
import store from './core/store';
import './css/index.css';
import './core/jsconsole.css';

const rootEl = document.getElementById('root');
const App = require('./core/containers/App').default;

export const Repl = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};