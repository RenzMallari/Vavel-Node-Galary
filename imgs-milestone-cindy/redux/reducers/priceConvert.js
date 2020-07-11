import * as types from "../constants";

const initialState = {
  data: {
    base: "",
    rates: {},
    date: ""
  }
};

export default function reducer(state = initialState, actions) {
  switch (actions.type) {
    case types.GET_PRICE_ALBUM:
      return {
        ...state,
        data: {
          ...state.data,
          ...actions.payload
        }
      };
    default:
      return state;
  }
}
