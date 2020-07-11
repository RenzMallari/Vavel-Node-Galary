import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";

import {
  CatalogDetails,
  TitleBar,
  Light
} from "../../components/catalogDetails";
import { getDataCatalogDetails } from "../../redux/actions/catalogDetails";
import { ListTags } from "../../components/listTags";
import { Loading } from "../../components/common";
import SaveCollectionModal from "../../components/common/SaveCollectionModal";
import * as types from "../../redux/constants";
import { openModal } from "../../redux/actions/modal";
import { isLoggedIn } from "../../auth";
import config from "../../config";

function CatalogDetailsPage({ isVisited, keyword }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [publicid, setPublicid] = React.useState("");
  const [albumId, setAlbumId] = React.useState("");
  // const { keyword } = router.query;

  React.useEffect(() => {
    if (isVisited) {
      dispatch(getDataCatalogDetails({ keyword }));
    }
  }, [keyword]);

  const dataCollections = useSelector(
    store => store.collections.allcollections
  );

  const showModal = async (e, item) => {
    e.preventDefault();
    if (isLoggedIn()) {
      await setPublicid(item.imageid);
      await setAlbumId(item.galleryid);
      dispatch(openModal(types.OPEN_MODAL_SAVE_COLLETION));
    } else {
      dispatch(openModal(types.OPEN_MODAL_SIGN_UP));
    }
  };

  const showImageDetails = (albumId, imageId) => {
    router.push(`/pictures/${albumId}/${imageId}`);
  };

  const dataCatalogDetails = useSelector(store => store.catalogDetails.data);

  const title = `The last pictures of ${keyword} in VAVEL Images`;
  const description = `Explore stock photos of ${keyword} in our website`;
  const currenturl = `${config.HOST}${router.asPath}`;

  return dataCatalogDetails.loading ? (
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
      <ListTags link="/" />
      <TitleBar
        name={dataCatalogDetails.keyword}
        count={dataCatalogDetails.msg.length}
      />
      <Light />
      <CatalogDetails
        msg={dataCatalogDetails.msg}
        loading={dataCatalogDetails.loading}
        showModal={showModal}
        showImageDetails={showImageDetails}
      />
      <SaveCollectionModal
        handleClose={() =>
          dispatch(openModal(types.CLOSE_MODAL_SAVE_COLLECTION))
        }
        publicid={publicid}
        albumId={albumId}
        dataCollections={dataCollections}
      />
    </>
  );
}

CatalogDetailsPage.getInitialProps = async ({
  reduxStore,
  query,
  ...restProps
}) => {
  const { keyword } = query;

  const isVisited = !restProps.req;
  if (!isVisited) {
    await Promise.all([
      reduxStore.dispatch(getDataCatalogDetails({ keyword }))
    ]);
  }
  return {
    isVisited,
    keyword
  };
};

export default CatalogDetailsPage;
