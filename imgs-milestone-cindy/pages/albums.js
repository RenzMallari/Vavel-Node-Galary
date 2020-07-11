import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";

import { Banner } from "../components/home";
import { getPhotosAlbums } from "../redux/actions/photos";
import { ListTags } from "../components/listTags";
import config from "../config";

function Albums({ tagFilter, page, limit, isVisited }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const storePhotos = useSelector(store => store.photos.albums);

  React.useEffect(() => {
    if (isVisited) {
      dispatch(
        getPhotosAlbums({
          limit: limit || 30,
          page: page || 0,
          tagFilter
        })
      );
    }
  }, []);

  let listtags = [];
  for (const element of storePhotos.data) {
    listtags = [...listtags, ...element.tags];
  }
  const dataFilter = storePhotos.data.filter(item => {
    return item.tags.some(tagItem => tagItem.tag === tagFilter);
  });

  const title = `Last Albums - VAVEL Images${
    page && parseInt(page) ? `, page ${page + 1}` : ""
  }`;
  const description =
    "Explore the last albums of stock photography by the photographers of VAVEL Images";
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
      <ListTags listTags={listtags} link="/albums" linktag="albums" />
      {tagFilter ? (
        <Banner
          data={dataFilter}
          loading={storePhotos.loading}
          page={storePhotos.page}
          count={storePhotos.count}
          limit={storePhotos.limit}
          actionGetData={getPhotosAlbums}
          isAlbum={true}
          tag={tagFilter}
          isPushURL
          URL="/albums"
        />
      ) : (
        <Banner
          data={storePhotos.data}
          loading={storePhotos.loading}
          page={storePhotos.page}
          count={storePhotos.count}
          limit={storePhotos.limit}
          actionGetData={getPhotosAlbums}
          isAlbum={true}
          tag={tagFilter}
          isPushURL
          URL="/albums"
        />
      )}
    </>
  );
}

Albums.getInitialProps = async ({ reduxStore, query, ...restProps }) => {
  const { tag, page, limit } = query;
  const tagFilter = tag || null;

  const isVisited = !restProps.req;

  if (!isVisited) {
    await reduxStore.dispatch(
      getPhotosAlbums({
        limit: limit || 30,
        page: page || 0,
        tagFilter
      })
    );
  }

  return {
    tagFilter,
    page,
    limit,
    isVisited
  };
};

export default Albums;
