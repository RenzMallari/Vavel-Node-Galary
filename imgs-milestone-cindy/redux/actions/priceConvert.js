import * as types from "../constants";
import axios from "axios";

export const getDataPriceConvert = (resolve = () => {}) => dispatch => {
  return axios
    .get("https://api.openrates.io/latest")
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: response.data,
        type: types.GET_PRICE_ALBUM
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_PRICE_ALBUM
      });
    });
};
