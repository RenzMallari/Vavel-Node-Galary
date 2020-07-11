import React from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";

import {
  AlbumFound,
  PictureFound,
  UsersFound,
  KeywordsFound
} from "../components/search";
import {
  postAlbumSearch,
  postUsersSearch,
  postKeywordsSearch,
  postCatalogSearch
} from "../redux/actions/search";
import { NoResult } from "../components/common";
import { ListTags } from "../components/listTags";
import { fetchTags } from "../utils/helpers";
import config from "../config";

function Search({ keyword, page, limit, isVisited }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const storeAlbumSearch = useSelector(store => store.search.album);
  const storeUsersSearch = useSelector(store => store.search.users);
  const storePictures = useSelector(store => store.search.pictures);
  const storeKeywords = useSelector(store => store.search.keywords);
  const storeCatalogs = useSelector(store => store.search.catalogs);

  React.useEffect(() => {
    if (isVisited) {
      if (parseInt(page) < 2) {
        dispatch(postUsersSearch({ keyword }));
        dispatch(postKeywordsSearch({ keyword }));
      }
      dispatch(postAlbumSearch({ keyword, page, limit }));
      dispatch(postCatalogSearch({ keyword, page, limit: 50 }));
    }
  }, [keyword, page, limit]);

  const dataAlbum = [...storePictures.data, ...storeCatalogs.data];
  const count = dataAlbum.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const result = dataAlbum.slice(start, end);

  let listTags =
    parseInt(page) < 2
      ? [...fetchTags(storeAlbumSearch.data), ...fetchTags(result)]
      : [];

  const title = `Search results about ${keyword} - VAVEL Images`;
  const description = `These are all the pictures about ${keyword}`;
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
      {result.length === 0 &&
      storePictures.isFetchData === true &&
      storeCatalogs.isFetchData === true ? (
        <NoResult />
      ) : (
        <>
          {parseInt(page) < 2 ? <ListTags listTags={listTags} /> : ""}
          {parseInt(page) < 2 && storeAlbumSearch.data.length !== 0 ? (
            <AlbumFound
              album={storeAlbumSearch.data}
              loading={storeAlbumSearch.loading}
            />
          ) : (
            ""
          )}
          <PictureFound
            dataImages={result}
            page={page}
            limit={storePictures.limit}
            count={count}
            actionGetData={postAlbumSearch}
            keyword={keyword}
            loading={storeAlbumSearch.loading}
          />
          {parseInt(page) < 2 && storeKeywords.data.length ? (
            <KeywordsFound data={storeKeywords.data} />
          ) : (
            ""
          )}
          {parseInt(page) < 2 && storeUsersSearch.data.length ? (
            <UsersFound users={storeUsersSearch.data} />
          ) : (
            ""
          )}
        </>
      )}
    </>
  );
}

Search.getInitialProps = async ({ reduxStore, query, ...restProps }) => {
  const storePictures = reduxStore.getState().search.pictures;
  const limit = storePictures.limit;
  const { keyword, page } = query;
  const postUsersSearchPromise =
    page < 2
      ? reduxStore.dispatch(postUsersSearch({ keyword }))
      : Promise.resolve();
  const postKeywordsSearchPromise =
    page < 2
      ? reduxStore.dispatch(postKeywordsSearch({ keyword }))
      : Promise.resolve();
  const isVisited = !restProps.req;

  if (!isVisited) {
    await Promise.all([
      reduxStore.dispatch(postAlbumSearch({ keyword, page, limit })),
      reduxStore.dispatch(postCatalogSearch({ keyword, page, limit: 50 })),
      postUsersSearchPromise,
      postKeywordsSearchPromise
    ]);
  }

  return {
    keyword,
    page,
    limit,
    isVisited
  };
};

export default Search;
