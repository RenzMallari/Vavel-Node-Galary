import * as types from "../constants";

const initialState = {
  album: {
    data: [],
    loading: false,
    error: ""
  },
  users: {
    data: [],
    loading: false,
    error: ""
  },
  pictures: {
    data: [],
    limit: 50,
    loading: false,
    isFetchData: false
  },
  keywords: {
    data: {},
    loading: false,
    error: ""
  },
  catalogs: {
    data: [],
    loading: false,
    error: "",
    isFetchData: false
  }
};

export default function reducer(state = initialState, actions) {
  switch(actions.type) {
    case types.POST_ALBUM_SEARCH:
      return {
        ...state,
        album: {
          ...state.album,
          loading: true,
          data: []
        },
        pictures: {
          ...state.pictures,
          loading: true,
          data: [],
          isFetchData: false
        }
      };
    case types.POST_ALBUM_SEARCH_SUCCED:
      return {
        ...state,
        album: {
          ...state.album,
          data: actions.payload.data,
          loading: false
        },
        pictures: {
          ...state.pictures,
          data: actions.payload.imagesData,
          limit: actions.payload.limit,
          loading: false,
          isFetchData: true
        }
      };
    case types.POST_ALBUM_SEARCH_FAIL: 
      return {
        ...state,
        album: {
          ...state.album,
          loading: false,
          error: actions.payload.error
        },
        pictures: {
          ...state.pictures,
          loading: false,
          isFetchData: true,
        }
      };
    case types.POST_USERS_SEARCH:
      return {
        ...state,
        users: {
          ...state.users,
          loading: true,
          data: []
        }
      };
    case types.POST_USERS_SEARCH_SUCCED:
      return {
        ...state,
        users: {
          ...state.users,
          data: actions.payload.data,
          loading: false
        }
      };
    case types.POST_USERS_SEARCH_FAIL: 
      return {
        ...state,
        users: {
          ...state.users,
          loading: false,
          error: actions.payload.error
        }
      };
    case types.POST_KEYWORDS_SEARCH:
      return {
        ...state,
        keywords: {
          ...state.keywords,
          loading: true,
          data: []
        }
      };
    case types.POST_KEYWORDS_SEARCH_SUCCED:
      return {
        ...state,
        keywords: {
          ...state.keywords,
          data: actions.payload.data,
          loading: false
        }
      };
    case types.POST_KEYWORDS_SEARCH_FAIL: 
      return {
        ...state,
        keywords: {
          ...state.keywords,
          loading: false,
          error: actions.payload.error
        }
      };
    case types.POST_CATALOG_SEARCH:
      return {
        ...state,
        catalogs: {
          ...state.catalogs,
          loading: true,
          data: [],
          isFetchData: false
        }
      };
    case types.POST_CATALOG_SEARCH_SUCCED:
      return {
        ...state,
        catalogs: {
          ...state.catalogs,
          data: actions.payload.data,
          loading: false,
          isFetchData: true
        }
      };
    case types.POST_CATALOG_SEARCH_FAIL: 
      return {
        ...state,
        catalogs: {
          ...state.catalogs,
          error: actions.payload.error,
          loading: false,
          isFetchData: true,
        }
      };
    default:
      return state;
  }
}

