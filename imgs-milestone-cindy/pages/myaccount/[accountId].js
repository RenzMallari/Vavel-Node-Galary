import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";

import {
  getUserDetails,
  getAlbumUser
} from "../../redux/actions/manageAccount";
import { Banner } from "../../components/home";
import { LayoutAlbum, Profile } from "../../components/manageAccount";
import { Loading, NotFound, TimeLine } from "../../components/common";
import { getDatePhotos } from "../../redux/actions/photos";
import config from "../../config";

function ManageAccount({ isVisited, accountId, year, month, page, limit }) {
  const router = useRouter();

  const userDetail = useSelector(store => store.userDetail);
  const timelinePhotos = useSelector(store => store.photos.timeline.data);

  const { albumUser, error, loading } = userDetail;

  const title = `${userDetail.data.fullname} Professional Photos Portfolio | VAVEL
          Images`;
  const description = `The last pictures and personal portfolio by ${userDetail.data.fullname}`;
  const currenturl = `${config.HOST}${router.asPath}`;

  const dispatch = useDispatch();

  React.useEffect(() => {
    if (isVisited) {
      dispatch(getUserDetails({ accountId })),
        dispatch(
          getAlbumUser({
            accountId,
            year,
            month,
            page: page || 0,
            limit: limit || 30
          })
        ),
        dispatch(getDatePhotos({ userid: accountId }));
    }
  }, [accountId, year, month, page, limit, isVisited]);

  if (error) {
    return <NotFound message="We do not have this user!" />;
  }

  return loading ? (
    <Loading />
  ) : (
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
      <TimeLine
        dataPhotos={timelinePhotos}
        actionFilterData={getUserDetails}
        year={year}
        month={month}
        url={`/myaccount/${accountId}`}
        route={`/myaccount/[accountId]`}
        isDynamicLink
      />
      <Profile userDetail={userDetail} />
      {albumUser.is_album_exist && (
        <LayoutAlbum>
          <h3>ALL PHOTOS</h3>
          <Banner
            data={albumUser.data}
            loading={albumUser.loading}
            page={albumUser.page}
            count={albumUser.count}
            year={year}
            month={month}
            limit={albumUser.limit}
            actionGetData={filters =>
              getAlbumUser({ ...filters, accountId, year, month })
            }
            URL={`/myaccount/${accountId}`}
            isPushURL
            isDynamicLink
            route={`/myaccount/[accountId]`}
          />
        </LayoutAlbum>
      )}
    </>
  );
}

ManageAccount.getInitialProps = async ({ reduxStore, query, ...restProps }) => {
  const { accountId, year, month, page, limit } = query;

  const isVisited = !restProps.req;

  if (!isVisited) {
    await Promise.all([
      reduxStore.dispatch(getUserDetails({ accountId })),
      reduxStore.dispatch(
        getAlbumUser({
          accountId,
          year,
          month,
          page: page || 0,
          limit: limit || 30
        })
      ),
      reduxStore.dispatch(getDatePhotos({ userid: accountId }))
    ]);
  }
  return {
    isVisited,
    accountId,
    year,
    month,
    page,
    limit
  };
};

export default ManageAccount;
