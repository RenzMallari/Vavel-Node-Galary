import * as types from '../constants';

const initialState = {};

const reducer = (state = initialState, actions) => {
  switch (actions.type) {
    case types.GET_SIGNUP:
      return {
        ...state,
        ...actions.payload
      };
    default:
      return state;
  }
};

export default reducer;
