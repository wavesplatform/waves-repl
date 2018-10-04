import * as React from 'react';
import ObjectType from './ObjectType';

class ErrorType extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: props.open,
    };
  }

  render() {
    const { value, shallow = true, filter, allowOpen } = this.props;
    const { open } = this.state;

    const sig = value.name || value.constructor.name;

    return (
      <ObjectType
        filter={filter}
        allowOpen={allowOpen}
        type="error"
        shallow={shallow}
        open={open}
        value={value}
        displayName={sig}
      />
    );
  }
}

export default ErrorType;
