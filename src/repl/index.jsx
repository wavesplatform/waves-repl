import React from 'react';
import {Provider} from 'react-redux';
import store from './core/store';
import {setEnv} from './core/actions/Env'
import './css/index.css';
import './core/jsconsole.css';

const rootEl = document.getElementById('root');
const App = require('./core/containers/App').default;


export class Repl extends React.Component {

    static updateEnv(env){
        store.dispatch(setEnv(env))
    }

    render() {
        return (
            <Provider store={store}>
                <App/>
            </Provider>
        );
    }
}