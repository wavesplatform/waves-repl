import * as React from 'react'

export class NullType extends React.Component {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        return <div className="type null">null</div>;
    }
}

