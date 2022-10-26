import * as React from 'react';
import which from '../../lib/which-type';
import { ITypeState } from "./ITypeState";

interface IEntryTypeProps {
    allowOpen: boolean,
    open: boolean,
    value: [string, any],
    shallow?: boolean
}

export class EntryType extends React.Component<any, ITypeState> {
    constructor(props: IEntryTypeProps) {
        super(props);
        this.toggle = this.toggle.bind(this);

        this.state = {
            open: props.open,
        };
    }

    toggle(e: React.MouseEvent) {
        if (!this.props.allowOpen) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
        this.setState({open: !this.state.open});
    }

    render() {
        // const { shallow = true } = this.props;
        const entry = this.props.value;
        const {open} = this.state;

        const [key, value] = entry;

        const Key = which(key);
        const Value = which(value);

        if (!open) {
            return (
                <div onClick={this.toggle} className="type entry closed">
                    <div className="object-item key-value">
            <span className="key">
            {/* @ts-ignore */}
                <Key allowOpen={open} value={key}/>
            </span>
                        <span className="arb-info">{`=>`} </span>
                        <span className="value">
                            {/* @ts-ignore */}
                            <Value allowOpen={open} value={value}/>
            </span>
                    </div>
                </div>
            );
        }

        return (
            <div onClick={this.toggle} className="type entry">
                <span>{'{'}</span>
                <div className="group">
                    <div className="object-item key-value">
                        <span className="key">key:</span>
                        <span className="value">
                            {/* @ts-ignore */}
              <Key allowOpen={open} value={key}/>
            </span>
                    </div>
                    <div className="object-item key-value">
                        <span className="key">value:</span>
                        <span className="value">
                            {/* @ts-ignore */}
              <Value allowOpen={open} value={value}/>
            </span>
                    </div>
                </div>
                <span>{'}'}</span>
            </div>
        );
    }
}
