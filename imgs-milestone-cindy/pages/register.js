import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";

import { signUp, getDataSignUp } from "../redux/actions/signup";
import { SignUp } from "../components/signup";
import { loginFb } from "../auth";
import { openMessage } from "../redux/actions/message";
import config from "../config";

const Register = ({ isVisited }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  React.useEffect(() => {
    if (isVisited) {
      dispatch(getDataSignUp());
    }
  }, []);

  const dataSignUp = useSelector(store => store.signup);

  const onSubmit = props => {
    dispatch(
      signUp(
        { ...props },
        () => {
          router.push("/");
        },
        () => {}
      )
    );
  };

  const onLoginFb = data => {
    loginFb(
      data,
      () => {
        dispatch(
          openMessage({
            content: "You have successfully logged in!",
            type: "success"
          })
        );
        router.push("/");
      },
      () => {
        dispatch(
          openMessage({
            content: "Invalid facebook login !",
            type: "danger"
          })
        );
      }
    );
  };

  const title =
    "Sign up and create your online Sales Portfolio as Professional Photographer and get commission for invite friends - VAVEL Images";
  const description =
    "An inspiring platform, a community of unquiet photographers and the place to sell your creative work!";
  const currenturl = `${config.HOST}${router.asPath}`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link href={currenturl} rel="canonical" />
        <meta property="og:url" content={`${currenturl}`} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>
      <SignUp data={dataSignUp} onSubmit={onSubmit} onLoginFb={onLoginFb} />
    </>
  );
};

Register.getInitialProps = async ({ reduxStore, ...restProps }) => {
  const isVisited = !restProps.req;

  if (!isVisited) {
    await reduxStore.dispatch(getDataSignUp());
  }
  return { isVisited };
};

export default Register;
