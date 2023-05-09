import appService from 'services/api/app/appService';

import onNotificationAdd from 'utils/app/onNotificationAdd';
import exceptionHandler from 'utils/app/exceptionHandler';
import onNotificationDelete from 'utils/app/onNotificationDelete';

import createModel from '../model';

let appRequestRef: {
  call: () => void;
  abort: () => void;
};

const model = createModel<any>({
  isLoading: true,
  data: false,
  board: {
    path: '',
  },
  notifyData: [],
});

function getAppData() {
  const { call, abort } = appService.fetchApp();

  return {
    call: () => {
      call((detail: any) => {
        exceptionHandler({ detail, model: model as any });
      }).then(async (data: any) => {
        try {
          model.setState({
            isLoading: false,
            data: data,
          });
        } catch (err: any) {}
        model.setState({ isLoading: false });
      });
    },
    abort,
  };
}

function initialize() {
  model.init();
  try {
    appRequestRef = getAppData();
    appRequestRef.call();
  } catch (err: any) {
    model.setState({
      isLoading: false,
    });
    appRequestRef.abort();
  }
}

function destroy() {
  appRequestRef.abort();
  model.destroy();
}

function selectFile(filePath: string) {
  model.setState({
    board: {
      path: filePath,
    },
  });
}

const appModel = {
  ...model,
  initialize,
  destroy,
  selectFile,
};

export default appModel;
