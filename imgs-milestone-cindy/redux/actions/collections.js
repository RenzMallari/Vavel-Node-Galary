import * as types from "../constants";
import request from "../../utils/request";

export const createNewCollection = (
  params = {},
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.ADD_ALBUM_COLLECTION,
    payload: {
      ...params
    }
  });
  return request()
    .post("/gallery/addalbumcollection", params)
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: {
          data: response.data
        },
        type: types.ADD_ALBUM_COLLECTION_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: {
          error
        },
        type: types.ADD_ALBUM_COLLECTION_FAILD
      });
    });
};

export const getCollections = (params = {}, resolve = () => {}) => dispatch => {
  dispatch({
    type: types.GET_COLLECTIONS,
    payload: {
      ...params
    }
  });
  const userId = params.userId ? params.userId : "";
  return request()
    .get(`/gallery/getcollections/${userId}`)
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: {
          data: response.data.allcollections
        },
        type: types.GET_COLLECTIONS_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: {
          error
        },
        type: types.GET_COLLECTIONS_FAILD
      });
    });
};

export const addAlbumToColletion = (
  params = {},
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.ADD_ALBUM_TO_COLLETION,
    payload: {
      ...params
    }
  });
  return request()
    .post("/gallery/addalbumtocollection", params)
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: {
          data: response.data
        },
        type: types.ADD_ALBUM_TO_COLLETION_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: {
          error
        },
        type: types.ADD_ALBUM_TO_COLLETION_FAILD
      });
    });
};
