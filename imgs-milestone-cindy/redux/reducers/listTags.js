import * as types from "../constants";

const initialState = {
  data: [],
  loading: false,
  error: ""
};

export default function reducer(state = initialState, actions) {
  switch (actions.type) {
    case types.GET_LIST_TAGS:
      return {
        ...state,
        loading: true
      };
    case types.GET_LIST_TAGS_SUCCED:
      return {
        ...state,
        data: actions.payload.data,
        loading: false
      };
    case types.GET_LIST_TAGS_FAIL:
      return {
        ...state,
        error: actions.payload.data,
        loading: false
      };
    default:
      return state;
  }
}
