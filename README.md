# Waves REPL
## About
This repository contains javascript console for waves blockchain.
It is built on top of [jsconsole](https://github.com/remy/jsconsole) and have predefined functions to work with waves
## Builtin functions
#### JS lib
Console uses [waves-transactions](https://ebceu4.github.io/waves-transactions/index.html) library. Top level library functions are bound to console global scope.
The difference is that in console, seed argument comes second and is optional.
E.x.:
##### Console
```javascript
const signedTx = transfer({amount: 100, recipient: 'some recipient'})
```
##### Library
```javascript
const signedTx = transfer('some seed phraze', {amount: 100, recipient: 'some recipient'})
```
#### Additional functions
Broadcast signed tx using node from global variable 
```javascript
const resp = broadcast(signedTx)
```
Compile contract. Returns base64
```javascript
const compiled = compile(contractText)
```
Get contract text by tab name. Used inside web-ide or vscode plugin
```javascript
const contractText = file(tabName)
```
Get contract text from currently open tab. Used inside web-ide or vscode plugin
```javascript
const contractText = contract()
```

Keys
```javascript
address(seed = env.SEED) // Address from seed. 
keyPair(seed = env.SEED) // Keypair from seed
publicKey(seed = env.SEED) // Public key from seed
privateKey(seed = env.SEED) // Private key from seed
```
#### Global object env
```javascript
env.SEED // Default seed
env.CHAIN_ID // Default network byte
env.API_BASE // Node url 
env.editors // Open editor tabs info
```
## Usage
### Dev server:
```npm
npm start
```
Starts dev server
### React component
```typescript jsx
import * as React from 'react';
import {render} from 'react-dom';
import {Repl} from 'waves-repl';

const App: React.StatelessComponent = () => (
    <Repl theme="dark"/>
);

render(<App />, document.getElementById("root"));

(window as any)['updateEnv'] = Repl.updateEnv

//Set default params
Repl.updateEnv({
    SEED: 'SEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEED',
    CHAIN_ID: 'T',
    API_BASE: 'https://testnodes.wavesnodes.com/'
})
```



