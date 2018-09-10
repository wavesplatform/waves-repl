import * as React from "react"
import {render} from "react-dom"
import {Repl} from './repl'

function updateEnv(p){
    Repl.updateEnv(p)
}

render(<div id='repl'><Repl theme='dark'/></div>,  document.getElementById("root"))

global['updateEnv'] = updateEnv

updateEnv({SEED: 'SEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEED', CHAIN_ID: 'T'})