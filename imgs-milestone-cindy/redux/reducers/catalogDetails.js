import * as types from "../constants";

const initialState = {
  data: {
    msg: [],
    keyword: ""
  },
  loading: false,
  error: ""
}

export default function reducer(state = initialState, actions) {
  switch(actions.type) {
    case types.GET_CATALOG_DETAILS:
      return {
        ...state,
        loading: true
      };
    case types.GET_CATALOG_DETAILS_SUCCED: 
      return {
        ...state,
        data: {
          ...state.data,
          msg: actions.payload.msg,
          keyword: actions.payload.keyword
        },
        loading: false
      };
    case types.GET_CATALOG_DETAILS_FAIL: 
      return {
        ...state,
        loading: false,
        error: actions.payload
      };
    default:
      return state;
  }
}