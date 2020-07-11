import * as types from "../constants";
import axios from "axios";
import { getUserIdOrLocalUserId } from "../../auth";
import config from "../../config";

export const getDataCartList = (_id, resolve = () => {}) => dispatch => {
  return axios
    .get(
      `${config.REACT_APP_API_SERVER_URL}${config.REACT_APP_API_URL}/album/getcarts/${_id}`
    )
    .then(response => {
      resolve(response.data.carts);
      dispatch({
        payload: response.data.carts,
        type: types.GET_CART_LIST
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_CART_LIST_FAIL
      });
    });
};

export const deleteCartItem = (
  image_id,
  image_price,
  resolve = () => {}
) => dispatch => {
  const user_id = getUserIdOrLocalUserId();
  return axios
    .get(
      `${config.REACT_APP_API_SERVER_URL}${config.REACT_APP_API_URL}/album/deletecart/${user_id}/${image_id}/${image_price}`
    )
    .then(response => {
      resolve(response.data.carts);
      dispatch({
        payload: response.data.carts,
        type: types.DELETE_CART_ITEM_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.DELETE_CART_ITEM_FAIL
      });
    });
};
