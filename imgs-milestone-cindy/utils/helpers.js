import { pickBy, identity } from "lodash";
import { defaultPrice } from "./constSetting";
import Cookies from "js-cookie";
import nextCookie from "next-cookies";
import { useRouter } from "next/router";
import { list_countries as listCountry } from "./constants";
import { DEFAULT_CURRENCY, arrCountry, COOKIE_DOMAIN } from "./constant";

export const isServer = () => typeof window === "undefined";

export const formatPrefix = imageDate => {
  const h4PrefixMaxDate = new Date("11/19/2019");
  let prefix = "h5_";
  if (new Date(imageDate) < h4PrefixMaxDate) {
    prefix = "h4_";
  }
  return prefix;
};

export const printMonth = month => {
  switch (month) {
    case 1:
      return "Jan";
    case 2:
      return "Feb";
    case 3:
      return "Mar";
    case 4:
      return "Apr";
    case 5:
      return "May";
    case 6:
      return "June";
    case 7:
      return "Jul";
    case 8:
      return "Aug";
    case 9:
      return "Sep";
    case 10:
      return "Oct";
    case 11:
      return "Nov";
    case 12:
      return "Dec";
    default:
      return month;
  }
};

export const handlePaddle = (id, idRight, idLeft, option) => {
  const element = document.getElementById(id);
  const right = document.getElementById(idRight);
  const left = document.getElementById(idLeft);
  if (option === "left") {
    element.scrollTo(-999999, 0);
    right.classList.remove("hide");
    left.classList.add("hide");
  } else {
    element.scrollTo(999999, 0);
    left.classList.remove("hide");
    right.classList.add("hide");
  }
};

export const fetchTags = data => {
  let result = [];
  for (const element of data) {
    if (element.tags) {
      result = [...result, ...element.tags];
    }
  }
  return result;
};

export const parseURL = (params, url) => {
  const paramsFormat = pickBy(params, identity);
  let URLParams = "";
  Object.keys(paramsFormat).forEach(key => {
    URLParams += `${key}=${paramsFormat[key]}&`;
  });
  return `${url}?${URLParams.slice(0, URLParams.length - 1)}`;
};

export const handleImageDetails = (imagewidth, imageheight, imagePrice) => {
  let imagedetails = [];
  let replaceimagedetails = {};
  if (
    parseInt(imagewidth) >= 1600 ||
    parseInt(imageheight) >= 1200 ||
    parseInt(imageheight) >= 1600 ||
    parseInt(imagewidth) >= 1200
  ) {
    let largewidth = parseInt(imagewidth);
    let largeheight = parseInt(imageheight);
    let largedpi = 300;
    let largeinch = `${parseFloat(largewidth / largedpi).toFixed(
      1
    )}\" X ${parseFloat(largeheight / largedpi).toFixed(1)}\"`;
    let largedetails = {
      width: largewidth,
      height: largeheight,
      dpi: largedpi,
      inch: largeinch,
      type: "large",
      price: imagePrice.large || defaultPrice().large,
      ischecked: true
    };
    replaceimagedetails = largedetails;

    var mediumwidth = parseInt(largewidth / 2);
    var mediumheight = parseInt(largeheight / 2);
    var mediumdpi = 300;
    var mediuminch = `${parseFloat(mediumwidth / mediumdpi).toFixed(
      1
    )}\" X ${parseFloat(mediumheight / mediumdpi).toFixed(1)}\"`;
    var mediumdetails = {
      width: mediumwidth,
      height: mediumheight,
      dpi: mediumdpi,
      inch: mediuminch,
      type: "medium",
      price: imagePrice.medium || defaultPrice().medium,
      ischecked: false
    };

    var smallwidth = parseInt(mediumwidth / 2);
    var smallheight = parseInt(mediumheight / 2);
    var smalldpi = 72;
    var smallinch = `${parseFloat(smallwidth / smalldpi).toFixed(
      1
    )}\" X ${parseFloat(smallheight / smalldpi).toFixed(1)}\"`;
    var smalldetails = {
      width: smallwidth,
      height: smallheight,
      dpi: smalldpi,
      inch: smallinch,
      type: "small",
      price: imagePrice.small || defaultPrice().small,
      ischecked: false
    };
    imagedetails.push(smalldetails);
    imagedetails.push(mediumdetails);
    imagedetails.push(largedetails);
  } else if (
    (imagewidth >= 1024 && imagewidth < 1600) ||
    (imageheight >= 768 && imageheight < 1200) ||
    (imageheight >= 1024 && imageheight < 1600) ||
    (imagewidth >= 768 && imagewidth < 1200)
  ) {
    mediumwidth = parseInt(imagewidth);
    mediumheight = parseInt(imageheight);
    mediumdpi = 300;
    mediuminch = `${parseFloat(mediumwidth / mediumdpi).toFixed(
      1
    )}\" X ${parseFloat(mediumheight / mediumdpi).toFixed(1)}\"`;
    mediumdetails = {
      width: mediumwidth,
      height: mediumheight,
      dpi: mediumdpi,
      inch: mediuminch,
      type: "medium",
      price: imagePrice.medium || defaultPrice().medium,
      ischecked: true
    };
    replaceimagedetails = mediumdetails;

    smallwidth = parseInt(mediumwidth / 2);
    smallheight = parseInt(mediumheight / 2);
    smalldpi = 72;
    smallinch = `${parseFloat(smallwidth / smalldpi).toFixed(
      1
    )}\" X ${parseFloat(smallheight / smalldpi).toFixed(1)}\"`;
    smalldetails = {
      width: smallwidth,
      height: smallheight,
      dpi: smalldpi,
      inch: smallinch,
      type: "small",
      price: imagePrice.small || defaultPrice().small,
      ischecked: false
    };
    imagedetails.push(smalldetails);
    imagedetails.push(mediumdetails);
  } else {
    smallwidth = parseInt(imagewidth);
    smallheight = parseInt(imageheight);
    smalldpi = 72;
    smallinch = `${parseFloat(smallwidth / smalldpi).toFixed(
      1
    )}\" X ${parseFloat(smallheight / smalldpi).toFixed(1)}\"`;
    smalldetails = {
      width: smallwidth,
      height: smallheight,
      dpi: smalldpi,
      inch: smallinch,
      type: "small",
      price: imagePrice.small || defaultPrice().small,
      ischecked: true
    };
    replaceimagedetails = smalldetails;
    imagedetails.push(smalldetails);
  }
  return { imagedetails, replaceimagedetails };
};

const listTime = [
  {
    label: "Any Time",
    value: "any-time"
  },
  {
    label: "Past 24 hour",
    value: "past-24-hour",
    seconds: 24 * 60 * 60 //s
  },
  {
    label: "Past week",
    value: "past-week",
    seconds: 7 * 24 * 60 * 60 //s
  },
  {
    label: "Past month",
    value: "past-month",
    seconds: 30 * 24 * 60 * 60 //s
  },
  {
    label: "Past year",
    value: "past-year",
    seconds: 365 * 24 * 60 * 60 //s
  }
];

export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  var R = 6371;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export const sortLastPhotos = (data = [], cookieServer) => {
  const router = useRouter();
  // Is on Client
  let cookieLat = Cookies.get("lat");
  let cookieLng = Cookies.get("lng");
  let cookieCoords = Cookies.get("coords");
  let cookieSortBy = Cookies.get("sort_by");
  let cookieCountry = Cookies.get("country");

  if (isServer()) {
    cookieLat = cookieServer.cookieLat;
    cookieLng = cookieServer.cookieLng;
    cookieCoords = cookieServer.cookieCoords;
    cookieSortBy = cookieServer.cookieSortBy;
    cookieCountry = cookieServer.cookieCountry;
  }

  let coords = [cookieLat, cookieLng];
  let countryFilter = cookieCountry;
  const sortBy = cookieSortBy;
  let { country, city, lat, lng, limit } = router.query;
  limit = limit || 50;
  if (country) {
    countryFilter = country;
  }

  if (lat && lng) {
    coords = [lat, lng];
  } else if (sortBy === '"near"' || sortBy === "near") {
    coords =
      typeof cookieCoords === "string"
        ? JSON.parse(cookieCoords)
        : cookieCoords;
  }

  if (sortBy === '"newest"' || sortBy === "newest") {
    data.sort((item1, item2) => {
      const date1 = new Date(item1.images.adddate).getTime();
      const date2 = new Date(item2.images.adddate).getTime();
      return date2 - date1;
    });
    return data.length > limit ? data.slice(0, limit) : data;
  } else if (
    (sortBy === '"newest-country"' || sortBy === "newest-country") &&
    cookieCountry
  ) {
    const defaultCooutry = cookieCountry.toLowerCase();
    const math = data.filter(
      item => item.albumcountry.toLowerCase() === defaultCooutry
    );
    const notMath = data.filter(
      item => item.albumcountry.toLowerCase() !== defaultCooutry
    );

    let dataMath = math.sort((item1, item2) => {
      const date1 = new Date(item1.images.adddate).getTime();
      const date2 = new Date(item2.images.adddate).getTime();
      return date2 - date1;
    });
    data = dataMath.concat(notMath);
  } else if (coords) {
    data.sort((item1, item2) => {
      const lat1 = item1.lat;
      const lng1 = item1.lng;
      const lat2 = item2.lat;
      const lng2 = item2.lng;
      const ip1 = getDistanceFromLatLonInKm(coords[0], coords[1], lat1, lng1);
      const ip2 = getDistanceFromLatLonInKm(coords[0], coords[1], lat2, lng2);
      return ip1 - ip2;
    });
  }

  if (country && lat && lng) {
    data.sort((item1, item2) => {
      const lat1 = item1.lat;
      const lng1 = item1.lng;
      const lat2 = item2.lat;
      const lng2 = item2.lng;
      const ip1 = getDistanceFromLatLonInKm(coords[0], coords[1], lat1, lng1);
      const ip2 = getDistanceFromLatLonInKm(coords[0], coords[1], lat2, lng2);
      return ip1 - ip2;
    });
    return data.length > limit ? data.slice(0, limit) : data;
  }

  if (countryFilter && !lat && !lng && !sortBy) {
    const paramCountry = countryFilter.toLowerCase();
    const country = listCountry.find(item => {
      if (
        item.name.toLowerCase() === paramCountry ||
        item.alpha3code.toLowerCase() === paramCountry ||
        item.alpha2code.toLowerCase() === paramCountry
      )
        return item;
    });
    if (country) {
      let match = data.filter(album => {
        if (
          album.albumcountry &&
          Object.values(country).find(
            e => e.toLowerCase() === album.albumcountry.toLowerCase()
          )
        )
          return album;
      });
      const notMatch = data.filter(album => {
        if (
          !album.albumcountry ||
          !Object.values(country).find(
            e => e.toLowerCase() === album.albumcountry.toLowerCase()
          )
        );
        return album;
      });
      if (city) {
        const allalbums = match.filter(
          album =>
            album.albumcity &&
            album.albumcity.toLowerCase() === city.toLowerCase()
        );
        const not_allalbums = match.filter(
          album =>
            !album.albumcity ||
            album.albumcity.toLowerCase() !== city.toLowerCase()
        );
        allalbums.sort((item1, item2) => {
          const date1 = new Date(item1.images.adddate).getTime();
          const date2 = new Date(item2.images.adddate).getTime();
          return date2 - date1;
        });
        match = allalbums.concat(not_allalbums);
      }
      data = match.concat(notMatch);
    }
  }
  return data.length > limit ? data.slice(0, limit) : data;
};

export const isAuthenticated = user => {
  return user && user.isloggedin;
};

export const getCurrency = currency => {
  return currency && currency !== "null" ? currency : DEFAULT_CURRENCY;
};

export const handleLocation = async (
  setValue,
  router,
  setLoadLocation,
  reload,
  flag,
  ctx = {}
) => {
  // Is on Client
  let cookieLat = Cookies.get("lat");
  let cookieLng = Cookies.get("lng");
  let cookieSortBy = Cookies.get("sort_by");
  let cookieCountry = Cookies.get("country");

  if (isServer()) {
    cookieLat = nextCookie(ctx).lat;
    cookieLng = nextCookie(ctx).lng;
    cookieSortBy = nextCookie(ctx).sort_by;
    cookieCountry = nextCookie(ctx).country;
  }

  const geoSuccess = async function(position) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      {
        latLng: new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        )
      },
      (result, status) => {
        if (status == google.maps.GeocoderStatus.OK && !flag) {
          if (result[0]) {
            const addressComponent = result[0].address_components;
            const country = addressComponent.find(e =>
              e.types.find(i => i === "country")
            );

            if (country) {
              const code = listCountry.find(e => {
                e.name.toLowerCase() === country.long_name.toLowerCase() ||
                  e.alpha2code.toLowerCase() ===
                    country.short_name.toLowerCase() ||
                  e.alpha3code.toLowerCase() ===
                    country.short_name.toLowerCase();
              });

              if (code && code.name && code.code && cookieCountry) {
                console.log("change country");
              }
              const coordsExists =
                cookieLat !== undefined && cookieLng !== undefined;
              Cookies.set(
                "lng",
                result[0].geometry.location.lng(),
                COOKIE_DOMAIN
              );
              Cookies.set(
                "lat",
                result[0].geometry.location.lng(),
                COOKIE_DOMAIN
              );

              if (!cookieCountry && code) {
                Cookies.set("country", country.long_name, COOKIE_DOMAIN);
                cookieCountry &&
                  setValue({
                    country: {
                      flag: `${cookieCountry
                        .toLowerCase()
                        .split(" ")
                        .join("-")}`,
                      name: `${cookieCountry.toUpperCase()}`
                    }
                  });
              }
            }
          } else {
            console.log("No result found");
          }
        } else {
          Cookies.remove("lng");
          Cookies.remove("lat");
          Cookies.remove("country");
          console.log(`Geocoder failed due toL ${status}`);
        }
      }
    );
    Cookies.set(
      "coords",
      [position.coords.latitude, position.coords.longitude],
      COOKIE_DOMAIN
    );
    Cookies.set("sort_by", '"near"', { path: "/", ...COOKIE_DOMAIN });
    setLoadLocation(false);
    reload && router.push(router.asPath);
  };
  const geoError = function(error) {
    if (!cookieSortBy && !Cookies.get("sort_by")) {
      Cookies.set("sort_by", '"newest-country"', {
        path: "/",
        ...COOKIE_DOMAIN
      });
    }
    setLoadLocation(false);
    // router.push(router.asPath);
  };

  if ("geolocation" in navigator)
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
};

export const getCountry = country => {
  if (!country)
    return {
      flag: "all-icon",
      name: "ALL"
    };
  const find = arrCountry.find(
    e => e.name.toLowerCase() === country.toLowerCase()
  );
  if (find && find.flag && find.name) {
    return {
      flag: find.flag,
      name: find.name
    };
  } else {
    return {
      flag: "all-icon",
      name: "ALL"
    };
  }
};

function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i -= 1) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
}

export function random(obj, count) {
  var keys = Object.keys(obj);
  shuffle(keys);
  keys = keys.slice(0, count);
  return keys;
}

