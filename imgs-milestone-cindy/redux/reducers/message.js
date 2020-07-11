import * as types from '../constants';

const initialState = {};

export const reducer = (state = initialState, actions) => {
  switch (actions.type) {
    case types.OPEN_MESSAGE:
      return {
        ...state,
        ...actions.payload
      };
    case types.CLOSE_MESSAGE:
      return initialState;

    default:
      return state;
  }
};

export default reducer;
