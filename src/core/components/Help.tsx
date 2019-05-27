import * as React from 'react';
import { TSignature } from '../../WavesConsoleAPI';

interface IProps {
    signatures: TSignature[]
}

export default class Help extends React.Component <IProps> {

     getHelpItem = (sig: TSignature, i: number, isFull?: boolean) => isFull
        ? <div key={i}>{`${sig.name}(${sig.args.map(a => `${a.name}: ${a.type}`)})`}</div>
        : <div key={i}>{`${sig.name}(${sig.args.map(a => `${a.name}: ${a.type}`)})`}</div>;

    render() {
        return <div>
            {this.props.signatures.map((sig, i) =>
                this.getHelpItem(sig, i, this.props.signatures.length > 1))}
        </div>;
    }
}
