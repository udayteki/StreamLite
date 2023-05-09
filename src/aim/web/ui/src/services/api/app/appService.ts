// .tsignore
import { IApiRequest } from 'types/services/services';

import API from '../api';

const endpoints = {
  APPS: 'apps',
};

function fetchApp() {
  return API.get(`${endpoints.APPS}/app/`);
}

const appService = {
  fetchApp,
};

export default appService;
