import * as types from "../constants";
import request from "../../utils/request";

export const getDataCms = (
  parmas = {},
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.GET_CMS_DATA,
    payload: {
      ...parmas
    }
  });
  return request()
    .get(`/cms/getcontentbypagename/${parmas.name}`)
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: response.data,
        type: types.GET_CMS_DATA_SUCCED
      })
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_CMS_DATA_FAIL
      });
    });
};