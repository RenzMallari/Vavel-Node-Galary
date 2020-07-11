import * as types from "../constants";
import request from "../../utils/request";
import Cookies from "js-cookie";
import { list_currencies } from "../../utils/constSetting";
import { arrCountry, COOKIE_DOMAIN } from "../../utils/constant";

export const getIp = (parmas = {}, resolve = () => {}) => dispatch => {
  dispatch({
    type: types.GET_IP,
    payload: {
      ...parmas
    }
  });
  return request()
    .get("/ip")
    .then(response => {
      resolve(response.data);
      const { name, currency, geo } = response.data.data.country;

      const find = arrCountry.find(
        e =>
          e.name
            .split(" ")
            .join()
            .toLowerCase() === name.toLowerCase()
      );
      const findCurrency = list_currencies[currency.currencyCode].code
        ? list_currencies[currency.currencyCode].code
        : null;
      if (
        !Cookies.get("country") &&
        Cookies.get("country") !== "null" &&
        Cookies.get("country") !== "undefined"
      ) {
        if (find) {
          Cookies.set("country", find.name.toLowerCase(), {
            path: "/",
            ...COOKIE_DOMAIN
          });
        } else {
          Cookies.set("country", name.toLowerCase(), {
            path: "/",
            ...COOKIE_DOMAIN
          });
          Cookies.set("sort_by", '"newest"', { path: "/", ...COOKIE_DOMAIN });
        }
      }
      if (findCurrency) {
        Cookies.set("currency", findCurrency, { path: "/", ...COOKIE_DOMAIN });
      } else {
        Cookies.set("currency", findCurrency, { path: "/", ...COOKIE_DOMAIN });
      }

      if (geo && geo.latitude && geo.longitude) {
        Cookies.set("coords", [geo.latitude, geo.longitude], {
          path: "/",
          ...COOKIE_DOMAIN
        });
      }

      dispatch({
        payload: {
          data: response.data.data
        },
        type: types.GET_IP_SUCCED
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_IP_FAILD
      });
    });
};
