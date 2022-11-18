import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';

import { useModel } from '../../hooks';
import bookmarkAppModel from '../../services/models/bookmarks/bookmarksAppModel';
import { ExplorerConfiguration } from '../../modules/BaseExplorer/types';
import renderer, { getDefaultHydration } from '../../modules/BaseExplorer';
import { AimObjectDepths, SequenceTypesEnum } from '../../types/core/enums';
import Figures from '../../modules/BaseExplorer/components/Figures/Figures';
import bookmarksAppModel from '../../services/models/bookmarks/bookmarksAppModel';
import metricAppModel from '../../services/models/metrics/metricsAppModel';
import exceptionHandler from '../../utils/app/exceptionHandler';
import { IApiRequest } from '../../types/services/services';
import appsService from '../../services/api/apps/appsService';
import BookmarkForm from '../../components/BookmarkForm/BookmarkForm';
import { Icon } from '../../components/kit';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import AudioBox from '../../modules/BaseExplorer/components/AudioBox';
import { getAudiosDefaultConfig } from '../AudioExplorer/config';
const defaultConfig = getDefaultHydration();
const defaultAudio = getAudiosDefaultConfig();
const confFigures = {
  persist: true,
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

const builtInEngines = {
  figures: confFigures,
  audio: {
    name: 'Audio Explorer Bookmarked',
    sequenceName: SequenceTypesEnum.Audios,
    basePath: 'audios',
    persist: true,
    adapter: {
      objectDepth: AimObjectDepths.Index,
    },
    groupings: defaultAudio.groupings,
    visualizations: {
      vis1: {
        component: defaultAudio.Visualizer,
        controls: defaultAudio.controls,
        box: {
          component: AudioBox,
          hasDepthSlider: defaultAudio.box.hasDepthSlider,
          initialState: defaultAudio.box.initialState,
        },
      },
    },
  },
};

function SaveArea({ save, update }: any) {
  const [popover, setPopover] = React.useState<string>('');

  function handleBookmarkClick(value: string): void {
    setPopover(value);
  }

  function handleClosePopover(): void {
    setPopover('');
  }
  function onClickSave(d: any) {
    save(d);
    setPopover('');
  }
  function onClickUpdate() {
    update();
    setPopover('');
  }
  return (
    <div>
      <button onClick={() => handleBookmarkClick('create')}>Save as new</button>
      <button onClick={() => handleBookmarkClick('update')}>Update</button>
      <BookmarkForm
        onBookmarkCreate={onClickSave}
        onClose={handleClosePopover}
        open={popover === 'create'}
      />
      <ConfirmModal
        open={popover === 'update'}
        onCancel={handleClosePopover}
        onSubmit={onClickUpdate}
        text='Are you sure you want to update view?'
        icon={<Icon name='check' />}
        title='Update'
        statusType='success'
        confirmBtnText='Update'
      />
    </div>
  );
}

function View({
  config,
  state,
}: {
  config: ExplorerConfiguration;
  state: any;
}) {
  const Explorer = renderer(config, __DEV__);

  function save({ name, description }: any) {
    // @TODO get diff of state and take into account only 'bookmarkable' chunks
    // @ts-ignore
    const data = Explorer.getState();
    createBookmark({ name, description }, data);
  }

  function update() {
    appsService
      // @ts-ignore
      .updateApp(state.id, { state: Explorer.getState(), type: state.type })
      .call()
      .then(() => {
        alert('Updated');
      });
  }

  function createBookmark(conf: any, data: any) {
    bookmarksAppModel
      .createBookmark(conf.name, conf.description, state.type, data)
      .then(() => {
        alert('Saved as new view');
      });
  }

  // @ts-ignore
  Explorer.setState(state);

  return (
    <>
      <SaveArea save={save} update={update} />
      <Explorer />
    </>
  );
}

function SavedViews() {
  const {
    params: { id },
  } = useRouteMatch<{ id?: string }>();
  const [state, setState] = React.useState<{ type: 'figures' | 'audio' }>();

  useEffect(() => {
    const req = appsService.fetchApp(id as string);
    req.call().then((res) => {
      setState(res);
    });
  }, [id]);

  return (
    <div>
      {state ? (
        <View config={builtInEngines[state.type]} state={state} />
      ) : (
        'waiting...'
      )}
    </div>
  );
}

export default SavedViews;
