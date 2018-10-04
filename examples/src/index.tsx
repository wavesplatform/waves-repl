import * as React from 'react';
import {render} from 'react-dom';
import {Repl} from '../../src';

const App: React.StatelessComponent = () => (
    <Repl/>
);

render(<App />, document.getElementById("root"));

(global as any)['updateEnv'] = Repl.updateEnv