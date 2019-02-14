import * as React from 'react';
import {WavesConsoleAPIHelp, IWavesConsoleAPIHelpCommand} from '../../WavesConsoleAPI';

// TODO import Autocomplete from './Autocomplete';
import keycodes from '../lib/keycodes';

/**
 * @interface {IInputProps}
 */
export interface IInputProps {
    inputRef: any,
    onRun: any,
    autoFocus: any,
    onClear: any,
    theme: string,
    history: Array<string>,
    addHistory: any,
    value?: string
}

/**
 * @interface {IInputState}
 */
export interface IInputState {
    value: string,
    multiline: boolean,
    rows: number,
    historyCursor: number,
    hideSuggest: boolean
}

/**
 * @interface {ISuggestRootProps}
 */
export interface ISuggestRootProps {
    value?: string,
    commands?: string[],
    dropdown?: boolean,
    theme?: string
}

/**
 * @interface {ISuggestItemProps}
 */
export interface ISuggestItemProps {
    title: string,
    selected?: boolean
}

/**
 * @class {Input}
 * @extends {React.Component}
 */
export class Input extends React.Component<IInputProps, IInputState> {

    /**
     * @private
     * @member {HTMLTextAreaElement?} input
     */
    private input?: HTMLTextAreaElement | null;

    /**
     * @static
     * @member {object} commandsVocabulary
     */
    static commandsVocabulary = WavesConsoleAPIHelp.texts;

    /**
     * @static
     * @member {Array} commandsList
     */
    static commandsList: Array<string> = Object.keys(WavesConsoleAPIHelp.texts);

    /**
     * @static
     * @member {object} commasAndQuotes
     */
    static commasAndQuotes: { [key: string]: string } = {
        '(': ')',
        '{': '}',
        '[': ']',
        '"': '"',
        "'": "'"
    }

    /**
     * @constructor
     *
     * @param {IInputProps} props
     */
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

    /**
     * @method {onChange}
     *
     * @returns {undefined}
     */
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

    /**
     * @async
     * @method {onKeyPress}
     *
     * @param {React.KeyboardEvent} event
     *
     * @returns {Promise}
     */
    async onKeyPress(event: React.KeyboardEvent) {
        if (!this.input) {
            return;
        }

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

        // Move in history if not in multiline mode
        if (this.checkNotMultilineActions(event, code, this.input)) {//!multiline &&
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

    /**
     * @method {checkClearAction}
     *
     * @param {React.KeyboardEvent} event
     * @param {string} code
     *
     * @returns {boolean}
     */
    checkClearAction(event: React.KeyboardEvent, code: string): boolean {
        // Clear console
        if (event.ctrlKey && code === 'l') {
            this.props.onClear();
            return true;
        }

        return false;
    }

    /**
     * @method {checkShowSuggestAction}
     *
     * @param {React.KeyboardEvent} event
     * @param {string} code
     */
    checkShowSuggestAction(event: React.KeyboardEvent, code: string) {
        if (code == 'tab') {
            event.preventDefault();
            this.setCommandIntoInput();
            return true;
        }

        return false;
    }

    /**
     * @method {checkHideSuggestAction}
     *
     * @param {React.KeyboardEvent} event
     * @param {string} code
     *
     * @returns {boolean}
     */
    checkHideSuggestAction(event: React.KeyboardEvent, code: string): boolean {
        if (code === 'escape') {
            event.preventDefault();
            this.setState({hideSuggest: true});
            return true;
        } else {
            this.setState({hideSuggest: false});
        }

        return false;
    }

    /**
     * @method {checkAutoclosingAction}
     *
     * @param {React.KeyboardEvent} event
     */
    checkAutoclosingAction(event: React.KeyboardEvent) {
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
     * @method {checkNotMultilineActions}
     *
     * @param {React.KeyboardEvent} event
     * @param {string} code
     *
     * @returns {boolean}
     */
    checkNotMultilineActions(event: React.KeyboardEvent, code: string, input: HTMLTextAreaElement): boolean {
        const {history} = this.props;
        let {historyCursor} = this.state;

        // Show back
        if (code === 'up arrow') {
            historyCursor--;

            if (historyCursor < 0) {
                this.setState({historyCursor: 0});

                return true;
            }

            (input.selectionStart === 0 && input.selectionEnd === 0) ?
                this.setState({historyCursor, value: history[historyCursor]}) :
                input.setSelectionRange(0, 0);

            event.preventDefault();

            return true;
        }

        // Move forward
        if (code === 'down arrow') {

            let len = history[historyCursor]?history[historyCursor].length : 0;

            historyCursor++;

            if (historyCursor >= history.length && input.selectionStart === len && input.selectionEnd === len) {
                this.setState({historyCursor: history.length, value: ''});

                return true;
            }

            (input.selectionStart === len && input.selectionEnd === len) ?
                this.setState({historyCursor, value: history[historyCursor]}, () => {
                    input.setSelectionRange(0, 0)
                }) :
                input.setSelectionRange(len, len);

            event.preventDefault();

            return true;
        }

        return false;
    }

    /**
     * Get entry for search from full input.value string
     *
     * @method {getCurrentCommandPiece}
     *
     * @returns {string}
     */
    getCurrentCommandPiece(): string | undefined {
        let {input} = this;
        let pos: number = input ? input.selectionStart : 0;
        let commands: Array<string> = (input ? input.value.substring(0, pos) : '').split(/[\s+()]/);

        // Get last entry from string
        if (commands && commands.length) {
            return commands.pop();
        }

        return '';
    }

    /**
     * Set closing bracket of given type
     *
     * @method {setClosingBracketOrQuoteIntoInput}
     *
     * @param {string} open
     */
    setClosingBracketOrQuoteIntoInput(open: string = '(') {
        // No need to go further
        if (!this.input) {
            return;
        }

        let brackets = Input.commasAndQuotes;
        let {input} = this;
        let pos: number = input.selectionStart || 0;
        let close: string = brackets[open] ? brackets[open] : brackets['('];

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

    /**
     * Set closing bracket of given type
     *
     * @method {unsetClosingBracketOrQuoteIntoInput}
     */
    unsetClosingBracketOrQuoteIntoInput() {
        // No need to go further
        if (!this.input) {
            return;
        }

        let {input} = this;
        let pos: number = input.selectionStart || 0;
        let open: string = this.input.value.substr(pos - 1, 1);
        let close: string = Input.commasAndQuotes[open];

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

    /**
     * Set command into input using found autocomplition variants
     *
     * @method {setCommandIntoInput}
     */
    setCommandIntoInput() {
        // No need to go further
        if (!this.input) {
            return;
        }

        let {input} = this;
        let beg: number = input.selectionStart || 0;
        let end: number = input.selectionEnd || 0;
        let pos: number = beg;
        let isFunc: boolean = false;
        let insert = this.getCurrentCommandPiece();
        let missing: string | undefined = '';
        let vocabulary = Input.commandsVocabulary;
        let command: string | undefined = '';
        let commands: Array<string> = this.getFilteredCommandsList();

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

    /**
     * Get list of commands filtered with needed command piece
     *
     * @method {getFilteredCommandsList}
     *
     * @returns {Array}
     */
    getFilteredCommandsList(): Array<string> {
        let seek: any = this.getCurrentCommandPiece();
        let list: Array<string> = [];

        if (seek) {
            // Get filtered list if possible
            list = Input.commandsList.filter((item: string) => {
                return item.indexOf(seek) === 0;
            });

            // Check for values inside
            if (list.length) {
                return list;
            }
        }

        return [];
    }

    /**
     * @method {render}
     *
     * @returns {React.Element}
     */
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

    /**
     * @method {createSuggest}
     *
     * @returns {React.Element}
     */
    createSuggest(dropdown: boolean) {
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

    /**
     * @method {createTextarea}
     *
     * @returns {React.Element}
     */
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

/**
 * <SuggestRoot />
 *
 * @function {SuggestRoot}
 *
 * @param {ISuggestRootProps} props
 *
 * @returns {React.Element}
 */
function SuggestRoot(props: ISuggestRootProps) {
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

/**
 * <SuggestList />
 *
 * @function {SuggestList}
 *
 * @param {ISuggestRootProps} props
 *
 * @returns {React.Element}
 */
function SuggestList(props: ISuggestRootProps) {
    // No need to go further
    if (!props.commands || !props.commands.length) {
        return null;
    }

    const commands = props.commands.map((item: string, index: number) => {
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

/**
 * <SuggestItem />
 *
 * @function {SuggestItem}
 *
 * @param {object} props
 *
 * @returns {React.Element}
 */
function SuggestItem(props: ISuggestItemProps) {
    return (<li
        className={'Suggest__item' + (props.selected ? ' Suggest__item_is_selected' : '')}
    >
        {props.title}
    </li>);
}
