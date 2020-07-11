import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";
import { useRouter } from "next/router";

import { getMembersTeam, getContentTeam } from "../redux/actions/team";
import { AboutUs } from "../components/team";
import config from "../config";

function Team({ isVisited }) {
  const router = useRouter();
  const dataTeam = useSelector(store => store.team);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (isVisited) {
      dispatch(getContentTeam());
      dispatch(getMembersTeam());
    }
  }, []);

  const title = "About us - VAVEL Images";
  const description = "About us - VAVEL Images";
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
      <AboutUs
        listAllMembers={dataTeam.listAllMembers}
        contentById={dataTeam.contentById}
      />
    </>
  );
}

Team.getInitialProps = async ({ reduxStore, ...restProps }) => {
  const isVisited = !restProps.req;

  if (!isVisited) {
    await Promise.all([
      reduxStore.dispatch(getContentTeam()),
      reduxStore.dispatch(getMembersTeam())
    ]);
  }
  return { isVisited };
};

export default Team;
