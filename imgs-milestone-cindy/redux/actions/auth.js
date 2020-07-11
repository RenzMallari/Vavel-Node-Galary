import Cookies from "js-cookie";
import { CLIENT_REMOVE_COOKIE } from "../constants";

export const logout = () => dispatch => {
  Cookies.remove("users", {
    domain: process.env.NODE_ENV === "production" ? ".vavel.com" : "localhost"
  });
  dispatch({
    type: CLIENT_REMOVE_COOKIE
  });
};
