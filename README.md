# REPL
## About
This repository contains javascript console for waves blockchain.
It is built on top of [jsconsole](https://github.com/remy/jsconsole) and have predefined functions to work with waves
## Builtin functions
#### JS lib
Console uses [waves-transactions](https://wavesplatform.github.io/waves-transactions/) library. Top level library functions are bound to console global scope.
The difference is that in console, seed argument is equal to env.SEED by default. You need to pass null explicitly if you only want to create transaction and not to sign it
E.x.:
##### Console
```javascript
const signedTx = transfer({amount: 100, recipient: '3MyAGEBuZGDKZDzYn6sbh2noqk9uYHy4kjw', senderPublicKey: '8ViwGfvyyN1teUKV4Uvk2orK6XiYB4S4VuM2DqJ9Mj5b'}, null)

//returns tx with no proofs
{
  "type": 4,
  "version": 2,
  "fee": 100000,
  "senderPublicKey": "8ViwGfvyyN1teUKV4Uvk2orK6XiYB4S4VuM2DqJ9Mj5b",
  "timestamp": 1542640481876,
  "proofs": [],
  "id": "CveeKH16XQcshV5GZP2RXppg3snxcKqRsM4wE5gxcuzc",
  "chainId": "T",
  "amount": 100,
  "recipient": "3MyAGEBuZGDKZDzYn6sbh2noqk9uYHy4kjw"
}

```
#### Additional functions
Broadcast signed tx using node from global variable 
```javascript
const resp = await broadcast(signedTx)
```
Deploy current open contract using node from global variable 
```javascript
const resp = deploy()
```
Sign arbitrary transaction
```javascript
const tx = transfer({amount: 100, recipient: '3MyAGEBuZGDKZDzYn6sbh2noqk9uYHy4kjw', senderPublicKey: '8ViwGfvyyN1teUKV4Uvk2orK6XiYB4S4VuM2DqJ9Mj5b'}, null)
const signedTx = signTx(tx)
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

class App extends React.Component {
    public consoleRef = React.createRef<Repl>();

    componentDidMount(){
        // Get console instance
        const console = this.consoleRef.current!;
        
        // Access to console api
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
```



