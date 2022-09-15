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
      type = 'int';
    }
  } else if (type === 'boolean') {
    type = 'bool';
  } else if (type === 'undefined' || type === 'null') {
    type = '';
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

function typeToColor(item: any) {
  switch (item) {
    case 'int':
      return 'rgb(175, 85, 45)';
    case 'float':
      return 'rgb(92, 129, 21)';
    case 'string':
      return 'rgb(246, 103, 30)';
    case 'bool':
      return 'rgb(169, 87, 153)';
    case '':
      return '#586069';
    case 'object':
      return 'rgb(73, 72, 73)';
    case 'array':
      return '#586069';
    default:
      return '#1473e6';
  }
}

function DictVisualizer(props: IDictVisualizerProps) {
  const flattenDict = React.useCallback(
    (dict: { [key: string]: unknown } | unknown[], level: number = 0) => {
      let rows: {
        level: number;
        key: string | number | null;
        value: unknown;
        sub: string | null;
        color: string;
      }[] = [];
      if (level === 0) {
        if (Array.isArray(dict)) {
          let nestedItemsLength = dict.length;
          rows.push({
            level,
            key: null,
            value: '[',
            sub: `${nestedItemsLength} item${nestedItemsLength > 1 ? 's' : ''}`,
            color: typeToColor('array'),
          });
        } else {
          let nestedItemsLength = Object.keys(dict).length;
          rows.push({
            level,
            key: null,
            value: '{',
            sub: `${nestedItemsLength} item${nestedItemsLength > 1 ? 's' : ''}`,
            color: typeToColor('object'),
          });
        }
      }
      for (let key in dict) {
        let item: unknown = Array.isArray(dict) ? dict[+key] : dict[key];
        let type = toType(item);
        let color = typeToColor(type);
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          let nestedItemsLength = Object.keys(item).length;
          rows.push({
            level,
            key: formatValue(key),
            value: '{',
            sub: `${nestedItemsLength} item${nestedItemsLength > 1 ? 's' : ''}`,
            color: typeToColor('object'),
          });
          rows.push(
            ...flattenDict(item as { [key: string]: unknown }, level + 1),
          );
          rows.push({
            level,
            key: null,
            value: '}',
            sub: null,
            color: typeToColor('object'),
          });
        } else if (Array.isArray(item)) {
          rows.push({
            level,
            key: formatValue(key),
            value: '[',
            sub: `${item.length} item${item.length > 1 ? 's' : ''}`,
            color: typeToColor('array'),
          });
          rows.push(...flattenDict(item as unknown[], level + 1));
          rows.push({
            level,
            key: null,
            value: ']',
            sub: null,
            color: typeToColor('array'),
          });
        } else {
          rows.push({
            level,
            key: Array.isArray(dict) ? +key : formatValue(key),
            value: formatValue(item),
            sub: type,
            color,
          });
        }
      }

      if (level === 0) {
        if (Array.isArray(dict)) {
          rows.push({
            level,
            key: null,
            value: ']',
            sub: null,
            color: typeToColor('array'),
          });
        } else {
          rows.push({
            level,
            key: null,
            value: '}',
            sub: null,
            color: typeToColor('object'),
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
              itemSize={22}
            >
              {({ index, style }: ListChildComponentProps) => {
                const row = rows[index];
                return (
                  <div
                    key={row.key}
                    className='DictVisualizer__row'
                    style={style}
                  >
                    {index !== 0 &&
                      index !== rows.length - 1 &&
                      Array(row.level + 1)
                        .fill('_')
                        .map((_, i) => (
                          <div
                            key={i}
                            className='DictVisualizer__row__indent'
                          />
                        ))}
                    {row.key !== null && (
                      <Text size={16} className='DictVisualizer__row__key'>
                        {row.key}:
                      </Text>
                    )}
                    {row.sub !== null && (
                      <Text
                        size={12}
                        className='DictVisualizer__row__sub'
                        style={{ color: row.color }}
                      >
                        {row.sub}
                      </Text>
                    )}

                    <Text
                      size={16}
                      className='DictVisualizer__row__value'
                      style={{ color: row.color }}
                    >
                      {row.value as string}
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
