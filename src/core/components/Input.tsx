import * as React from 'react';
import {WavesConsoleAPIHelp} from '../../WavesConsoleAPI';

// TODO import Autocomplete from './Autocomplete';
import keycodes from '../lib/keycodes';

export class Input extends React.Component<any, any> {
    private input?: HTMLTextAreaElement | null;

    static vocabulary:any = WavesConsoleAPIHelp.texts;

    static commands:any = Object.keys(WavesConsoleAPIHelp.texts);

    constructor(props: any) {
        super(props);

        // history is set in the componentDidMount
        this.state = {
            value: props.value || '',
            multiline: false,
            rows: 1,
            historyCursor: props.history.length,
        };
        this.onChange = this.onChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
    }

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

    async onKeyPress(e: React.KeyboardEvent) {
        if (!this.input) return;

        const code = keycodes[e.keyCode];
        const { multiline } = this.state;
        const { history } = this.props;
        let { historyCursor } = this.state;

        // FIXME in multiline, cursor up when we're at the top
        // const cursor = getCursor(this.input);

        if (e.ctrlKey && code === 'l') {
            this.props.onClear();
            return;
        }

        if (code == 'tab') {
            e.preventDefault();
            this.setCommandIntoInput();
        }

        if (!multiline) {
            if (code === 'up arrow') {
                historyCursor--;
                if (historyCursor < 0) {
                    this.setState({ historyCursor: 0 });
                    return;
                }
                this.setState({ historyCursor, value: history[historyCursor] });
                // this.onChange();
                e.preventDefault();
                return;
            }

            if (code === 'down arrow') {
                historyCursor++;
                if (historyCursor >= history.length) {
                    this.setState({ historyCursor: history.length, value: '' });
                    return;
                }
                this.setState({ historyCursor, value: history[historyCursor] });
                e.preventDefault();
                return;
            }
        }

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
            this.setState({ historyCursor: history.length + 1, value: '' });
            e.preventDefault();
            await this.props.onRun(command);
            // Don't use `this.input.scrollIntoView();` as it messes with iframes
            //window.scrollTo(0, document.body.scrollHeight);
            return;
        }
    }

    getCurrentCommandPiece() {
        let input:any = this.input;
        let pos:any = input ? input.selectionStart : 0;
        let commands:any = (input ? input.value.substring(0, pos) : '').split(/[\s+()]/);

        if (commands && commands.length) {
            return commands.pop();
        }

        return '';
    }

    setCommandIntoInput() {
        let input:any = this.input;
        let beg:any = input ? input.selectionStart : 0;
        let end:any = input ? input.selectionEnd : 0;
        let insert:any = this.getCurrentCommandPiece();
        let commands:any = this.getFilteredCommandsList();

        if (commands.length != 1) {
            return;
        }

        insert = commands[0].substring(insert.length);

/*
        this.setState({value: input.value.substring(0, beg) +
                      insert + '()' + 
                      input.value.substring(end)});
*/
        input.value = input.value.substring(0, beg) +
                      insert + '()' + 
                      input.value.substring(end);

        input.selectionStart = beg + insert.length + 1;
        input.selectionEnd = beg + insert.length + 1;

        this.setState({value: input.value});
    }

    getFilteredCommandsList() {
        let seek:any = this.getCurrentCommandPiece();
        let list:any = null;

        if (seek) {
            list = Input.commands.filter((item:any) => {
                if (item.indexOf(seek) === 0) {
                    return true;
                }

                return false;
            });

            if (list && list.length) {
                return list;
            }
        }

        return [];
    }

    render() {
        const textarea = this.renderTextarea();

        return (
            <div className="Input">
                <SuggestRoot
                    position={this.state.position}
                    commands={this.getFilteredCommandsList()}
                />
                {/*<Autocomplete value={this.state.value} />*/}
                {textarea}
            </div>
        );
    }

    renderTextarea() {
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

export function SuggestRoot(props:any):any {
    // No need to go further
    if (!props.commands || !props.commands.length) {
        return null;
    }

    return (
        <div className="Suggest">
            <SuggestList {... props} />
            &nbsp;
        </div>
    );
}

export function SuggestList(props:any):any {
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

export function SuggestItem(props:any):any {
    return (<li
        className = {'Suggest__item' + (props.selected ? ' Suggest__item_is_selected' : '')}
    >
        {props.title}
    </li>);
}
