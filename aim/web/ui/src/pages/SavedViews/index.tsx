import React, { FunctionComponent } from 'react';

import { useModel } from '../../hooks';
import bookmarkAppModel from '../../services/models/bookmarks/bookmarksAppModel';
import { ExplorerConfiguration } from '../../modules/BaseExplorer/types';
import renderer, { getDefaultHydration } from '../../modules/BaseExplorer';
import { AimObjectDepths, SequenceTypesEnum } from '../../types/core/enums';
import Figures from '../../modules/BaseExplorer/components/Figures/Figures';
import bookmarksAppModel from '../../services/models/bookmarks/bookmarksAppModel';
const defaultConfig = getDefaultHydration();

const confFigures = {
  persist: false,
  sequenceName: SequenceTypesEnum.Figures,
  name: 'Figures Explorer Bookmarked',
  adapter: {
    objectDepth: AimObjectDepths.Step,
  },
  groupings: defaultConfig.groupings,
  visualizations: {
    vis1: {
      component: defaultConfig.Visualizer as FunctionComponent,
      controls: defaultConfig.controls,
      box: {
        component: Figures,
        hasDepthSlider: defaultConfig.box.hasDepthSlider,
        initialState: defaultConfig.box.initialState,
      },
    },
  },
};

function View({
  config,
  saveAsNew,
}: {
  config: ExplorerConfiguration;
  saveAsNew: (state: any) => void;
}) {
  const Explorer = renderer(config, __DEV__);
  function save() {
    // @ts-ignore
    const state = Explorer.getState();
    saveAsNew(state);
  }

  return (
    <>
      <button onClick={save}>Create bookmark</button>
      <Explorer />
    </>
  );
}

function SavedViews() {
  const bookmarksData = useModel(bookmarkAppModel);

  React.useEffect(() => {
    return () => {
      bookmarkAppModel.destroy();
    };
  }, []);

  function getExplorer() {
    bookmarkAppModel.initialize();
  }

  function deleteExplorer() {
    bookmarkAppModel.resetData();
  }

  function createBookmark(state: any) {
    bookmarksAppModel.createBookmark(
      'test new engine',
      'test new engine',
      state,
    );
  }
  console.log(bookmarksData);

  return (
    <div>
      <button onClick={getExplorer}>Get Saved Explorer</button>
      <button onClick={deleteExplorer}>Delete the Explorer</button>
      {bookmarksData?.listData.length ? (
        <View config={confFigures} saveAsNew={createBookmark} />
      ) : (
        <div>No explorer</div>
      )}
    </div>
  );
}

export default SavedViews;
