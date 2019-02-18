import * as React from 'react';
import {Line} from './Line';

let guid = 0;
const getNext = () => guid++;

// function AssertError(message) {
//     this.name = 'Assertion fail';
//     this.message = message;
//     this.stack = new Error().stack;
// }

class AssertError extends Error {
    constructor(message:string){
        super(message)
        this.name = 'Assertion fail'
    }
}
// AssertError.prototype = new Error();

function interpolate(...args:any[]) {
    let [string, ...rest] = args;
    let html = false;

    if (typeof string === 'string' && string.includes('%') && rest.length) {
        string = string.replace(
            /(%[scdif]|%(\d*)\.(\d*)[dif])/g,
            (all, key, width = '', dp) => {
                // NOTE: not supporting Object type

                if (key === '%s') {
                    // string
                    return rest.shift();
                }

                if (key === '%c') {
                    html = true;
                    return `</span><span style="${rest.shift()}">`;
                }

                const value = rest.shift();
                let res = null;

                if (key.substr(-1) === 'f') {
                    if (isNaN(parseInt(dp, 10))) {
                        res = value;
                    } else {
                        res = value.toFixed(dp);
                    }
                } else {
                    res = parseInt(value, 10);
                }

                if (width === '') {
                    return res;
                }

                return res.toString().padStart(width, ' ');
            }
        );

        if (html) {
            string = `<span>${string}</span>`;
        }

        args = [string, ...rest];
    }

    return {html, args};
}

export class Console extends React.Component<any,any> {
    private readonly scrollToBottom: any

    constructor(props:any) {
        super(props);
        this.state = (props.commands || []).reduce((acc:any, curr:any) => {
            acc.commands[getNext()] = curr;
            return acc;
        }, {commands: {}});
        this.log = this.log.bind(this);
        this.clear = this.clear.bind(this);
        this.push = this.push.bind(this);
        this.scrollToBottom = props.scrollToBottom;
        (window as any).riderepl = this
    }

    push(command: any) {
        const next = getNext();
        this.setState({commands: Object.assign({}, this.state.commands, {[next]: command})});
    }

    clear() {
        this.setState({commands: {}});
    }

    error(...rest: any[]) {
        const {html, args} = interpolate(...rest);
        this.push({
            error: true,
            html,
            value: args,
            type: 'log',
        });
    };

    componentDidUpdate() {
        this.scrollToBottom();
    }

    assert(test:any, ...rest:any[]) {
        // intentional loose assertion test - matches devtools
        if (!test) {
            let msg = rest.shift();
            if (msg === undefined) {
                msg = 'console.assert';
            }
            rest.unshift(new AssertError(msg));
            this.push({
                error: true,
                value: rest,
                type: 'log',
            });
        }
    }

    dir(...rest:any[]) {
        const {html, args} = interpolate(...rest);

        this.push({
            value: args,
            html,
            open: true,
            type: 'log',
        });
    };

    warn(...rest:any[]) {
        const {html, args} = interpolate(...rest);
        this.push({
            error: true,
            level: 'warn',
            html,
            value: args,
            type: 'log',
        });
    }

    debug(...args:any[]) {
        return this.log(...args);
    };

    info(...args:any[]) {
        return this.log(...args);
    };

    log(...rest:any[]) {
        const {html, args} = interpolate(...rest);

        this.push({
            value: args,
            html,
            type: 'log',
        });
    }

    render() {
        const commands = this.state.commands || {};
        const keys = Object.keys(commands);
        if (this.props.reverse) {
            keys.reverse();
        }
        
        return (
            <div
                className="react-console-container"
                onClick={e => {
                    e.stopPropagation(); // prevent the focus on the input element
                }}
            >
                {keys.map(_ => <Line key={`line-${_}`} {...commands[_]} />)}
            </div>
        );
    }
}
