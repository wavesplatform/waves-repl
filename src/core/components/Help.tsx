import * as React from 'react';
import { typeChecker as tc } from '../utils';
import { TArgument, TSchemaType } from '../../../scripts/buildHelp';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';
import '../../css/Help.css';

interface IProps {
    signatures: any[]
}

export default class Help extends React.Component <IProps> {

    render() {
        return <div style={{background: '#282c34'}}>
            {this.props.signatures.length ? this.props.signatures.map((sig, i) =>
                <Signature sig={sig} key={i} isDoc={this.props.signatures.length === 1}/>
            ) : `${this.props.signatures}`}
        </div>;
    }
}


const Signature = ({sig, isDoc}: { sig: TSchemaType, isDoc?: boolean }) => {
    const doc = (sig.doc !== '' && isDoc) ? <div className="docStyle">{sig.doc}</div> : <></>;
    return <>
        <div className="lineStyle">
            <Tooltip placement="top" trigger={['hover']} overlay={<span>{sig.doc}</span>} destroyTooltipOnHide>
                <div className="hov">{sig.name}</div>
            </Tooltip>
            <div>&nbsp;(</div>
            {sig.args.map((a: TArgument, i: number) =>
                <Argument a={a} key={i} isLast={sig.args.length - 1 === i}/>)
            }
            <div>)</div>
            {sig.resultType === ''
                ? ''
                : <>
                    <div>:&nbsp;</div>
                    {sig.resultTypeTips.length > 0
                        ? <div className="flex">
                            <ResultType sig={sig}/>
                        </div>
                        : <div>{sig.resultType}</div>
                    }
                </>}
        </div>
        {doc}
    </>;
};

const Argument = ({a, isLast}: { a: TArgument, isLast: boolean }) =>
    <Tooltip placement="top" trigger={['hover']} overlay={<span>{tc.getTypeDoc(a)}</span>} destroyTooltipOnHide>
        <div className="hov">
            {a.name}
            {a.optional && '?'}
            :&nbsp;{tc.getTypeDoc(a, true)}{!isLast && <>,&nbsp;</>}
        </div>
    </Tooltip>;

const ResultType = ({sig}: { sig: TSchemaType }) => {
    const type = sig.resultType;
    const typeOut: string[] = [];
    const sortedTips = sig.resultTypeTips.sort((a, b) => (a.range.start > b.range.start) ? 1 : -1);
    //todo check sort func
    sortedTips.forEach((tip, i) => {
        if (tip.range.start !== 0 && i === 0) {
            typeOut.push(type.slice(0, tip.range.start));
        } else {
            typeOut.push(type.slice(tip.range.start, tip.range.end + 1));
            if (i === sortedTips.length - 1) {
                if (tip.range.end < type.length - 1) {
                    typeOut.push(type.slice(tip.range.end + 1, type.length));
                }
            } else {
                typeOut.push(type.slice(tip.range.end, sortedTips[i + 1].range.start));
            }
        }
    });
    console.log(typeOut);
    return <Tooltip placement="top" trigger={['hover']} overlay={<span>{sig.resultType}</span>} destroyTooltipOnHide>
        <div>{sig.resultType}</div>
    </Tooltip>;
};
