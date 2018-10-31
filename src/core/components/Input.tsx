import * as React from 'react';
import {WavesConsoleAPIHelp} from '../../WavesConsoleAPI';

// TODO import Autocomplete from './Autocomplete';
import keycodes from '../lib/keycodes';

/**
 * @class {Input}
 * @extends {React.Component}
 */
export class Input extends React.Component<any, any> {

    /**
     * @private
     * @member {HTMLTextAreaElement?} input
     */
    private input?: HTMLTextAreaElement | null;

    /**
     * @static
     * @member {object} commandsVocabulary
     */
    static commandsVocabulary:any = WavesConsoleAPIHelp.texts;

    /**
     * @static
     * @member {Array} commandsList
     */
    static commandsList:any = Object.keys(WavesConsoleAPIHelp.texts);

    /**
     * @static
     * @member {object} commasAndQuotes
     */
    static commasAndQuotes:any = {
        '(': ')',
        '{': '}',
        '[': ']',
        '"': '"',
        "'": "'"
    }

    /**
     * @constructor
     *
     * @param {object} props
     */
    constructor(props: any) {
        super(props);

        // history is set in the componentDidMount
        this.state = {
            value: props.value || '',
            multiline: false,
            rows: 1,
            historyCursor: props.history.length,
        };

        // Bind some methods to instance
        this.onChange = this.onChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
    }

    /**
     * @method {onChange}
     */
    onChange() {
        if (!this.input) return;

        const { value } = this.input;
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
     * @param {React.KeyboardEvent} e
     *
     * @returns {Promise}
     */
    async onKeyPress(e: React.KeyboardEvent) {
        if (!this.input) return;

        const code = keycodes[e.keyCode];
        const { multiline } = this.state;
        const { history } = this.props;
        let { historyCursor } = this.state;

        // FIXME in multiline, cursor up when we're at the top
        // const cursor = getCursor(this.input);

        // Clear console
        if (e.ctrlKey && code === 'l') {
            this.props.onClear();
            return;
        }

        // Insert value from suggested commands
        if (code == 'tab') {
            e.preventDefault();
            this.setCommandIntoInput();
        }

        // Insert closing bracket if needed
        switch (code) {
            case '9':
                if (e.shiftKey) {
                    this.setClosingBracketOrQuoteIntoInput('(');
                }
                break;
            case 'open bracket':
                if (e.shiftKey) {
                    this.setClosingBracketOrQuoteIntoInput('{');
                } else {
                    this.setClosingBracketOrQuoteIntoInput('[');
                }
                break;
            case 'single quote / ø':
                if (e.shiftKey) {
                    this.setClosingBracketOrQuoteIntoInput('"');
                } else {
                    this.setClosingBracketOrQuoteIntoInput("'");
                }
                break;
            case 'backspace / delete':
                this.unsetClosingBracketOrQuoteIntoInput();
                break;
        }

        // Move in history if not in multiline mode
        if (!multiline) {
            if (code === 'up arrow') {
                historyCursor--;
                if (historyCursor < 0) {
                    this.setState({historyCursor: 0});
                    return;
                }
                this.setState({historyCursor, value: history[historyCursor]});
                // this.onChange();
                e.preventDefault();
                return;
            }

            if (code === 'down arrow') {
                historyCursor++;
                if (historyCursor >= history.length) {
                    this.setState({historyCursor: history.length, value: ''});
                    return;
                }
                this.setState({historyCursor, value: history[historyCursor]});
                e.preventDefault();
                return;
            }
        }

        // Remove suggestions block if needed
        if (code === 'escape') {
            e.preventDefault();
            this.setState({hideSuggest: true});
            return;
        } else {
            this.setState({hideSuggest: false});
        }

        // Add command to history and try to execute it
        const command = this.input.value;

        if (code === 'enter') {
            if (e.shiftKey) {
                return;
            }

            if (!command) {
                e.preventDefault();
                return;
            }

            this.props.addHistory(command);
            this.setState({historyCursor: history.length + 1, value: ''});
            e.preventDefault();
            await this.props.onRun(command);
            // Don't use `this.input.scrollIntoView();` as it messes with iframes
            //window.scrollTo(0, document.body.scrollHeight);
            return;
        }
    }

    /**
     * Get entry for search from full input.value string
     *
     * @method {getCurrentCommandPiece}
     *
     * @returns {string}
     */
    getCurrentCommandPiece() {
        let input:any = this.input;
        let pos:any = input ? input.selectionStart : 0;
        let commands:any = (input ? input.value.substring(0, pos) : '').
                           split(/[\s+()]/);

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
    setClosingBracketOrQuoteIntoInput(open:any = '(') {
        // No need to go further
        if (!this.input) {
            return;
        }

        let brackets:any = Input.commasAndQuotes;
        let input:any = this.input;
        let pos:any = input.selectionStart || 0;
        let close = brackets[open] ? brackets[open] : brackets['('];

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

        let input:any = this.input;
        let pos:any = input.selectionStart || 0;
        let open:any = this.input.value.substr(pos - 1, 1);
        let close:any = Input.commasAndQuotes[open];

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

        let input:any = this.input;
        let beg:any = input.selectionStart || 0;
        let end:any = input.selectionEnd || 0;
        let pos:any = beg;
        let isFunc:any = false;
        let insert:any = this.getCurrentCommandPiece();
        let vocabulary:any = Input.commandsVocabulary;
        let command:any = '';
        let commands:any = this.getFilteredCommandsList();

        // Autocomplete works only if one value in list
        if (commands.length != 1) {
            return;
        }

        // Get full command
        command = commands[0];

        // No need to go further
        if (!command) {
            return;
        }

        // Check if it's method or member
        isFunc = vocabulary[command] && vocabulary[command].params !== undefined ?
                 true :
                 false;

        // Get missing part of command name
        insert = command.substring(insert.length);

        // Set new value
        input.value = input.value.substring(0, beg) +
                      insert + (isFunc ? '()' : '') + 
                      input.value.substring(end);

        // Set new caret position
        pos += insert.length;
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
    getFilteredCommandsList() {
        let seek:any = this.getCurrentCommandPiece();
        let list:any = null;

        if (seek) {
            // Get filtered list if possible
            list = Input.commandsList.filter((item:any) => {
                if (item.indexOf(seek) === 0) {
                    return true;
                }

                return false;
            });

            // Check for values inside
            if (list && list.length) {
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
        const suggest = !this.state.hideSuggest ? this.createSuggest() : null;
        const textarea = this.createTextarea();

        return (
            <div className="Input">
                {suggest}
                {/*<Autocomplete value={this.state.value} />*/}
                {textarea}
            </div>
        );
    }

    /**
     * @method {createSuggest}
     *
     * @returns {React.Element}
     */
    createSuggest() {
        return (<SuggestRoot
            value={this.state.value}
            position={this.state.position}
            commands={this.getFilteredCommandsList()}
        />);
    }

    /**
     * @method {createTextarea}
     *
     * @returns {React.Element}
     */
    createTextarea() {
        const { autoFocus } = this.props;

        return (
            <textarea
                className="cli"
                rows={this.state.rows}
                autoFocus={autoFocus}
                ref={e => {
                    this.input = e;
                    this.props.inputRef(e);
                }}
                value={this.state.value}
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
 * @param {object} props
 *
 * @returns {React.Element}
 */
function SuggestRoot(props:any):any {
    // No need to go further
    if (!props.commands || !props.commands.length || !props.value) {
        return null;
    }

    return (
        <div className="Suggest">
            <SuggestList {... props} />
            &nbsp;
        </div>
    );
}

/**
 * <SuggestList />
 *
 * @function {SuggestList}
 *
 * @param {object} props
 *
 * @returns {React.Element}
 */
function SuggestList(props:any):any {
    const commands = props.commands.map((item:any, index:any) => {
        return (<SuggestItem
                   key={'commands-suggest-item-' + index}
                   title={item}
                   selected={index === props.position}
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
function SuggestItem(props:any):any {
    return (<li
        className = {'Suggest__item' + (props.selected ? ' Suggest__item_is_selected' : '')}
    >
        {props.title}
    </li>);
}
