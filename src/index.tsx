import * as React from "react"
import {Provider, connect} from "react-redux"
import {render} from "react-dom"


import {Repl} from './repl'


render(<Repl />,  document.getElementById("root"))

// const App = connect((state) => ({
//     coding: state.coding
// }))(app)

//
//
// const r = () =>
//     render(
//                 <App/>
//         </Provider>,
//         document.getElementById("root")
//     )
//
// setInterval(() => {
//     localStorage.setItem('store', JSON.stringify(store.getState().coding))
// }, 5000)
//
// store.subscribe(r)
// r()
//
// const state = store.getState()
// const env = state.env
// var loadRepl = false
//
// if (!loadRepl) {
//     const cpm = (code) => {
//         const r = compile(code)
//         if (r.error)
//             return r.error
//         return bufferToBase64(new Uint8Array(r.result))
//     }
//
//     const w = waves(env, store)
//
//     const initialContext: any = {
//         env,
//         ...w,
//         compile: cpm,
//         publish: (code) =>
//             w.broadcast(w.script(cpm(code)))
//     }
//
//     contextBinding.sync(initialContext)
// }
//
//
