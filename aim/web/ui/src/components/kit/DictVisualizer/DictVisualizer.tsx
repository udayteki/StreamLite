import * as React from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { formatValue } from 'utils/formatValue';

import Text from '../Text';

import { IDictVisualizerProps } from './DictVisualizer.d';

import './DictVisualizer.scss';

//returns a string "type" of input object
export function toType(obj: any) {
  let type = getType(obj);
  // some extra disambiguation for numbers
  if (type === 'number') {
    if (isNaN(obj)) {
      type = 'nan';
    } else if ((obj | 0) != obj) {
      //bitwise OR produces integers
      type = 'float';
    } else {
      type = 'integer';
    }
  }
  return type;
}

//source: http://stackoverflow.com/questions/7390426/better-way-to-get-type-of-a-javascript-variable/7390612#7390612
function getType(obj: any) {
  return ({} as any).toString
    .call(obj)
    .match(/\s([a-zA-Z]+)/)[1]
    .toLowerCase();
}

function DictVisualizer(props: IDictVisualizerProps) {
  const flattenDict = React.useCallback(
    (dict: { [key: string]: unknown }, level: number = 0) => {
      let rows: {
        level: number;
        key: string;
        value: unknown;
        type: string;
      }[] = [];
      for (let key in dict) {
        let item: unknown = dict[key];
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          rows.push({
            level,
            key,
            value: undefined,
            type: toType(item),
          });
          rows.push(
            ...flattenDict(item as { [key: string]: unknown }, level + 1),
          );
        } else {
          rows.push({
            level,
            key,
            value: formatValue(item),
            type: toType(item),
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
                    style={style}
                  >
                    {Array(row.level)
                      .fill('_')
                      .map((_, i) => (
                        <div key={i} className='DictVisualizer__row__indent' />
                      ))}
                    <Text size={14}>{formatValue(row.key)}</Text>:{' '}
                    <Text size={10}>{row.type}</Text>{' '}
                    <Text size={14}>{row.value as string}</Text>
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
