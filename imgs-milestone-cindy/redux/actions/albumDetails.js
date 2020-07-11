import * as types from "../constants";
import request from "../../utils/request";

export const getDataAlbumDetails = (
  params = {},
  resolve = () => {}
) => dispatch => {
  if (!params.albumId) {
    throw new Error("Param albumId is required.");
  }
  dispatch({
    type: types.GET_ALBUM_DETAILS,
    payload: {
      ...params
    }
  });
  return request()
    .get(`album/getalbumdetails/${params.albumId}`)
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: response.data,
        type: types.GET_ALBUM_DETAILS_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_ALBUM_DETAILS_FAIL
      });
    });
};

export const paginateAlbumDetailsLocal = (
  params = { page: 0, limit: 30 }
) => async dispatch => {
  await dispatch({
    type: types.PAGINATE_ALBUM_DETAILS
  });
  dispatch({
    type: types.PAGINATE_ALBUM_DETAILS_SUCCED,
    payload: {
      ...params
    }
  });
};
