import * as React from 'react';
import {render} from 'react-dom';
import {Repl} from '../../src';

const App: React.StatelessComponent = () => (
    <Repl theme="dark"/>
);

render(<App />, document.getElementById("root"));

(global as any)['updateEnv'] = Repl.updateEnv;
(global as any)['API'] = Repl.API;

(global as any)['updateEnv']({
    SEED: 'abracadabra',
    API_BASE: 'https://testnodes.wavesnodes.com',
    CHAIN_ID:'T'
})