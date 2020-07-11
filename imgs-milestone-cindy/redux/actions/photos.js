import * as types from "../constants";
import request from "../../utils/request";
import { isServer } from "../../utils/helpers";

export const getPhotosHome = (
  params = { page: 0, limit: 30 },
  resolve = () => {}
) => (dispatch, getState) => {
  const { auth } = getState();
  dispatch({
    type: types.GET_HOME_PHOTOS,
    payload: {
      ...params
    }
  });
  const Cookie = isServer() ? auth._cookie : document.cookie;
  return request({}, Cookie ? { Cookie } : {})
    .get("/album/getlastphotos", { params })
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: {
          data: response.data.alluserphotos,
          count: response.data.count
        },
        type: types.GET_HOME_PHOTOS_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_HOME_PHOTOS_FAIL
      });
    });
};

export const resetPhotosHome = () => dispatch => {
  dispatch({
    type: types.RESET_HOME_PHOTOS
  });
};

export const getDatePhotos = (params = {}, resolve = () => {}) => dispatch => {
  dispatch({
    type: types.GET_DATE_PHOTOS,
    payload: {
      ...params
    }
  });
  return request()
    .get("/album/lastphotos-by-year", { params })
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: {
          data: response.data
        },
        type: types.GET_DATE_PHOTOS_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: {
          error
        },
        type: types.GET_DATE_PHOTOS_FAIL
      });
    });
};

export const getTagLogo = (params = {}, resolve = () => {}) => dispatch => {
  dispatch({
    type: types.GET_TAG_LOGO,
    payload: {
      ...params
    }
  });
  return request()
    .get("/tag/tag-with-logo", { params })
    .then(response => {
      console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee: ', error)
      resolve(response.data);
      dispatch({
        payload: {
          data: response.data.logo
        },
        type: types.GET_TAG_LOGO_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: {
          error
        },
        type: types.GET_TAG_LOGO_FAIL
      });
    });
};

export const getPhotosAlbums = (
  params = { page: 0, limit: 30 },
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.GET_ALBUMS_PHOTOS,
    payload: {
      ...params
    }
  });
  return request()
    .get("/album/getnoofalbums", { params })
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: {
          data: response.data.allalbums,
          count: response.data.count
        },
        type: types.GET_ALBUMS_PHOTOS_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_ALBUMS_PHOTOS_FAIL
      });
    });
};
