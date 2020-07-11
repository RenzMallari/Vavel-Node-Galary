import * as types from "../constants";

const initialState = {
  collaction: {
    data: {},
    loading: false,
    error: ""
  },
  allcollections: {
    data: [],
    loading: false,
    error: ""
  }
};

export default function reducer(state = initialState, actions) {
  switch (actions.type) {
    case types.ADD_ALBUM_COLLECTION:
      return {
        ...state,
        collaction: {
          ...state.collaction,
          loading: true
        },
        allcollections: {
          data: [],
          loading: false,
          error: ""
        }
      };
    case types.ADD_ALBUM_COLLECTION_SUCCED:
      return {
        ...state,
        collaction: {
          ...state.collaction,
          data: actions.data,
          loading: false
        }
      };
    case types.ADD_ALBUM_COLLECTION_FAILD:
      return {
        ...state,
        collaction: {
          ...state.collaction,
          loading: false,
          error: actions
        }
      };
    case types.GET_COLLECTIONS:
      return {
        ...state,
        allcollections: {
          data: [],
          error: "",
          loading: true
        }
      };
    case types.GET_COLLECTIONS_SUCCED:
      return {
        ...state,
        allcollections: {
          ...state.allcollections,
          data: actions.payload.data,
          loading: false
        }
      };
    case types.GET_COLLECTIONS_FAILD:
      return {
        ...state,
        allcollections: {
          ...state.allcollections,
          loading: false,
          error: actions.payload
        }
      };
    default:
      return state;
  }
}
