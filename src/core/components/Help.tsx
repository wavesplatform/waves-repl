import * as React from 'react';

interface IProps {
    signatures: any[]
}

export default class Help extends React.Component <IProps> {

     getHelpItem = (sig: any, i: number, isFull?: boolean) => isFull
        ? <div key={i}>{`${sig.name}(${sig.args.map((a: any) => `${a.name}: ${a.type}`)})`}</div>
        : <div key={i}>{`full:${sig.name}(${sig.args.map((a: any) => `${a.name}: ${a.type}`)})`}</div>;

    render() {
        console.log(this.props.signatures != null)
        return <div>
            {this.props.signatures.length ? this.props.signatures.map((sig, i) =>
            this.getHelpItem(sig, i, this.props.signatures.length > 1)
            ) : `${this.props.signatures}`}
        </div>;
    }
}
