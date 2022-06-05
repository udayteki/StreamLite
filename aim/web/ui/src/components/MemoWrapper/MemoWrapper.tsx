import * as React from 'react';

import { IMemoWrapperProps } from './MemoWrapper.d';

function MemoWrapper(props: IMemoWrapperProps) {
  return props.children;
}

export default React.memo(
  MemoWrapper,
  (prevProps, nextProps) => prevProps.updateKey === nextProps.updateKey,
);
