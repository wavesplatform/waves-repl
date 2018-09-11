# Waves REPL
## About
This repository contains javascript console for waves blockchain.
It is built on top of [jsconsole](https://github.com/remy/jsconsole) and have predefined functions to work with waves
## Usage
### Standalone app
#### Build:
```npm
npm run build
```
Builds app to 'dist'
#### Dev server:
```npm
npm run server
```
Starts dev server
### React component
```typescript jsx
import * as React from "react"
import {render} from "react-dom"
import {Repl} from './src/repl'

// Render REPL
render(<div id='repl'><Repl theme='dark'/></div>,  document.getElementById("root"))

// Static methond for setting SEED and CHAIN_ID 
Repl.updateEnv({SEED: 'SEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEED', CHAIN_ID: 'T'})
```

