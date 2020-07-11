import * as types from "../constants";
import request from "../../utils/request";

export const getListTags = (
  params = {},
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.GET_LIST_TAGS,
    payload: {
      ...params
    }
  });
  return request()
    .get("/tag/listtags")
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: {
          data: response.data.listtags,
        },
        type: types.GET_LIST_TAGS_SUCCED,
      });
    })
    .catch(error => {
      dispatch({
        payload: {
          error,
        },
        type: types.GET_LIST_TAGS_FAIL,
      });
    });
}