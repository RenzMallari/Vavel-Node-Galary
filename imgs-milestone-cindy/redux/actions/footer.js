import * as types from "../constants";
import request from "../../utils/request";

export const getDataFooter = (params = {}, resolve = () => {}) => dispatch => {
  dispatch({ type: types.GET_FOOTER_DATA });
  return request()
    .get("/settings/getsettingsbyid/1", { params })
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: response.data,
        type: types.GET_FOOTER_DATA_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_FOOTER_DATA_FAIL
      });
    });
};
