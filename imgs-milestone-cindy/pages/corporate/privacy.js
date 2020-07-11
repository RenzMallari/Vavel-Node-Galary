import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";

import { Cms } from "../../components/cms";
import { getDataCms } from "../../redux/actions/cms";
import { useRouter } from "next/router";
import config from "../../config";

function Privacy({ isVisited }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const storeTerms = useSelector(store => store.cms);

  React.useEffect(() => {
    if (isVisited) {
      dispatch(
        getDataCms({
          name: "privacy"
        })
      );
    }
  }, []);

  const title = "Privacy - VAVEL Images";
  const description = "Privacy - VAVEL Images";
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
      <Cms
        pageTitle={storeTerms.pageTitle}
        pageContent={storeTerms.pageContent}
        loading={storeTerms.loading}
      />
    </>
  );
}

Privacy.getInitialProps = async ({ reduxStore, req }) => {
  const isVisited = !req;
  if (!isVisited) {
    await reduxStore.dispatch(
      getDataCms({
        name: "privacy"
      })
    );
  }
  return { isVisited };
};

export default Privacy;
