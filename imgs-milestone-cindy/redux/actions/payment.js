import * as types from "../constants";
import request from "../../utils/request";

export const getClientTokenBrainTree = (params = {}, resolve = () => { }) => dispatch => {
  dispatch({ type: types.GET_CLIENT_TOKEN_BRAINTREE });
  return request()
    .get("/braintree/client_token", { params })
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: response.data,
        type: types.GET_CLIENT_TOKEN_BRAINTREE_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_CLIENT_TOKEN_BRAINTREE_FAIL
      });
    });
};

export const checkoutBrainTree = (params = {}) =>
// dispatch =>
{
  return request().post("/braintree/checkouts", { params })
}
