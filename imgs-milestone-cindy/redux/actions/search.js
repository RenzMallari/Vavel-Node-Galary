import * as types from "../constants";
import request from "../../utils/request";

export const postAlbumSearch = (
  params = {},
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.POST_ALBUM_SEARCH,
    payload: {
      ...params
    }
  });
  return request()
    .post("/album/searchkeywords_new", { keyword: params.keyword })
    .then(response => {
      resolve(response.data);
      const datas = response.data.album;

      const arr = []
      const dataAlbum = [];
      for (const item of datas) {
        if(item.images.length > 0) {
          // save data to album
          const y = {
            albumid: item._id,
            name: item.name,
            publicid: item.images[0].publicid,
            fileExtension: item.images[0].fileExtension,
            tags: item.tags
          }
          dataAlbum.push(y);
          for(let i = 0; i < item.images.length; i++) {
            const date = (new Date(item.images[i].adddate)).getTime();
            const x =  {
              _id: item._id,
              name: item.name,
              userid: item.userid,
              date,
              tags: item.images[i].tags,
              images: {
                _id: item.images[i]._id,
                publicid: item.images[i].publicid,
                fileExtension: item.images[i].fileExtension
              }
            }
            // save data to pictures
            arr.push(x)
          }
        }
      } 
      const limit = parseInt(params.limit);
      dispatch({
        payload: {
          data: dataAlbum,
          imagesData: arr,
          limit
        },
        type: types.POST_ALBUM_SEARCH_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: {
          error
        },
        type: types.POST_ALBUM_SEARCH_FAIL
      });
    });
}

export const postUsersSearch = (
  params = {},
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.POST_USERS_SEARCH,
    payload: {
      ...params
    }
  });
  return request()
    .post("/album/searchkeywordsuser_new", { keyword: params.keyword })
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: {
          data: response.data.userimage
        },
        type: types.POST_USERS_SEARCH_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.POST_USERS_SEARCH_FAIL
      });
    });
}

export const postKeywordsSearch = (
  params = {},
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.POST_KEYWORDS_SEARCH,
    payload: {
      ...params
    }
  });
  return request()
    .post("/catalog/searchkeywords_new", { keyword: params.keyword })
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: {
          data: response.data.albumkeywords
        },
        type: types.POST_KEYWORDS_SEARCH_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.POST_KEYWORDS_SEARCH_FAIL
      });
    });
}

export const postCatalogSearch = (
  params = {},
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.POST_CATALOG_SEARCH,
    payload: {
      ...params
    }
  });
  return request()
    .post("/catalog/searchkeywords_new", { keyword: params.keyword })
    .then(response => {
      resolve(response.data);
      let arr = [];
      const datas = response.data.albumkeywords;
      for(const property in datas) {
        const data = datas[property];
        arr = [
          ...arr,
          ...data
        ]
      }
      const result = arr.map(data => {
        return {
          _id: data.galleryid,
          name: data.keyword,
          userid: data._id,
          date: data.created_at,
          images: {
            _id: data._id,
            publicid: data.imageid,
            fileExtension: "jpg"
          }
        }
      });
      dispatch({
        payload: {
          data: result
        },
        type: types.POST_CATALOG_SEARCH_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.POST_CATALOG_SEARCH_FAIL
      });
    });
}