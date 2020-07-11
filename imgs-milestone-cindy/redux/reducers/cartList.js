import * as types from "../constants";

const initialState = {
  data: [],
  count: 0
};

export default function reducer(state = initialState, actions) {
  switch (actions.type) {
    case types.GET_CART_LIST:
      return {
        ...state,
        data: actions.payload,
        count: actions.payload ? actions.payload.length : 0
      };
    case types.GET_CART_LIST_FAIL:
      return {
        ...state
      };
    case types.DELETE_CART_ITEM_SUCCED:
      return {
        ...state,
        data: actions.payload,
        count: actions.payload.length
      };
    case types.DELETE_CART_ITEM_FAIL:
      return {
        ...state
      };
    case types.POST_CART_SUCCEED:
      return {
        ...state,
        count: parseInt(state.count) + 1
      };
    default:
      return state;
  }
}
