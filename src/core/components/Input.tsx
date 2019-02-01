import * as React from 'react';
import {WavesConsoleAPIHelp, IWavesConsoleAPIHelpCommand} from '../../WavesConsoleAPI';

// TODO import Autocomplete from './Autocomplete';
import keycodes from '../lib/keycodes';

export interface IInputProps {
    inputRef:any,
    onRun:any,
    autoFocus:any,
    onClear:any,
    theme:string,
    history:Array<string>,
    addHistory:any,
    value?:string
}

export interface IInputState {
    value:string,
    multiline:boolean,
    rows:number,
    historyCursor:number,
    hideSuggest:boolean
}

export interface ISuggestRootProps {
    value?:string,
    commands?:string[],
    dropdown?:boolean,
    theme?:string
}

export interface ISuggestItemProps {
    title:string,
    selected?:boolean
}

export class Input extends React.Component<IInputProps, IInputState> {
    private input?: HTMLTextAreaElement | null;

    static commandsVocabulary = WavesConsoleAPIHelp.texts;

    static commandsList:Array<string> = Object.keys(WavesConsoleAPIHelp.texts);

    static commasAndQuotes:{[key:string]:string} = {
        '(': ')',
        '{': '}',
        '[': ']',
        '"': '"',
        "'": "'"
    }

    constructor(props: IInputProps) {
        super(props);

        // history is set in the componentDidMount
        this.state = {
            value: props.value || '',
            multiline: false,
            rows: 1,
            historyCursor: props.history.length,
            hideSuggest: false
        };

        // Bind some methods to instance
        this.onChange = this.onChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
    }

    onChange() {
        if (!this.input) {
            return;
        }

        const {value} = this.input;
        const length = value.split('\n').length;

        this.setState({
            multiline: length > 1,
            rows: length < 20 ? length : 20,
            value,
        });
    }

    async onKeyPress(event: React.KeyboardEvent) {
        if (!this.input) {
            return;
        };

        const code = keycodes[event.keyCode];
        const {multiline} = this.state;
        const {history} = this.props;
        const command = this.input.value;

        // Clear console
        if (this.checkClearAction(event, code)) {
            return;
        }

        // Insert value from suggested commands
        if (this.checkShowSuggestAction(event, code)) {
            return;
        }

        // Insert closing bracket if needed
        this.checkAutoclosingAction(event);

        // Set carot after closing bracket or quote if needed
        this.checkClosingBracketOrQuoteAction(event);

        // Move in history if not in multiline mode
        if (!multiline && this.checkNotMultilineActions(event, code)) {
            return;
        }

        // Remove suggestions block if needed
        if (this.checkHideSuggestAction(event, code)) {
            return;
        }

        // Add command to history and try to execute it
        if (code === 'enter') {
            if (event.shiftKey) {
                return;
            }

            if (!command) {
                event.preventDefault();
                return;
            }

            this.props.addHistory(command);

            this.setState({historyCursor: history.length + 1, value: '', multiline: false});

            event.preventDefault();

            await this.props.onRun(command);

            // Don't use `this.input.scrollIntoView();` as it messes with iframes
            window.scrollTo(0, document.body.scrollHeight);
            return;
        }
    }

    checkClearAction(event:React.KeyboardEvent, code:string):boolean {
        // Clear console
        if (event.ctrlKey && code === 'l') {
            this.props.onClear();
            return true;
        }

        return false;
    }

    checkShowSuggestAction(event:React.KeyboardEvent, code:string) {
        if (code == 'tab') {
            event.preventDefault();
            this.setCommandIntoInput();
            return true;
        }

        return false;
    }

    checkHideSuggestAction(event:React.KeyboardEvent, code:string):boolean {
        if (code === 'escape') {
            event.preventDefault();
            this.setState({hideSuggest: true});
            return true;
        } else {
            this.setState({hideSuggest: false});
        }

        return false;
    }

    checkAutoclosingAction(event:React.KeyboardEvent) {
        switch (event.key) {
            case '{':
            case '[':
            case '(':
            case '"':
            case "'":
                this.setClosingBracketOrQuoteIntoInput(event.key);
                break;
            case 'Backspace':
                this.unsetClosingBracketOrQuoteIntoInput();
                break;
        }
    }
    /**
     * @method {checkClosingBracketOrQuoteAction}
     *
     * @param {React.KeyboardEvent} event
     */
    checkClosingBracketOrQuoteAction (event:React.KeyboardEvent) {
        switch (event.key) {
            case '}':
            case ']':
            case ')':
            case '"':
            case "'":
                event.preventDefault();
                this.setInputCaretAfterAutoclosingAction();
                break;
        }
    }

    checkNotMultilineActions(event:React.KeyboardEvent, code:string):boolean {
        const {history} = this.props;
        let {historyCursor} = this.state;

        // Show back
        if (code === 'up arrow') {
            historyCursor--;

            if (historyCursor < 0) {
                this.setState({historyCursor: 0});

                return true;
            }

            this.setState({historyCursor, value: history[historyCursor]});

            event.preventDefault();

            return true;
        }

        // Move forward
        if (code === 'down arrow') {
            historyCursor++;

            if (historyCursor >= history.length) {
                this.setState({historyCursor: history.length, value: ''});

                return true;
            }

            this.setState({historyCursor, value: history[historyCursor]});
            event.preventDefault();

            return true;
        }

        return false;
    }

    getCurrentCommandPiece():string|undefined {
        let {input} = this;
        let pos:number = input ? input.selectionStart : 0;
        let commands:Array<string> = (input ? input.value.substring(0, pos) : '').
                                     split(/[\s+()]/);

        // Get last entry from string
        if (commands && commands.length) {
            return commands.pop();
        }

        return '';
    }

    setClosingBracketOrQuoteIntoInput(open:string = '(') {
        // No need to go further
        if (!this.input) {
            return;
        }

        let brackets = Input.commasAndQuotes;
        let {input} = this;
        let pos:number = input.selectionStart || 0;
        let close:string = brackets[open] ? brackets[open] : brackets['('];

        // Set new value
        input.value = input.value.substring(0, pos) +
                      close +
                      input.value.substring(pos);

        // Set new caret position
        input.selectionStart = pos;
        input.selectionEnd = pos;

        // Re-render to cleanup
        this.setState({value: input.value});
    }

    unsetClosingBracketOrQuoteIntoInput() {
        // No need to go further
        if (!this.input) {
            return;
        }

        let {input} = this;
        let pos:number = input.selectionStart || 0;
        let open:string = this.input.value.substr(pos - 1, 1);
        let close:string = Input.commasAndQuotes[open];

        // No need to go further
        if (!close) {
            return;
        }

        // Check if the closing symbol is similar to needed
        close = this.input.value.substr(pos, 1) === close ? close : '';

        // No need to go further
        if (!close) {
            return;
        }

        // Set new value
        input.value = input.value.substring(0, pos) +
                      input.value.substring(pos + 1);

        // Set new caret position
        input.selectionStart = pos;
        input.selectionEnd = pos;

        // Re-render to cleanup
        this.setState({value: input.value});
    }

    setInputCaretAfterAutoclosingAction() {
        let {input} = this;

        // No need to go further
        if (!input) {
            return;
        };

        let pos:number = input.selectionStart || 0;
        let open:string = input.value.substr(pos - 1, 1);
        let close:string = Input.commasAndQuotes[open];

        // No need to go further
        if (!close) {
            return;
        };

        // Check if the closing symbol is similar to needed
        close = input.value.substr(pos, 1) === close ? close : '';

        // No need to go further
        if (!close) {
            return;
        };
        
        // Set new caret position
        input.selectionStart = pos + 1;
        input.selectionEnd = pos + 1;

        // // Re-render to cleanup
        this.setState({value: input.value});
    }

    setCommandIntoInput() {
        // No need to go further
        if (!this.input) {
            return;
        }

        let {input} = this;
        let beg:number = input.selectionStart || 0;
        let end:number = input.selectionEnd || 0;
        let pos:number = beg;
        let isFunc:boolean = false;
        let insert = this.getCurrentCommandPiece();
        let missing:string|undefined = '';
        let vocabulary = Input.commandsVocabulary;
        let command:string|undefined = '';
        let commands:Array<string> = this.getFilteredCommandsList();

        // Autocomplete works only if one value in list
        if (commands.length != 1) {
            return;
        }

        // Get full command
        command = commands[0];

        // No need to go further
        if (command === undefined || insert === undefined) {
            return;
        }

        // Check if it's method or member
        isFunc = vocabulary[command] && vocabulary[command].params !== undefined;

        // Get missing part of command name
        missing = command.substring(insert.length);

        // Set new value
        input.value = input.value.substring(0, beg) +
                      missing + (isFunc ? '()' : '') + 
                      input.value.substring(end);

        // Set new caret position
        pos += missing.length;
        pos += isFunc ? 1 : 0;

        input.selectionStart = pos;
        input.selectionEnd = pos;

        // Re-render to cleanup
        this.setState({value: input.value});
    }

    getFilteredCommandsList():Array<string> {
        let seek:any = this.getCurrentCommandPiece();
        let list:Array<string> = [];

        if (seek) {
            // Get filtered list if possible
            list = Input.commandsList.filter((item:string) => {
                return item.indexOf(seek) === 0;
            });

            // Check for values inside
            if (list.length) {
                return list;
            }
        }

        return [];
    }

    render() {
        const rect = this.input ? this.input.getBoundingClientRect() : null;
        const dropdown = rect && rect.top < 50 ? true : false;
        const suggest = !this.state.hideSuggest ? this.createSuggest(dropdown) : null;
        const textarea = this.createTextarea();

        return (
            <div className="Input">
                {suggest}
                {textarea}
            </div>
        );
    }

    createSuggest(dropdown:boolean) {
        const {value} = this.state;
        const {theme} = this.props;
        const commands = this.getFilteredCommandsList();

        return (<SuggestRoot
            value={value}
            commands={commands}
            dropdown={dropdown}
            theme={theme}
        />);
    }

    createTextarea() {
        const {autoFocus} = this.props;
        const {rows, value} = this.state;

        return (
            <textarea
                className="cli"
                rows={rows}
                autoFocus={autoFocus}
                ref={e => {
                    this.input = e;
                    this.props.inputRef(e);
                }}
                value={value}
                onChange={this.onChange}
                onKeyDown={this.onKeyPress}
            />
        );
    }

}

function SuggestRoot(props:ISuggestRootProps) {
    const {value, theme, commands} = props;

    // No need to go further
    if (!commands || !commands.length || !value) {
        return null;
    }

    return (
        <div className={'Suggest' + (theme ? ' Suggest_theme_' + theme : '')}>
            <SuggestList {...props} />
            &nbsp;
        </div>
    );
}

function SuggestList(props:ISuggestRootProps) {
    // No need to go further
    if (!props.commands || !props.commands.length) {
        return null;
    }

    const commands = props.commands.map((item:string, index:number) => {
        return (<SuggestItem
                   key={'commands-suggest-item-' + index}
                   title={item}
               />);
    });

    return (
        <ul className={'Suggest__list' + (props.dropdown ? ' Suggest__list_drop_down' : '')}>
            {commands}
        </ul>
    );
}

function SuggestItem(props:ISuggestItemProps) {
    return (<li
        className = {'Suggest__item' + (props.selected ? ' Suggest__item_is_selected' : '')}
    >
        {props.title}
    </li>);
}
