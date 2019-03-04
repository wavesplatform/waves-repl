import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from './core/store';
import { setEnv } from './core/actions/Env';
import { setTheme } from './core/actions/Settings';
import { App } from './core/containers/App';
import { Console } from './core/components/Console';
import './css/index.css';
import './core/jsconsole.css';
import { WavesConsoleAPI } from './WavesConsoleAPI';
import WavesConsoleMethods from './WavesConsoleMethods';

interface IReplProps {
    theme: string
    className?: string
    style?: Record<string, React.CSSProperties>
    env?: object
}

export class Repl extends React.Component<IReplProps> {
    private store: any;
    public API: any;
    public Methods: any;
    private consoleRef: any;

    constructor(props: IReplProps){
        super(props);

        this.store = configureStore();

        this.API = new WavesConsoleAPI();

        if (props.theme) {
            this.store.dispatch(setTheme(props.theme));
        }
    }

    public updateEnv = (env: any): void => {
        this.store.dispatch(setEnv(env));
    }

    componentDidMount() {
        this.Methods = new WavesConsoleMethods(this.consoleRef);
    }

    render() {
        const {theme, ...rest} = this.props;
        return (
            <Provider store={this.store}>
                <App
                    consoleRef={(el: Console) => this.consoleRef = el}
                    api={this.API}
                    methods={this.Methods}
                />
            </Provider>
        );
    }
}