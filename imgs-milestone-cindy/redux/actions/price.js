import * as types from "../constants";
import Cookies from "js-cookie";
import { isServer } from "../../utils/helpers";
import { COOKIE_DOMAIN } from "../../utils/constant";

export const selectPrice = data => dispatch => {
  dispatch({ payload: data, type: types.SELECT_PRICE });
  if (!isServer()) {
    Cookies.set("currency", data.base, COOKIE_DOMAIN);
  }
};
