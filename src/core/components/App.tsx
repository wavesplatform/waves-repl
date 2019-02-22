import * as React from 'react';
import * as PropTypes from 'prop-types';
import classnames from 'classnames';

import { Console } from './Console';
import { Input } from '../containers/Input';

import run, { bindConsole, createContainer, getContainer } from '../lib/run';
import internalCommands from '../lib/internal-commands';
import { bindAPItoIFrame } from '../lib/contextBinding';
import { bindConsoleCommandsToCommands } from '../lib/consoleCommandsBinding';
import { WavesConsoleAPI } from '../../WavesConsoleAPI';
import { WavesConsoleCommands } from "../../WavesConsoleCommands";

// this is lame, but it's a list of key.code that do stuff in the input that we _want_.
const doStuffKeys = /^(Digit|Key|Num|Period|Semi|Comma|Slash|IntlBackslash|Backspace|Delete|Enter)/;

export interface IAppProps {
    api: WavesConsoleAPI
    consoleCommands: WavesConsoleCommands
    commands: any
    layout: string
    theme: 'light' | 'dark'
    className?: string
    style?: Record<string, number>
}
export class App extends React.Component<IAppProps, any> {
    private console: any;
    private messagesEnd?: HTMLDivElement | null;
    private app: any;
    private input: any;

    static contextTypes = {store: PropTypes.object};

    constructor(props: any) {
        super(props);

        this.onRun = this.onRun.bind(this);
        this.triggerFocus = this.triggerFocus.bind(this);
        (window as any).sccc = this.scrollToBottom.bind(this)
    }

    async onRun(command: string) {
        const console = this.console;

        command =  (command === "clear()") ? ":clear" : command; //TODO do without hack

        if (command[0] !== ':') {
            console.push({
                type: 'command',
                command,
                value: command,
            });

            const res = await run(command);

            console.push({
                command,
                type: 'response',
                ...res,
            });
            return;
        }

        let [cmd, ...args]: any[] = command.slice(1).split(' ');

        if (/^\d+$/.test(cmd)) {
            args = [parseInt(cmd, 10)];
            cmd = 'history';
        }


        if (!internalCommands[cmd]) {
            console.push({
                command,
                error: true,
                value: new Error(`No such jsconsole command "${command}"`),
                type: 'response',
            });
            return;
        }

        let res = await internalCommands[cmd]({args, console, app: this});

        if (typeof res === 'string') {
            res = {value: res};
        }

        if (res !== undefined) {
            console.push({
                command,
                type: 'log',
                ...res,
            });
        }

        return;
    }

    componentDidMount() {
        createContainer();
        bindConsole(this.console);
        bindAPItoIFrame(this.props.api, this.console);
        bindConsoleCommandsToCommands(this.props.consoleCommands, this.console);

        const query = decodeURIComponent(window.location.search.substr(1));
        if (query) {
            this.onRun(query);
        } else {
            this.onRun(':welcome');
        }

        this.scrollToBottom();
    }


    triggerFocus(e: any) {
        if (e.target.nodeName === 'INPUT') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.code && !doStuffKeys.test(e.code)) return;

        //this.input.focus();
    }

    scrollToBottom() {
        if (!this.messagesEnd) return
        // hack: chrome fails to scroll correctly sometimes. Need to do it on next tick
        setTimeout(() => {
            this.messagesEnd!.scrollIntoView({ behavior: "smooth" });
        }, 0);
    }

    render() {
        const {commands = [], theme, layout, className: classNameProp, style} = this.props;

        const className = classnames(['App', `theme-${theme}`, layout, classNameProp]);

        return (
            <div
                style={style}
                tabIndex={-1}
                onKeyDown={this.triggerFocus}
                ref={e => (this.app = e)}
                className={className}
            >
                <Console
                    ref={e => (this.console = e)}
                    commands={commands}
                    reverse={layout === 'top'}
                    scrollToBottom={() => this.scrollToBottom()}
                />
                <Input
                    inputRef={(e:any) => (this.input = e)}
                    onRun={this.onRun}
                    autoFocus={window.top === window}
                    onClear={() => {
                        this.console.clear();
                    }}
                    theme={this.props.theme}
                />
                <div ref={el => {
                    this.messagesEnd = el;
                }}/>
            </div>
        );
    }
}


