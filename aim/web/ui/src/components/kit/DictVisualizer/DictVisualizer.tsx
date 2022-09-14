import * as React from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { formatValue } from 'utils/formatValue';

import Text from '../Text';

import { IDictVisualizerProps } from './DictVisualizer.d';

import './DictVisualizer.scss';

function DictVisualizer(props: IDictVisualizerProps) {
  const flattenDict = React.useCallback(
    (dict: { [key: string]: unknown }, level: number = 0) => {
      let rows: {
        level: number;
        key: string;
        value: unknown;
      }[] = [];
      for (let key in dict) {
        let item: unknown = dict[key];
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          rows.push({
            level,
            key,
            value: undefined,
          });
          rows.push(
            ...flattenDict(item as { [key: string]: unknown }, level + 1),
          );
        } else {
          rows.push({
            level,
            key,
            value: formatValue(item),
          });
        }
      }

      return rows;
    },
    [],
  );

  const rows = React.useMemo(() => {
    return flattenDict(props.src as { [key: string]: unknown });
  }, [props.src]);

  return (
    <ErrorBoundary>
      <div style={props.style} className='DictVisualizer'>
        <AutoSizer>
          {({ width, height }) => (
            <List
              width={width}
              height={height}
              itemCount={rows.length}
              itemSize={13}
            >
              {({ index, style }: ListChildComponentProps) => {
                const row = rows[index];
                return (
                  <div
                    key={row.key}
                    className='DictVisualizer__row'
                    style={{
                      ...style,
                      paddingLeft: (row.level + 1) * 10,
                      borderLeft: '1px solid #ccc',
                    }}
                  >
                    <Text>
                      {row.key}: {row.value}
                    </Text>
                  </div>
                );
              }}
            </List>
          )}
        </AutoSizer>
      </div>
    </ErrorBoundary>
  );
}

DictVisualizer.displayName = 'DictVisualizer';

export default React.memo<IDictVisualizerProps>(DictVisualizer);
