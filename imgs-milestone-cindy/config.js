// For Development
let config = {
  ftpPath: "https://stock.vavel.com/s/photoImages/",
  ftpThumbnailPath: "https://stock.vavel.com/s/photoImages/thumbnail/",
  ftpAvatarPath: "https://stock.vavel.com/s/photoImages/avatar/",
  ftpCoverPath: "https://stock.vavel.com/s/photoImages/cover/",
  ftpFullPath: "https://stock.vavel.com/s/photoImages/bunch/",
  crop200: "h200_",
  crop300: "h200_",
  cropt200: "t200_",
  w800: "w800_",
  prefixImageh4: "h4_",
  ReCaptchaKey: "6LftBMQUAAAAABbAFRZShICAfW2tbGDLvFxH5Y7f",
  appIdFB: "169320175188",
  googleMapKey: "AIzaSyBostcE61uc6HQAVfo76Xp59PQ2S4gMYtc",

  // new config from .env
  REACT_APP_API_SERVER_URL: "https://managerimages.vavel.com",
  REACT_APP_API_URL: "/api",
  HOST: "http://localhost:3000",
  SUB_HOST: "https://managerimages.vavel.com"
};

// For Production
if (process.env.NODE_ENV === "production") {
  config = {
    ftpPath: "https://stock.vavel.com/s/photoImages/",
    ftpThumbnailPath: "https://stock.vavel.com/s/photoImages/thumbnail/",
    ftpAvatarPath: "https://stock.vavel.com/s/photoImages/avatar/",
    ftpCoverPath: "https://stock.vavel.com/s/photoImages/cover/",
    ftpFullPath: "https://stock.vavel.com/s/photoImages/bunch/",
    crop200: "h200_",
    crop300: "h200_",
    cropt200: "t200_",
    w800: "w800_",
    prefixImageh4: "h4_",
    ReCaptchaKey: "6LftBMQUAAAAABbAFRZShICAfW2tbGDLvFxH5Y7f",
    appIdFB: "169320175188",
    googleMapKey: "AIzaSyBostcE61uc6HQAVfo76Xp59PQ2S4gMYtc",

    // new config from .env
    REACT_APP_API_SERVER_URL: "https://managerimages.vavel.com",
    REACT_APP_API_URL: "/api",
    HOST: "https://images.vavel.com/",
    SUB_HOST: "https://managerimages.vavel.com"
  };
}

export default config;
