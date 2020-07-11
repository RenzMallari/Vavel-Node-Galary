import request from "./utils/request";
import Cookies from "js-cookie";
import { isServer } from "./utils/helpers";

export const login = (data, success = () => {}, error = () => {}) => {
  request()
    .post("userlogin", {
      email: data.email,
      password: data.password,
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      }
    })
    .then(resp => {
      if (resp.data.error) {
        error(resp.data);
      } else {
        Cookies.set("users", resp.data, {
          domain:
            process.env.NODE_ENV === "production" ? ".vavel.com" : "localhost"
        });
        window.localStorage.removeItem("localUser");
        success(resp.data);
      }
    });
};

export const loginFb = (data, success = () => {}, error = () => {}) => {
  request()
    .post("facebooksignuplogin", {
      firstname: data.first_name,
      middlename: data.middle_name,
      lastname: data.last_name,
      facebookid: data.userID,
      headers: {
        "content-type": "application/json"
      }
    })
    .then(resp => {
      if (resp.data.type === "error") {
        error(resp.data);
      } else {
        Cookies.set("users", resp.data, {
          domain:
            process.env.NODE_ENV === "production" ? ".vavel.com" : "localhost"
        });
        success(resp.data);
      }
    })
    .catch(err => {
      error(err);
    });
};

export const forgotPassword = (data, callback) => {
  return request()
    .post("forgotpassword", {
      email: data
    })
    .then(resp => {
      callback();
      return resp.data;
    });
};

export const isLoggedIn = () => {
  const user = Cookies.get("users");
  return user && user !== "null";
};

export const getUserInfo = () => {
  const user = Cookies.get("users");
  return user && user !== "null" ? JSON.parse(user) : {};
};

export const getUserIdOrLocalUserId = () => {
  const localUser = JSON.parse(window.localStorage.getItem("localUser"));
  const user = getUserInfo();
  return user._id || localUser._id;
};

export default { login, forgotPassword };
