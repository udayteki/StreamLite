import * as React from 'react';

import { Button } from 'components/kit_v2';

import appModel from '../../../../services/models/app/appModel';

function BoardLinkVizElement(props: any) {
  const onClick = () => {
    appModel.selectFile('exps/nested_import.py');
  };

  return (
    <Button {...props.options} onClick={onClick}>
      {props.options.label}
    </Button>
  );
}
export default BoardLinkVizElement;
