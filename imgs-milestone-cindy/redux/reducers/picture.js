import * as types from "../constants";

const initialState = {
  data: {
    size: "",
    price: 0,
    width: 0,
    height: 0,
    imgDpi: 0
  }
};

export const reducer = (state = initialState, actions) => {
  switch (actions.type) {
    case types.CHECKED_SIZE_PICTURE:
      return {
        ...state,
        ...actions.payload
      };
    default:
      return state;
  }
};

export default reducer;
