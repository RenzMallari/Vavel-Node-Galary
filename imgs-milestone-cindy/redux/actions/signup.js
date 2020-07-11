import * as types from "../constants";
import request from "../../utils/request";
import { login } from "../../auth";
import { openMessage } from "../actions/message";

export const getDataSignUp = (params = {}, resolve = () => {}) => dispatch => {
  return request()
    .get("joinus/getcontentbyid/1", { params })
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: response.data,
        type: types.GET_SIGNUP
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_SIGNUP
      });
    });
};

export const signUp = (
  params = {},
  success = () => {},
  error = () => {}
) => dispatch => {
  return request()
    .post("registration", {
      ...params,
      usertype: "buyer",
      headers: {
        "content-type": "application/json"
      }
    })
    .then(response => {
      if (response.data.type === "error" || response.data.type === "validate") {
        error(response.data);
        response.data &&
          response.data.msg &&
          dispatch(openMessage({ content: response.data.msg, type: "danger" }));
      } else {
        login({ email: params.email, password: params.password });
        success(response.data);
      }
    })
    .catch(err => {
      error(err);
    });
};
