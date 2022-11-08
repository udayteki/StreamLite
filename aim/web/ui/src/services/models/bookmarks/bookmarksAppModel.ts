import dashboardService from 'services/api/dashboard/dashboardService';
import appsService from 'services/api/apps/appsService';

import { IBookmarksAppModelState } from 'types/services/models/bookmarks/bookmarksAppModel';
import { IBookmarksData } from 'types/pages/bookmarks/Bookmarks';

import onNotificationAdd from 'utils/app/onNotificationAdd';
import exceptionHandler from 'utils/app/exceptionHandler';
import onNotificationDelete from 'utils/app/onNotificationDelete';

import createModel from '../model';
import {
  IAppData,
  IDashboardData,
} from '../../../types/services/models/metrics/metricsAppModel';
import { BookmarkNotificationsEnum } from '../../../config/notification-messages/notificationMessages';

let bookmarksRequestRef: {
  call: (exceptionHandler: (detail: any) => void) => Promise<any>;
  abort: () => void;
};

const model = createModel<IBookmarksAppModelState>({
  isLoading: true,
  listData: [],
  notifyData: [],
});

function getBookmarksData() {
  const { call, abort } = dashboardService.fetchDashboardsList();
  return {
    call: () =>
      call().then(async (data: any) => {
        try {
          const appsList = await appsService
            .fetchAppsList()
            .call((detail: any) => {
              exceptionHandler({ detail, model: model as any });
            });
          const listData = data.map((item: any) => {
            const app = appsList.find(
              (appData: any) => appData.id === item.app_id,
            );
            return { ...item, select: app.state.select, type: app.type };
          });
          model.setState({
            isLoading: false,
            listData,
          });
        } catch (err: any) {
          onNotificationAdd({
            notification: {
              id: Date.now(),
              messages: [err.message],
              severity: 'error',
            },
            model: model as any,
          });
        }
        model.setState({ isLoading: false });
      }),

    abort,
  };
}

function onBookmarksNotificationDelete(id: number) {
  onNotificationDelete({ id, model });
}

async function onBookmarkDelete(id: string) {
  try {
    model.setState({ isLoading: true });
    await dashboardService.deleteDashboard(id).call((detail: any) => {
      exceptionHandler({ detail, model });
    });
    const listData: IBookmarksData[] | any = model.getState()?.listData;
    const newListData = [...listData].filter((bookmark) => bookmark.id !== id);
    model.setState({
      listData: newListData,
      isLoading: false,
    });
  } catch (err: any) {
    model.setState({
      isLoading: false,
    });
    onNotificationAdd({
      notification: {
        id: Date.now(),
        messages: [err.message],
        severity: 'error',
      },
      model: model as any,
    });
  }
}

function initialize() {
  model.init();
  try {
    bookmarksRequestRef = getBookmarksData();
    bookmarksRequestRef.call((detail) => {
      exceptionHandler({ detail, model: model as any });
      model.setState({
        isLoading: false,
      });
    });
  } catch (err: any) {
    onNotificationAdd({
      notification: {
        id: Date.now(),
        messages: [err.message],
        severity: 'error',
      },
      model: model as any,
    });
    model.setState({
      isLoading: false,
    });
    bookmarksRequestRef.abort();
  }
}

function destroy() {
  bookmarksRequestRef.abort();
  model.destroy();
}

function resetData() {
  model.setState({
    isLoading: true,
    listData: [],
    notifyData: [],
  });
}

async function createBookmark(name: string, description: string, data: any) {
  const app: IAppData | any = await appsService
    .createApp({
      state: data,
      type: 'figures',
    })
    .call((detail: any) => {
      exceptionHandler({ detail, model });
    });
  const bookmark: IDashboardData = await dashboardService
    .createDashboard({ app_id: app.id, name, description })
    .call((detail: any) => {
      exceptionHandler({ detail, model });
    });
  if (bookmark.name) {
    onNotificationAdd({
      notification: {
        id: Date.now(),
        severity: 'success',
        messages: [BookmarkNotificationsEnum.CREATE],
      },
      model,
    });
  } else {
    onNotificationAdd({
      notification: {
        id: Date.now(),
        severity: 'error',
        messages: [BookmarkNotificationsEnum.ERROR],
      },
      model,
    });
  }
  console.log(bookmark);
}

const bookmarkAppModel = {
  ...model,
  initialize,
  resetData,
  destroy,
  getBookmarksData,
  onBookmarkDelete,
  onBookmarksNotificationDelete,
  createBookmark,
};

export default bookmarkAppModel;
