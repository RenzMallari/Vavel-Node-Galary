import axios from "axios";
import config from "../config";

export const request = (opts = {}, optsHeader = {}) => {
  const defaultOptions = {
    ...opts,
    headers: optsHeader
  };
  /*
  |--------------------------------------------------
  | Custom axios api
  |--------------------------------------------------
  */

  const axiosApi = axios.create({
    baseURL: config.REACT_APP_API_SERVER_URL + config.REACT_APP_API_URL,
    ...defaultOptions,
    withCredentials: true
  });

  // error will be showed in catch block instead of appeared in then
  axiosApi.interceptors.request.use(
    function(config) {
      // Do something before request is sent
      //NOTE: log here to see the config of request,
      //TODO: remove when authentication feature completed
      // console.log(config)
      return config;
    },
    function(error) {
      // Do something with request error
      return Promise.reject(error);
    }
  );
  axiosApi.interceptors.response.use(
    function(response) {
      if (response.data.type === "error") {
        throw response.data.msg || "Load API error";
      }
      return response;
    },
    function(error) {
      // Do something with response error
      // Handle logout here
      // if (error.response.status === 401) {
      // }
      return Promise.reject(error.response);
    }
  );

  return axiosApi;
};

export default request;
