import * as types from "../constants";

const initialState = {
  clientToken: "",
  loading: false,
  error: ""
};

export default function reducer(state = initialState, actions) {
  switch(actions.type) {
    case types.GET_CLIENT_TOKEN_BRAINTREE: 
      return {
        ...state,
        loading: true
      };
    case types.GET_CLIENT_TOKEN_BRAINTREE_SUCCED: 
      return {
        ...state,
        clientToken: actions.payload,
        loading: false
      };
    case types.GET_CLIENT_TOKEN_BRAINTREE_FAIL:
      return {
        ...state,
        loading: false,
        error: actions.payload
      };
    default:
      return state;
  }
};