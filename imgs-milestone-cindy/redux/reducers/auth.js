import * as types from "../constants";

const reducer = (state = {}, action) => {
  switch (action.type) {
    case types.SERVER_SET_COOKIE:
      return {
        ...state,
        ...action.payload
      };
    case types.CLIENT_REMOVE_COOKIE:
      return {
        ...state
      };
    default:
      return state;
  }
};

export default reducer;
