import * as React from 'react';
import { render } from 'react-dom';
import { Repl } from '../../src';

class App extends React.Component {
    public consoleRef = React.createRef<Repl>();

    componentDidMount(){
        // FixMe: using ! to remove undefined/null from type
        const console = this.consoleRef.current!;

        (global as any)['updateEnv'] = console.updateEnv;
        (global as any)['API'] = console.API;
        (global as any)['methods'] = console.methods;

        (global as any)['updateEnv']({
            SEED: 'abracadabra',
            API_BASE: 'https://nodes-testnet.wavesnodes.com',
            CHAIN_ID: 'T',
            file: () => 'Placeholder file content'
        });

    }
    render(){
        return <Repl theme="dark" ref={this.consoleRef}/>
    }
}
render(<App/>, document.getElementById('root'));
