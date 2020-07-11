import * as types from "../constants";

const initialState = {
  data: {},
  albumUser: {
    page: 0,
    count: 0,
    limit: 30,
    data: [],
    is_album_exist: false
  },
  loading: false
}

export const reducer = (state = initialState, actions) => {
  switch (actions.type) {
    case types.GET_USER_DETAIL:
      return {
        ...state,
        loading: true
      };
    case types.GET_USER_DETAIL_SUCCESS:
      return {
        ...state,
        data: actions.payload || {},
        loading: false
      };
    case types.GET_USER_DETAIL_FAIL:
      return {
        ...state,
        loading: false,
        error: actions.payload
      };
    case types.GET_USER_ALBUM:
      return {
        ...state,
        albumUser: {
          ...state.albumUser,
          ...actions.payload,
          data: initialState.albumUser.data,
          loading: true,
          error: ""
        }
      };
    case types.GET_USER_ALBUM_SUCCESS:
      return {
        ...state,
        albumUser: {
          ...state.albumUser,
          count: actions.payload && actions.payload.count,
          is_album_exist: actions.payload && actions.payload.is_album_exist,
          type: actions.payload && actions.payload.type,
          data: actions.payload && actions.payload.images,
          loading: false
        }
      };
    case types.GET_USER_ALBUM_FAIL:
      return {
        ...state,
        albumUser: {
          ...state.albumUser,
          loading: false,
          error: actions.payload
        }
      };
    default:
      return state;
  }
}

export default reducer;