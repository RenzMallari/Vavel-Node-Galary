import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  arrCurrency,
  arrCountry,
  optionArrays,
  COOKIE_DOMAIN
} from "../../utils/constant";
import { openModal } from "../../redux/actions/modal";
import * as types from "../../redux/constants";
import { LoadSearch } from "../searchList";
import {
  postAlbumSearchList,
  postCatalogSearchList,
  postUsersSearchList,
  postCollectionsSearchList
} from "../../redux/actions/searchList";
import { selectPrice } from "../../redux/actions/price";
import { ActiveLink, CartPayment } from "../common";
import { getListTags } from "../../redux/actions/listTags";
import CustomDate from "../home/CustomDate";
import GoogleComponent from "../common/Google";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import Cookies from "js-cookie";
import { getUserInfo, getUserIdOrLocalUserId } from "../../auth";
import config from "../../config";
import { getDataCartList } from "../../redux/actions/cartList";
import { logout } from "../../redux/actions/auth";
import { handleLocation, getCountry, getCurrency } from "../../utils/helpers";

const logo = "/static/images/logo.png";
const down = "/static/images/down-arrow.png";
const arrow = "/static/images/dropdown-arrow@2x1.png";
const removeIcon = "/static/images/remove.svg";

function Header({
  countryHeader,
  cookieCountry,
  cookieCurrency,
  cookieSortBy
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const sortBy =
    Cookies.get("sort_by") && Cookies.get("sort_by") !== "null"
      ? Cookies.get("sort_by")
      : null;
  const [option, setOption] = React.useState(`"${cookieSortBy}"`);
  const [value, setValue] = React.useState({
    currency: getCurrency(cookieCurrency),
    country: countryHeader
  });
  const [loadGeolocation, setLoadGeolocation] = React.useState(true);

  const handleGetListTags = React.useCallback(() => {
    dispatch(getListTags());
  }, [dispatch]);

  const storeIp = useSelector(store => store.ip.data);

  const handleSetCurrencyAndCountry = () => {
    if (storeIp.data && storeIp.data.country) {
      const country = storeIp.data.country;
      const newCountry = getCountry(country.name);
      const currency =
        country.currency && country.currency.currencyCode
          ? country.currency.currencyCode
          : "USD";
      if (!cookieCurrency && value.currency !== currency) {
        setValue({ ...value, country: newCountry, currency });
      }
    }
  };

  React.useEffect(() => {
    navigator.permissions && navigator.permissions.query({name: 'geolocation'}).then(function(PermissionStatus) {
      if(PermissionStatus.state === 'prompt') {
        !sortBy &&
        loadGeolocation &&
        handleLocation(setValue, router, setLoadGeolocation, true);
      } else {
        !sortBy &&
        loadGeolocation &&
        handleLocation(setValue, router, setLoadGeolocation, false);
      }
    })
  }, [dispatch, option, sortBy, value, handleSetCurrencyAndCountry]);

  const query = router.query || {};
  const keyword = query.keyword || null;
  const fullPath = router.asPath;
  const pathArr = fullPath.split("?");
  const timeArrays = [
    "Any Time",
    "Past 24 hour",
    "Past week",
    "Past month",
    "Past year"
  ];

  handleSetCurrencyAndCountry();

  const [open, setOpen] = React.useState({
    currency: false,
    country: false,
    toggle_left: false,
    navbar: false
  });

  const [place, setPlace] = React.useState("");
  const [address, setAddress] = React.useState(false);
  const [isInvalid, setIsInvalid] = React.useState(false);
  const [timePicture, setTimePicture] = React.useState("Time");
  const [valueInput, setValueInput] = React.useState(keyword || "");
  const [openSearchList, setOpenSearchList] = React.useState(false);
  const [isRemove, setIsRemove] = React.useState(false);

  const convertPath = (data, opt) => {
    const path = router.asPath;
    const arrPath = path.split("?");
    const arr = ["/albums", "/search", "time=", "country="];
    const find = arr.find(e => path.indexOf(e) !== -1);
    let {
      time,
      from,
      to,
      country,
      city,
      lat,
      lng,
      search,
      keyword,
      page
    } = router.query;
    if (opt === "time") {
      time = data.time;
    }
    if (opt === "custom") {
      time = data.time;
      from = data.from;
      to = data.to;
    }
    if (opt === "country") {
      country = data.country;
      city = data.city;
      lat = data.lat;
      lng = data.lng;
    }
    const timePath = time ? `time=${time}` : "";
    const customPath = from && to ? `from=${from}&to=${to}` : "";
    const countryPath =
      country && city && lat && lng
        ? `country=${country}&city=${city}&lat=${lat}&lng=${lng}`
        : "";
    const defaultPath = `${timePath}${customPath ? "&" : ""}${customPath}${
      countryPath && time ? "&" : ""
    }${countryPath}&page=0`;

    if (path.indexOf("/search") !== -1) {
      return defaultPath.length
        ? `/search?keyword=${keyword}&page=${page}&${defaultPath}`
        : `/search?keyword=${keyword}&page=${page}`;
    }
    if (find || path === "/") {
      return defaultPath.length
        ? `${arrPath[0]}?${defaultPath}`
        : `${arrPath[0]}`;
    } else {
      return defaultPath.length ? `/?${defaultPath}` : "/";
    }
  };

  const handleSelectValue = (name, item) => () => {
    if (item.name.toLowerCase() === "all") {
      Cookies.set("country", '""', { path: "/", ...COOKIE_DOMAIN });
      Cookies.set("sort_by", '"newest"', { path: "/", ...COOKIE_DOMAIN });
    } else {
      Cookies.set("country", `${item.name.toLowerCase()}`, {
        path: "/",
        ...COOKIE_DOMAIN
      });

      Cookies.set("sort_by", '"newest-country"', {
        path: "/",
        ...COOKIE_DOMAIN
      });
    }
    setValue({
      ...value,
      [name]: item
    });
    router.push(router.asPath);
  };

  const handleSelectCurrency = (name, item) => () => {
    Cookies.set("currency", item, { path: "/", ...COOKIE_DOMAIN });
    setValue({
      ...value,
      [name]: item
    });
    const base = item;
    dispatch(selectPrice({ base }));
  };

  const handleClick = (side, value) => () => {
    setOpen({
      ...open,
      [side]: value
    });
  };

  const changeTime = time => {
    const arr = time.split(" ");
    const timeQuery = arr.join("-");
    setTimePicture(time);
    const newPath = convertPath(
      {
        time: timeQuery
      },
      "time"
    );
    router.push(newPath);
  };
  const setCustomTime = () => {
    setAddress(true);
  };

  const auth = useSelector(store => store.auth);
  const user = getUserInfo();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const toggleUserMenu = () => setUserMenuOpen(prevState => !prevState);
  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const hadleGetCartList = React.useCallback(() => {
    const _id = getUserIdOrLocalUserId();
    dispatch(getDataCartList(_id));
  }, [dispatch, auth]);

  React.useEffect(() => {
    if (!window.localStorage.getItem("localUser")) {
      const { uuid } = require("uuidv4");
      const localUser = { _id: uuid() };
      window.localStorage.setItem("localUser", JSON.stringify(localUser));
    }
    handleGetListTags();
    hadleGetCartList();
  }, [hadleGetCartList, handleGetListTags]);

  const handleChange = e => {
    e.preventDefault();
    const value = e.target.value;
    setValueInput(value);
    const trimValue = value.trim();
    if (trimValue !== valueInput.trim()) {
      setOpenSearchList(true);
      if (trimValue.length !== 0) {
        dispatch(postAlbumSearchList({ keyword: trimValue }));
        dispatch(postCatalogSearchList({ keyword: trimValue }));
        dispatch(postUsersSearchList({ keyword: trimValue }));
        dispatch(postCollectionsSearchList({ keyword: trimValue }));
      }
    }
  };

  const handleCloseSearchList = () => {
    setOpenSearchList(false);
  };

  const isDisplaySearchForm = () => {
    setOpenSearchList(false);
  };

  const handleSubmit = e => {
    e.preventDefault();
    setOpenSearchList(false);
    router.push(`/search?keyword=${valueInput.trim()}&page=1`);
  };

  const convertDate = date => {
    const formatDate = date.toLocaleDateString("en-US");
    const arrDate = formatDate.split("/");
    let month = arrDate[0] < 10 ? `0${arrDate[0]}` : arrDate[0];
    let day = arrDate[1] < 10 ? `0${arrDate[1]}` : arrDate[1];
    return `${date.getFullYear()}-${month}-${day}`;
  };

  const handleCustomRange = (startDate, endDate) => {
    if (startDate > endDate || startDate === "" || endDate === "") {
      setIsInvalid(true);
      return;
    }
    const newStartDate = convertDate(startDate);
    const newEndDate = convertDate(endDate);
    setAddress(false);
    setTimePicture("Custom range");
    const newPath = convertPath(
      {
        time: "Custom-range",
        from: newStartDate,
        to: newEndDate
      },
      "custom"
    );
    router.push(newPath);
  };
  const cartData = useSelector(store => store.cartList);
  const cartNumber = cartData.count || 0;
  const handlePlace = place => {
    setPlace(place);
  };
  const handleSelect = async place => {
    setPlace(place);
    const results = await geocodeByAddress(place);
    const geolocation = results[0] || {};
    const latLng = await getLatLng(geolocation);
    let country = "",
      city = "";
    if (geolocation.address_components) {
      const address_components = geolocation.address_components;
      const countryFind = address_components.find(
        item => item.types && item.types.find(type => type === "country")
      );
      const cityFind = address_components.find(
        item =>
          item.types &&
          item.types.find(type => type === "administrative_area_level_1")
      );
      if (countryFind && countryFind.long_name) {
        country = countryFind.long_name;
      }
      if (cityFind && cityFind.long_name) {
        city = cityFind.long_name;
      }
    }
    const newPath = convertPath(
      {
        country,
        city,
        lat: latLng.lat,
        lng: latLng.lng
      },
      "country"
    );

    router.push(newPath);
    setIsRemove(true);
  };

  const handleRemove = () => {
    setPlace("");
    setIsRemove(false);
    const pathFilter = pathArr.filter(item => item.indexOf("time=") === -1);
    const pathFilter2 = pathFilter.filter(
      item => item.indexOf("country=") === -1
    );
    const newPath = pathFilter2.join("?");
    router.push(newPath);
  };

  const handleSelectFilter = opts => {
    const newPath = convertPath();
    router.push(newPath);
    switch (opts) {
      case '"near"': {
        setOption(opts);
        Cookies.set("sort_by", '"near"', { path: "/", ...COOKIE_DOMAIN });
        return;
      }
      case '"newest-country"': {
        setOption(opts);
        Cookies.set("sort_by", '"newest-country"', {
          path: "/",
          ...COOKIE_DOMAIN
        });
        return;
      }
      case '"newest"': {
        setOption(opts);
        Cookies.set("sort_by", '"newest"', { path: "/", ...COOKIE_DOMAIN });
        return;
      }
      default:
        setOption("");
        Cookies.remove('"sort_by"');
        return;
    }
  };

  return (
    <header>
      <CustomDate
        isOpen={address}
        isInvalid={isInvalid}
        toggle={() => setAddress(false)}
        handleCustomRange={handleCustomRange}
      />
      <div className="header-siderbar">
        <div className="siderbar">
          <div className="v-navbar-header">
            <div className="header-logo">
              <div
                className="sb-toggle-left"
                onClick={handleClick("toggle_left", !open.toggle_left)}
              >
                <div>
                  <div className="navicon-line"></div>
                  <div className="navicon-line"></div>
                  <div className="navicon-line"></div>
                </div>
              </div>
              <Link href="/">
                <a>
                  <img src={logo} alt="logo-vavel-17" title="VAVEL logo" />
                </a>
              </Link>
            </div>
            <div className="login">
              {Object.keys(user).length ? (
                <Dropdown
                  id="user-menu-dropdown"
                  isOpen={userMenuOpen}
                  toggle={toggleUserMenu}
                >
                  <DropdownToggle caret>
                    <img
                      id="header-avatar"
                      src={
                        user.profileimage && user.profileimage !== "undefined"
                          ? `${config.ftpAvatarPath}${user.profileimage}`
                          : "https://stock.vavel.com/cdn-cgi/image/width=75,height=75/s/photoImages/avatar/photo-icon.png"
                      }
                      alt="Avatar"
                    />
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem>
                      <a href={`${config.SUB_HOST}/upload`}>+ Upload</a>
                    </DropdownItem>
                    <DropdownItem>
                      <a href={`${config.SUB_HOST}/mymetrics`}>My Metrics</a>
                    </DropdownItem>
                    {cartNumber > 0 && (
                      <DropdownItem>
                        <a href={`${config.SUB_HOST}/checkout`}>
                          My Cart {cartNumber}
                        </a>
                      </DropdownItem>
                    )}
                    <DropdownItem>
                      <a href={`${config.SUB_HOST}/downloads`}>My Purchases</a>
                    </DropdownItem>
                    <DropdownItem>
                      <a href={`${config.SUB_HOST}/sale`}>Sales</a>
                    </DropdownItem>
                    <hr />
                    <hr />
                    <DropdownItem>
                      <a href={`${config.SUB_HOST}/settings`}>Settings</a>
                    </DropdownItem>
                    <DropdownItem>
                      <a href={`${config.SUB_HOST}/myaccount/${user._id}`}>
                        My Account
                      </a>
                    </DropdownItem>
                    <DropdownItem>
                      <a href={`${config.SUB_HOST}/myaccount/${user._id}`}>
                        My Gallery
                      </a>
                    </DropdownItem>
                    <DropdownItem>
                      <a href={`${config.SUB_HOST}/myalbums`}>My Albums</a>
                    </DropdownItem>
                    <DropdownItem>
                      <a href={`${config.SUB_HOST}/mycollection`}>
                        my collections
                      </a>
                    </DropdownItem>
                    <DropdownItem>
                      <a href={`${config.SUB_HOST}/#/widget/${user.username}`}>
                        my widget
                      </a>
                    </DropdownItem>
                    <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <span className="login-button">
                  <button
                    onClick={e => {
                      e.preventDefault();
                      dispatch(openModal(types.OPEN_MODAL_SIGN_UP));
                    }}
                  >
                    Login
                  </button>
                </span>
              )}
            </div>
            <div className="v-navbar">
              <div className="v-navbar-left">
                <form
                  className="v-navbar-input"
                  onSubmit={e => handleSubmit(e)}
                  onClick={isDisplaySearchForm}
                >
                  <input
                    type="text"
                    placeholder="Search and buy stock images..."
                    value={valueInput}
                    onChange={handleChange}
                  />
                  <button type="submit" name="commit">
                    <svg
                      fill="#FFFFFF"
                      height="40"
                      width="40"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                      <path d="M0 0h24v24H0z" fill="none"></path>
                    </svg>
                  </button>
                  {valueInput && (
                    <LoadSearch
                      open={openSearchList}
                      onClose={handleCloseSearchList}
                    />
                  )}
                </form>
                <div
                  className={`v-navbar-img ${open.navbar ? "rotate-180 " : ""}`}
                  onClick={handleClick("navbar", !open.navbar)}
                >
                  <img src={down} alt="" />
                </div>
              </div>
              <div
                className={`v-navbar-right ${
                  open.toggle_left ? "v-navbar-nav-top" : ""
                }`}
              >
                <ul className="v-navbar-right-nav">
                  <li className="dropdown dropdown-currency">
                    <Dropdown
                      toggle={handleClick("currency", !open.currency)}
                      isOpen={open.currency}
                    >
                      <DropdownToggle caret style={{ fontSize: "12px" }} caret>
                        {value.currency}
                      </DropdownToggle>
                      <DropdownMenu
                        style={{ minWidth: "60px", fontSize: "12px" }}
                      >
                        {arrCurrency.map(item => (
                          <DropdownItem
                            style={{ padding: "12px" }}
                            key={item}
                            onClick={handleSelectCurrency("currency", item)}
                          >
                            {item}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </li>
                  <li className="country country-currency">
                    <Dropdown
                      toggle={handleClick("country", !open.country)}
                      isOpen={open.country}
                    >
                      <DropdownToggle
                        style={{ fontSize: "12px" }}
                        className="country-img"
                        caret
                      >
                        <p className={`${value.country.flag} flag`}></p>
                        <span>{value.country.name}</span>
                      </DropdownToggle>
                      <DropdownMenu
                        style={{ minWidth: "60px", fontSize: "12px" }}
                      >
                        {arrCountry.map(item => (
                          <DropdownItem
                            style={{ padding: "15px" }}
                            className="country-flag"
                            key={item.flag}
                            onClick={handleSelectValue("country", item)}
                          >
                            <p className={`${item.flag} flag`}></p>
                            <span>{item.name}</span>
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </li>
                  {cartNumber > 0 && (
                    <li>
                      <ActiveLink href="/checkout" activeClassName="--active">
                        <a>
                          <span>CART</span>
                          <span className="badge">{cartNumber}</span>
                        </a>
                      </ActiveLink>
                    </li>
                  )}
                  <li>
                    <ActiveLink href="/albums" activeClassName="--active">
                      <a>ALBUMS</a>
                    </ActiveLink>
                  </li>
                  <li>
                    <ActiveLink activeClassName="--active" href="/">
                      <a>PHOTOS</a>
                    </ActiveLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <section className="vavel-bar">
          <div className="bar-button">
            <a href="https://www.vavel.com/en/">on VAVEL</a>
          </div>
          <div className="bar-button">
            <a href="https://search.vavel.com/">on the Web</a>
          </div>
          <div className="bar-button">
            <a href="/">Pictures</a>
          </div>
        </section>
        <div className={`active ${open.navbar ? "v-navbar-nav" : ""}`}>
          <div className="row">
            <div className="row-active">
              <div className="row-time filter">
                <div className="time">
                  <div>{timePicture}</div>
                  <div className="arrow">
                    <img src={arrow} alt="" />
                  </div>
                </div>
                <ul className="past">
                  {timeArrays.map((item, index) => (
                    <li key={index} onClick={() => changeTime(item)}>
                      <p>{item}</p>
                    </li>
                  ))}
                  <hr />
                  <li>
                    <p onClick={() => setCustomTime()}>Custom range..</p>
                  </li>
                </ul>
              </div>
              <GoogleComponent
                place={place}
                handlePlace={handlePlace}
                handleSelect={handleSelect}
              />
              {isRemove && (
                <div className="remove-address">
                  <img
                    className="icon-remove"
                    src={removeIcon}
                    alt="icon-remove"
                    onClick={() => handleRemove()}
                  />
                </div>
              )}
            </div>
            <div className="nearly filter clearfix">
              <select
                onChange={e => handleSelectFilter(e.target.value)}
                value={option}
              >
                <option value="">-- filter --</option>
                {optionArrays.map((item, index) => (
                  <option key={index} value={item.value}>
                    {item.opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      {cartNumber > 0 && <CartPayment cartNumber={cartNumber}></CartPayment>}
    </header>
  );
}

export default Header;
