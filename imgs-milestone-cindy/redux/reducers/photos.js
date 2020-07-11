import * as types from "../constants";

const initialState = {
  home: {
    data: [],
    page: 0,
    count: 0,
    limit: 50,
    loading: false,
    error: ""
  },
  timeline: {
    data: [],
    loading: false,
    error: ""
  },
  logo: {
    data: "",
    loading: false,
    error: ""
  },
  albums: {
    data: [],
    page: 0,
    count: 0,
    limit: 30,
    loading: false,
    error: ""
  }
};

export default function reducer(state = initialState, actions) {
  switch (actions.type) {
    case types.RESET_HOME_PHOTOS:
      return {
        ...state,
        home: initialState.home
      };
    case types.GET_HOME_PHOTOS:
      return {
        ...state,
        home: {
          ...state.home,
          ...actions.payload,
          page: actions.payload.page || initialState.home.page,
          data: initialState.home.data,
          loading: true,
          error: ""
        }
      };
    case types.GET_HOME_PHOTOS_SUCCED:
      return {
        ...state,
        home: {
          ...state.home,
          ...actions.payload,
          loading: false
        }
      };
    case types.GET_HOME_PHOTOS_FAIL:
      return {
        ...state,
        home: {
          ...state.home,
          loading: false,
          error: actions.payload
        }
      };
    case types.GET_DATE_PHOTOS:
      return {
        ...state,
        timeline: {
          ...state.timeline,
          loading: true
        }
      };
    case types.GET_DATE_PHOTOS_SUCCED:
      return {
        ...state,
        timeline: {
          ...state.timeline,
          data: actions.payload.data.results,
          loading: false
        }
      };
    case types.GET_DATE_PHOTOS_FAIL:
      return {
        ...state,
        timeline: {
          ...state.timeline,
          error: actions.payload.error,
          loading: false
        }
      };
    case types.GET_TAG_LOGO:
      return {
        ...state,
        logo: {
          ...state.logo,
          loading: true
        }
      };
    case types.GET_TAG_LOGO_SUCCED:
      return {
        ...state,
        logo: {
          ...state.logo,
          data: actions.payload.data,
          loading: false
        }
      };
    case types.GET_TAG_LOGO_FAIL:
      return {
        ...state,
        logo: {
          ...state.logo,
          error: actions.payload.error,
          loading: false
        }
      };
    case types.GET_ALBUMS_PHOTOS:
      return {
        ...state,
        albums: {
          ...state.albums,
          ...actions.payload,
          data: initialState.albums.data,
          page: actions.payload.page || initialState.albums.page,
          loading: true,
          error: ""
        }
      };
    case types.GET_ALBUMS_PHOTOS_SUCCED:
      return {
        ...state,
        albums: {
          ...state.albums,
          ...actions.payload,
          loading: false
        }
      };
    case types.GET_ALBUMS_PHOTOS_FAIL:
      return {
        ...state,
        albums: {
          ...state.albums,
          loading: false,
          error: actions.payload
        }
      };
    default:
      return state;
  }
}
