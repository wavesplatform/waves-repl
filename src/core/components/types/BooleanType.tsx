import * as React from 'react';

export class BooleanType extends React.Component<{value:boolean}> {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { value } = this.props;
    return <div className="bool type">{value ? 'true' : 'false'}</div>;
  }
}
