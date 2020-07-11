import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import nextCookie from "next-cookies";
import { pickBy, identity } from "lodash";

import { Banner, TimeLine, TagBar } from "../components/home";
import {
  getPhotosHome,
  getDatePhotos,
  getTagLogo,
  resetPhotosHome
} from "../redux/actions/photos";
import { ListTags } from "../components/listTags";
import { sortLastPhotos } from "../utils/helpers";
import { withAuthSync } from "../lib/auth";
import Head from "next/head";
import config from "../config";
import { getIp } from "../redux/actions/ip";
import { arrCountry } from "../utils/constant";

const HomePage = ({ cookieServer, params, tag, isVisited }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const countryBrowserCookie = Cookies.get("country");

  const { year, month, page } = router.query;

  const loadTagsPhotos = React.useCallback(() => {
    dispatch(
      getDatePhotos({
        tag
      })
    );
    dispatch(
      getTagLogo({
        tag
      })
    );
  }, [tag]);

  React.useEffect(() => {
    if (isVisited) {
      dispatch(getPhotosHome(params));
      loadTagsPhotos();
    }

    if (!countryBrowserCookie) {
      dispatch(getIp());
    }

    return () => {
      dispatch(resetPhotosHome());
    };
  }, [loadTagsPhotos, params, countryBrowserCookie]);

  const storePhotos = useSelector(store => store.photos.home);
  const storeDatePhotos = useSelector(store => store.photos.timeline);
  const storeTagLogo = useSelector(store => store.photos.logo);
  let listTags = [];
  for (const element of storePhotos.data) {
    listTags = [...listTags, ...element.tags, ...element.images.tags];
  }

  const dataPhotos = sortLastPhotos(storePhotos.data, cookieServer);
  const title = `${
    tag
      ? `The last pictures of ${tag} in VAVEL Images`
      : "Stock Sports Professional Images - VAVEL Images"
  }${page && parseInt(page) ? `, page ${parseInt(page) + 1}` : ""}`;
  const description = tag
    ? `Explore stock photos of ${tag} in our website`
    : "Find royalty-free images for your next project from our sports photo library of creative stock photos and stock photography.";
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
      <ListTags listTags={listTags} link="/" />
      {tag ? (
        <>
          <TimeLine
            dataPhotos={storeDatePhotos.data}
            actionFilterData={dataPhotos}
            tag={tag}
            year={year}
            month={month}
          />
          <TagBar
            logo={storeTagLogo.data}
            logoReplacement={
              dataPhotos.length && dataPhotos[0].images
                ? `${dataPhotos[0].images.publicid}.${dataPhotos[0].images.fileExtension}`
                : ""
            }
            count={storePhotos.count}
            name={tag}
          />
          <Banner
            data={dataPhotos}
            loading={storePhotos.loading}
            page={storePhotos.page}
            count={storePhotos.count}
            limit={storePhotos.limit}
            actionGetData={getPhotosHome}
            tag={tag}
            year={year}
            month={month}
            isPushURL
          />
        </>
      ) : (
        <>
          <Banner
            data={dataPhotos}
            loading={storePhotos.loading}
            page={storePhotos.page}
            count={storePhotos.count}
            limit={storePhotos.limit}
            actionGetData={getPhotosHome}
            isPushURL
          />
        </>
      )}
    </>
  );
};

HomePage.getInitialProps = async ({ reduxStore, query, ...restProps }) => {
  const { tag, year, month, time, from, to } = query;
  let {
    lat: cookieLat,
    lng: cookieLng,
    coords: cookieCoords,
    sort_by: cookieSortBy,
    country: cookieCountry
  } = nextCookie(restProps);

  const limit = query.limit || 50;
  const page = query.page || 0;
  let country = query.country || cookieCountry;
  const date = new Date();
  const ts = date.getTime();

  if (!query.country && !cookieSortBy) {
    country = null;
  }

  const params = {
    country,
    limit,
    page,
    tag,
    year,
    month,
    time,
    ts,
    from,
    to
  };
  const isVisited = !restProps.req;

  if (!isVisited) {
    const getIpPromise = !cookieCountry
      ? reduxStore.dispatch(getIp())
      : Promise.resolve();
    await reduxStore.dispatch(getPhotosHome(params));
    await Promise.all([
      reduxStore.dispatch(
        getDatePhotos({
          tag
        })
      ),
      reduxStore.dispatch(
        getTagLogo({
          tag
        })
      ),
      getIpPromise
    ]);
    const storeIp = reduxStore.getState().ip.data;
    if (storeIp && !cookieSortBy && !cookieCountry) {
      const { name, geo } = storeIp.data.country;
      const find = arrCountry.find(
        e =>
          e.name
            .split(" ")
            .join()
            .toLowerCase() === name.toLowerCase()
      );
      cookieCountry = name.toLowerCase();
      cookieSortBy = find ? "newest-country" : "newset";
      if (geo && geo.latitude && geo.longitude) {
        cookieCoords = [geo.latitude, geo.longitude];
        cookieLat = geo.latitude;
        cookieLng = geo.longitude;
      }
    }
  }

  return {
    cookieServer: {
      cookieLat,
      cookieLng,
      cookieCoords,
      cookieSortBy,
      cookieCountry
    },
    params,
    tag,
    isVisited
  };
};

export default withAuthSync(HomePage);
