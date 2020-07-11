import * as types from "../constants";
import request from "../../utils/request";

export const postAlbumSearchList = (
  params = {},
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.POST_ALBUM_SEARCH_LOAD,
    payload: {
      ...params
    }
  });
  return request()
    .post("/album/searchkeywords_album_load", { keyword: params.keyword })
    .then(response => {
      resolve(response.data);
      const result = response.data.albums.map(album => {
        const data = album.split("_");
        return {
          name: data[0],
          id: data[1],
        };
      });
      dispatch({
        payload: {
          data: result || [],
        },
        type: types.POST_ALBUM_SEARCH_LOAD_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: {
          error
        },
        type: types.POST_ALBUM_SEARCH_LOAD_FAIL
      });
    });
}

export const postCatalogSearchList = (
  params = {},
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.POST_CATALOG_SEARCH_LOAD,
    payload: {
      ...params,
    },
  });
  return request()
    .post("/catalog/searchkeywords_load", { keyword: params.keyword })
    .then(response => {
      resolve(response.data);
      const arr = response.data.albumkeywords.map(item => {
        return {
          name: item.keyword,
          id: item.keyword,
          image: item.logo,
        };
      });
      const result = [];
      for(let i = 0; i < arr.length; i++) {
        const arrName = result.map(element => element.name);
        if(arrName.indexOf(arr[i].name) === -1) {
          result.push(arr[i]);
        }
      }
      dispatch({
        payload: {
          data: result || [],
        },
        type: types.POST_CATALOG_SEARCH_LOAD_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: {
          error,
        },
        type: types.POST_CATALOG_SEARCH_LOAD_FAIL
      });
    });
}

export const postUsersSearchList = (
  params = {},
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.POST_USERS_SEARCH_LOAD,
    payload: {
      ...params,
    },
  });
  return request()
    .post("/album/searchkeywordsuser_load", { keyword: params.keyword })
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: {
          data: response.data.user || [],
        },
        type: types.POST_USERS_SEARCH_LOAD_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: {
          error,
        },
        type: types.POST_USERS_SEARCH_LOAD_FAIL
      });
    });
}

export const postCollectionsSearchList = (
  params = {},
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.POST_COLLECTIONS_SEARCH_LOAD,
    payload: {
      ...params,
    },
  });
  return request()
    .post("/album/searchkeywords_collections_load", { keyword: params.keyword })
    .then(response => {
      resolve(response.data);
      const result = response.data.collections.map(item => {
        const data = item.split("_");
        return {
          name: data[0],
          id: data[1],
        };
      });

      dispatch({
        payload: {
          data: result || [],
        },
        type: types.POST_COLLECTIONS_SEARCH_LOAD_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: {
          error,
        },
        type: types.POST_COLLECTIONS_SEARCH_LOAD_FAIL
      });
    });
}