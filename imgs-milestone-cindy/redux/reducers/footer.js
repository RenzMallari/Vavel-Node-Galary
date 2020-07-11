import * as types from "../constants";

const initialState = {
  data: {},
  error: ""
}

export default function reducer(state = initialState, actions) {
  switch(actions.type) {
    case types.GET_FOOTER_DATA: 
      return {
        ...state
      }
    case types.GET_FOOTER_DATA_SUCCED:
      return {
        ...state,
        data: actions.payload
      }
    case types.GET_FOOTER_DATA_FAIL: 
      return {
        ...state,
        error: actions.payload
      }
    default:
      return state;
  }
}