import * as types from "../constants";
import { getCurrency } from "../../utils/helpers";

const initialState = {
  base: getCurrency()
};

export const reducer = (state = initialState, actions) => {
  switch (actions.type) {
    case types.SELECT_PRICE:
      return {
        ...state,
        ...actions.payload
      };
    default:
      return state;
  }
};

export default reducer;
