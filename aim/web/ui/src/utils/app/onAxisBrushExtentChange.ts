import _ from 'lodash';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export default function onAxisBrushExtentChange<M extends State>({
  key,
  extent,
  chartIndex,
  containerHeight,
  model,
  updateModelData,
}: {
  key: string;
  extent: [number, number] | null;
  chartIndex: number;
  containerHeight: number;
  model: IModel<M>;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
  const configData = model.getState()?.config;
  if (configData?.chart) {
    let brushExtents: {
      [key: string]: {
        [key: string]: [number, number];
      };
    } = {
      ...configData.chart.brushExtents,
    };
    if (_.isNil(extent)) {
      const chartBrushExtents = _.omit(brushExtents[chartIndex], key);
      if (_.isEmpty(chartBrushExtents)) {
        brushExtents = _.omit(brushExtents, chartIndex);
      } else {
        brushExtents = {
          ...brushExtents,
          [chartIndex]: chartBrushExtents,
        };
      }
    } else {
      brushExtents = {
        ...brushExtents,
        [chartIndex]: {
          ...brushExtents[chartIndex],
          [key]: extent,
        },
      };
    }

    configData.chart.brushExtents = brushExtents;
    configData.chart.containerHeight = containerHeight;

    updateModelData({ ...configData, chart: { ...configData?.chart } }, true);
  }
}
