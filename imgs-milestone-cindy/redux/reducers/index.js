import { combineReducers } from "redux";

import photos from "./photos";
import team from "./team";
import gallery from "./gallery";
import footer from "./footer";
import signup from "./signup";
import modal from "./modal";
import message from "./message";
import catalogDetails from "./catalogDetails";
import cms from "./cms";
import search from "./search";
import searchList from "./searchList";
import listTags from "./listTags";
import userDetail from "./userDetail";
import priceConvert from "./priceConvert";
import albumDetails from "./albumDetails";
import price from "./price";
import counter from "./counter";
import picture from "./picture";
import cartList from "./cartList";
import ip from "./ip";
import auth from "./auth";
import collections from "./collections";
import payment from "./payment";

export default combineReducers({
  photos,
  team,
  gallery,
  footer,
  signup,
  modal,
  message,
  catalogDetails,
  cms,
  search,
  searchList,
  listTags,
  userDetail,
  albumDetails,
  priceConvert,
  price,
  counter,
  picture,
  cartList,
  ip,
  auth,
  collections,
  payment
});
