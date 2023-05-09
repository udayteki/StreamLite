import React from 'react';
import { useModel } from 'hooks';

import appModel from 'services/models/app/appModel';

function useApp() {
  const appData = useModel(appModel);

  React.useEffect(() => {
    appModel.initialize();
    return () => {
      appModel.destroy();
    };
  }, []);
  function handleFileClick(file: string) {
    appModel.selectFile(file);
  }
  return {
    data: appData.data,
    board: appData.board,
    isLoading: appData.isLoading,
    handleFileClick: handleFileClick,
  };
}

export default useApp;
