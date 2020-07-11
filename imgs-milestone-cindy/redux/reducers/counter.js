import * as actionTypes from "../constants";

export const initialStateCounter = {
  lastUpdate: 0,
  light: false,
  count: 0
};

// REDUCERS
const reducer = (state = initialStateCounter, action) => {
  switch (action.type) {
    case actionTypes.TICK:
      return {
        ...state,
        lastUpdate: action.ts,
        light: !!action.light
      };
    case actionTypes.INCREMENT:
      return {
        ...state,
        count: state.count + 1
      };
    case actionTypes.DECREMENT:
      return {
        ...state,
        count: state.count - 1
      };
    case actionTypes.RESET:
      return {
        ...state,
        count: initialStateCounter.count
      };
    default:
      return state;
  }
};

export default reducer;
