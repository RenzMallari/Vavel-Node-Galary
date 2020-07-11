import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";

import { Cms } from "../../components/cms";
import { getDataCms } from "../../redux/actions/cms";
import { useRouter } from "next/router";
import config from "../../config";

function Term({ isVisited }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const storeTerms = useSelector(store => store.cms);

  React.useEffect(() => {
    if (isVisited) {
      dispatch(
        getDataCms({
          name: "terms"
        })
      );
    }
  }, []);

  const title = "Terms of Use - VAVEL Images";
  const description = "Terms of Use - VAVEL Images";
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

Term.getInitialProps = async ({ reduxStore, req }) => {
  const isVisited = !req;
  if (!isVisited) {
    await reduxStore.dispatch(
      getDataCms({
        name: "terms"
      })
    );
  }
  return { isVisited };
};

export default Term;
