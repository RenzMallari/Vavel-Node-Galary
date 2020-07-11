import * as types from "../constants";

const initialState = {
  data: {},
  loading: false,
  error: ""
};

export default function reducer(state = initialState, actions) {
  switch(actions.type) {
    case types.GET_IP: 
      return {
        ...state,
        loading: true
      };
    case types.GET_IP_SUCCED: 
      return {
        ...state,
        data: actions.payload,
        loading: false
      };
    case types.GET_IP_FAILD:
      return {
        ...state,
        loading: false,
        error: actions.payload
      };
    default:
      return state;
  }
};