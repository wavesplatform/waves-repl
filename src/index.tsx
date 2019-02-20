import * as React from 'react';
import { Provider } from 'react-redux';
import store from './core/store';
import { setEnv } from './core/actions/Env';
import { setTheme } from './core/actions/Settings';
import { App } from './core/containers/App';
import './css/index.css';
import './core/jsconsole.css';
import { WavesConsoleAPI } from "./WavesConsoleAPI";

interface IReplProps {
    theme: string
    className?: string
    style?: Record<string, React.CSSProperties>
}

export class Repl extends React.Component<IReplProps> {
    static API = new WavesConsoleAPI();

    constructor(props: IReplProps) {
        super(props);
        if (props.theme) {
            store.dispatch(setTheme(props.theme));
        }
    }

    static updateEnv(env: any): void {
        store.dispatch(setEnv(env));
    }

    render() {
        const {theme, ...rest} = this.props;
        return (
            <Provider store={store}>
                <App api={Repl.API} {...rest}/>
            </Provider>
        );
    }
}