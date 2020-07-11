import App from "next/app";
import React from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import { withRouter } from "next/router";
import NextNProgress from "nextjs-progressbar";

import withReduxStore from "../lib/with-redux-store";
import { Header, Footer } from "../components/layout";
import { Message } from "../components/common";
import { Login } from "../components/login";
import { ForgotPassword } from "../components/forgot";
import Cookies from "js-cookie";
import nextCookies from "next-cookies";
import "../index.scss";
import { isServer, getCountry, getCurrency } from "../utils/helpers";

const theme = {
  colors: {}
};

const getCookies = ctx => {
  const cookie = key => (isServer() ? nextCookies(ctx)[key] : Cookies.get(key));
  return {
    countryHeader: getCountry(cookie("country")),
    cookieCountry: cookie("country"),
    cookieCurrency: cookie("currency"),
    cookieLat: cookie("lat"),
    cookieCoords: cookie("coords"),
    cookieLng: cookie("lng")
  };
};
class MyApp extends App {
  static async getInitialProps({
    Component,
    ctx,
    reduxStore,
    router,
    ...others
  }) {
    ctx.cookies = getCookies(ctx);
    
    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};
    return {
      pageProps,
      headerProps: ctx.cookies,
      rawCookie: ctx.req && ctx.req.headers.cookie
    };
  }
  render() {
    const {
      Component,
      pageProps,
      reduxStore,
      router,
      headerProps,
      rawCookie
    } = this.props;
    const isSearchPage = router.pathname && router.pathname.includes("search");
    const isEmbedPage = router.pathname && router.pathname.includes("/embed/");

    return (
      <ThemeProvider theme={theme}>
        <Provider store={reduxStore}>
          {!isEmbedPage && <NextNProgress startPosition={0} height="5" />}
          {!isEmbedPage && <Message />}
          {!isEmbedPage && <Header {...headerProps} />}
          <Component {...pageProps} />
          {!isSearchPage && !isEmbedPage && <Footer />}
          {!isEmbedPage && <Login />}
          {!isEmbedPage && <ForgotPassword />}
        </Provider>
      </ThemeProvider>
    );
  }
}

export default withReduxStore(withRouter(MyApp));
