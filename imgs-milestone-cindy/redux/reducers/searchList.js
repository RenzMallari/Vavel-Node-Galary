import * as types from "../constants";

const initialState = {
  albums: {
    data: [],
    loading: false,
    error: "",
  },
  users: {
    data: [],
    loading: false,
    error: "",
  },
  catalogs: {
    data: [],
    loading: false,
    error: "",
  },
  collections: {
    data: [],
    loading: false,
    error: "",
  },
};

export default function reducer(state = initialState, actions) {
  switch(actions.type) {
    case types.POST_ALBUM_SEARCH_LOAD:
      return {
        ...state,
        albums: {
          ...state.albums,
          loading: true,
        },
      };
    case types.POST_ALBUM_SEARCH_LOAD_SUCCED:
      return {
        ...state,
        albums: {
          ...state.albums,
          data: actions.payload.data,
          loading: false,
        },
      };
    case types.POST_ALBUM_SEARCH_LOAD_FAIL:
      return {
        ...state,
        albums: {
          ...state.albums,
          error: actions.payload.error,
          loading: false,
        },
      };
    case types.POST_CATALOG_SEARCH_LOAD:
      return {
        ...state,
        catalogs: {
          ...state.catalogs,
          loading: true,
        },
      };
    case types.POST_CATALOG_SEARCH_LOAD_SUCCED:
      return {
        ...state,
        catalogs: {
          ...state.catalogs,
          data: actions.payload.data,
          loading: false,
        },
      };
    case types.POST_CATALOG_SEARCH_LOAD_FAIL:
      return {
        ...state,
        catalogs: {
          ...state.catalogs,
          error: actions.payload.error,
          loading: false,
        },
      };
    case types.POST_USERS_SEARCH_LOAD:
      return {
        ...state,
        users: {
          ...state.users,
          loading: true,
        },
      };
    case types.POST_USERS_SEARCH_LOAD_SUCCED:
      return {
        ...state,
        users: {
          ...state.users,
          data: actions.payload.data,
          loading: false,
        },
      };
    case types.POST_USERS_SEARCH_LOAD_FAIL:
      return {
        ...state,
        users: {
          ...state.users,
          error: actions.payload.error,
          loading: false,
        },
      };
    case types.POST_COLLECTIONS_SEARCH_LOAD:
      return {
        ...state,
        collections: {
          ...state.collections,
          loading: true,
        },
      };
    case types.POST_COLLECTIONS_SEARCH_LOAD_SUCCED:
      return {
        ...state,
        collections: {
          ...state.collections,
          data: actions.payload.data,
          loading: false,
        },
      };
    case types.POST_COLLECTIONS_SEARCH_LOAD_FAIL:
      return {
        ...state,
        collections: {
          ...state.collections,
          error: actions.payload.error,
          loading: false,
        },
      };
    default: 
      return state;
  }
};