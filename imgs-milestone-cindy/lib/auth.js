import Router from "next/router";
import nextCookie from "next-cookies";
import cookie from "js-cookie";
import { isAuthenticated, isServer } from "../utils/helpers";
import { SERVER_SET_COOKIE } from "../redux/constants";
import {pick} from 'lodash';

const redirectedPath = "/"; // set redirected route here

export const auth = ctx => {
  const { user } = nextCookie(ctx);
  //TO_DO; update redirect path, enable block code below to redirect
  const isloggedin = isAuthenticated(user);
  // redirected if user is not login 
  // if (!isloggedin) {
  //   if (typeof window === "undefined") {
  //     // redirect at server
  //     ctx.res.writeHead(302, { Location: redirectedPath });
  //     ctx.res.end();
  //   } else {
  //     Router.push(redirectedPath); // redirect at client
  //   }
  // }

  return isloggedin;
};


export const withAuthSync = WrappedComponent => {
  const Wrapper = props => {
    return <WrappedComponent {...props} />;
  };

  Wrapper.getInitialProps = async ctx => {
    const isloggedin = auth(ctx);
    const _cookie = isServer() ? ctx.req.headers.cookie : null; //extract cookie
    await ctx.reduxStore.dispatch({
      type: SERVER_SET_COOKIE,
      payload: {
        _cookie,
        isloggedin
      }
    });

    const componentProps =
      WrappedComponent.getInitialProps &&
      (await WrappedComponent.getInitialProps(ctx));

    return {
      ...componentProps
    };
  };

  return Wrapper;
};
