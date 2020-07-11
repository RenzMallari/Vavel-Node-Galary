import * as types from "../constants";
import request from "../../utils/request";

export const getDataCatalogDetails = (
  params = {},
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.GET_CATALOG_DETAILS,
    payload: {
      ...params
    }
  });
  return request()
    .get(`catalog/getcatalogdetails/${params.keyword}`)
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: response.data,
        type: types.GET_CATALOG_DETAILS_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_CATALOG_DETAILS_FAIL
      });
    });
}
