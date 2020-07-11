import * as types from "../constants";
import request from "../../utils/request";

export const getUserDetails = (params = {}, resolve = () => {}) => dispatch => {
  dispatch({
    type: types.GET_USER_DETAIL,
    payload: {
      ...params
    }
  });

  return request()
    .get(`/gallery/getuserdetails/${params.accountId}`, { params })
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: response.data.msg,
        type: types.GET_USER_DETAIL_SUCCESS
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_USER_DETAIL_FAIL
      });
    });
};

export const getAlbumUser = (
  params = { page: 0, limit: 30 },
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.GET_USER_ALBUM,
    payload: { ...params }
  });
  return request()
    .get(`/album/getalbumsimages/${params.accountId}`, { params })
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: response.data,
        type: types.GET_USER_ALBUM_SUCCESS
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_USER_ALBUM_FAIL
      });
    });
};
