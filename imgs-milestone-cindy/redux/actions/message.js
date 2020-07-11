import * as types from "../constants";

export const openMessage = data => dispatch => {
  dispatch({ payload: data, type: types.OPEN_MESSAGE });
  setTimeout(() => dispatch(closeMessage()), 5000);
};

export const closeMessage = () => dispatch => {
  dispatch({ type: types.CLOSE_MESSAGE });
};

export default { openMessage, closeMessage };
