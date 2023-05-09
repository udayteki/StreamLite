import * as React from 'react';

import { Button } from 'components/kit_v2';

import appModel from '../../../../services/models/app/appModel';

function BoardLinkVizElement(props: any) {
  const onClick = () => {
    console.log(props);
    appModel.selectFile(props.data);
  };

  return (
    <Button {...props.options} onClick={onClick}>
      {props.options.label}
    </Button>
  );
}
export default BoardLinkVizElement;
