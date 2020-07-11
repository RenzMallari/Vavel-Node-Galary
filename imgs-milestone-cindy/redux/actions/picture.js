import * as types from "../constants";

export const checkSizePicture = data => dispatch => {
  dispatch({ payload: data, type: types.CHECKED_SIZE_PICTURE });
};
