import * as React from 'react';
import ReactJson from 'react-json-view';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IJSONViewerProps } from './JSONViewer.d';

import './JSONViewer.scss';

function JSONViewer(
  props: IJSONViewerProps,
): React.FunctionComponentElement<React.ReactNode> {
  const [cursor, setCursor] = React.useState(0);
  const data = React.useRef<{ [key: string]: unknown }>({});
  const isFullySliced = React.useRef<boolean>(false);

  const getSrcSlice = React.useCallback(
    (object: object, current: number, i: number = 0) => {
      let dict: { [key: string]: unknown } = {};
      let fullDictSliced = true;
      for (let key in object) {
        if (i >= current && i < current + 100) {
          let item = (object as any)[key];
          if (
            typeof item === 'object' &&
            item !== null &&
            !Array.isArray(item)
          ) {
            const {
              result,
              index,
              fullDictSliced: isFullySliced,
            } = getSrcSlice(item, current, i);
            dict[key] = result;
            i = index;
            // if (!isFullySliced) {
            //   fullDictSliced = false;
            //   break;
            // }
          } else {
            dict[key] = item;
            i++;
          }
        } else if (i >= current + 100) {
          fullDictSliced = false;
          break;
        } else {
          i++;
        }
      }

      return {
        result: dict,
        index: i,
        fullDictSliced,
      };
    },
    [],
  );

  React.useEffect(() => {
    let timerID: number;
    if (!isFullySliced.current) {
      timerID = window.setTimeout(() => {
        const { result, index, fullDictSliced } = getSrcSlice(
          props.src,
          cursor,
        );
        data.current = {
          ...result,
        };
        isFullySliced.current = fullDictSliced;
        console.log(fullDictSliced, index);
        setCursor(index);
      }, 250);
    }

    return () => {
      clearTimeout(timerID);
    };
  }, [cursor, props.src, getSrcSlice]);

  return (
    <ErrorBoundary>
      <ReactJson {...props} src={data.current} />
    </ErrorBoundary>
  );
}

JSONViewer.displayName = 'JSONViewer';

export default React.memo<IJSONViewerProps>(JSONViewer);
