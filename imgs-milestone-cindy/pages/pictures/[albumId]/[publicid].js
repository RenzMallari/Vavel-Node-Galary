import React from "react";
import { useSelector, useDispatch } from "react-redux";
import nextCookie from "next-cookies";
import { useRouter } from "next/router";

import _ from "lodash";

import { Viewer, MainDetail } from "../../../components/details";
import {
  getImageDetails,
  getPhotoRelatedByUser,
  getLikeImage
} from "../../../redux/actions/gallery";
import { ListTags } from "../../../components/listTags";
import { fetchTags, formatPrefix } from "../../../utils/helpers";
import { NotFound, Loading } from "../../../components/common";
import SaveCollectionModal from "../../../components/common/SaveCollectionModal";
import { openModal } from "../../../redux/actions/modal";
import * as types from "../../../redux/constants";
import GetLicenseModal from "../../../components/common/GetLicenseModal";
import GetEmbedModal from "../../../components/common/GetEmbedModal";
import { selectPrice } from "../../../redux/actions/price";
import { DEFAULT_CURRENCY } from "../../../utils/constant";

import { isLoggedIn } from "../../../auth";
import Head from "next/head";
import config from "../../../config";
function DetailPage({ albumId, publicid, currency, isVisited }) {
  const router = useRouter();
  const dataGallery = useSelector(store => store.gallery);
  const dataImageDetail = dataGallery.details;
  const dataImageRelated = dataGallery.related;
  const statusGetLicense = useSelector(store => store.modal.getLicense);
  const statusGetEmbed = useSelector(store => store.modal.getEmbed);
  const priceConvert = useSelector(store => store.price.base);
  const dataCollections = useSelector(
    store => store.collections.allcollections
  );
  const dispatch = useDispatch();

  const handleGetImageDetailsAndRelatedImages = React.useCallback(async () => {
    const data = await dispatch(
      getImageDetails({
        albumId,
        publicid
      })
    );
    const user = data.msg;
    dispatch(
      getPhotoRelatedByUser(
        {
          userID: user.userid,
          galleryID: albumId,
          photoID: publicid
        },
        dataGallery
      )
    );
  }, [albumId, publicid]);

  React.useEffect(() => {
    if (isVisited) {
      handleGetImageDetailsAndRelatedImages();
      dispatch(
        selectPrice({
          base: currency && currency !== "null" ? currency : DEFAULT_CURRENCY
        })
      );
      dispatch(getLikeImage(albumId, publicid));
    }
  }, [handleGetImageDetailsAndRelatedImages, currency]);

  const dataImage = dataImageDetail.data.msg || { images: [], album: {} };
  const dataUser = dataImageDetail.data.user || {};

  let result = [];
  if (dataImage) {
    result = [...result, dataImage, ...dataImage.images];
  }
  const listtags = fetchTags(result);

  const listImages = dataImage.images;
  const imageIndex = _.findIndex(listImages, { publicid });

  const handleNextImage = () => {
    if (imageIndex < listImages.length - 1) {
      let previous = {
        id: listImages[imageIndex + 1].publicid,
        album: albumId
      };
      router.push(
        "/pictures/[albumId]/[publicid]",
        `/pictures/${previous.album}/${previous.id}`
      );
    }
  };
  const handlePrevImage = () => {
    if (imageIndex) {
      let previous = {
        id: listImages[imageIndex - 1].publicid,
        album: albumId
      };
      router.push(
        "/pictures/[albumId]/[publicid]",
        `/pictures/${previous.album}/${previous.id}`
      );
    }
  };
  const handleCloseImage = e => {
    e.preventDefault();
    router.push(`/`);
  };

  if (dataImageDetail.error) {
    return <NotFound message={dataImageDetail.error} />;
  }

  const title = dataImage.caption
    ? `${dataImage.caption} by ${dataUser.fullname} Photo ${imageIndex +
        1} | VAVEL Images`
    : `${dataImage.album.name} Photo ${imageIndex + 1} | VAVEL Images `;
  const description = dataImage.caption
    ? `${dataImage.album.name} Photo ${imageIndex + 1} - VAVEL Images`
    : `Explore and buy this picture.`;
  const currenturl = `${config.HOST}${router.asPath}`;

  return dataImageDetail.loading &&
    !Object.keys(dataImageDetail.data).length ? (
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

        <meta property="og:image:width" content={dataImage.imagewidth} />
        <meta property="og:image:height" content={dataImage.imageheight} />
        <meta content={dataImage.imagewidth} name="twitter:image:width" />
        <meta content={dataImage.imageheight} name="twitter:image:height" />
        <meta
          property="og:image"
          content={`${config.ftpFullPath}${formatPrefix(dataImage.album.date)}${
            dataImage.imagepublicid
          }.${dataImage.fileExtension}`}
        />
        <meta
          name="twitter:image"
          content={`${config.ftpFullPath}${formatPrefix(dataImage.album.date)}${
            dataImage.imagepublicid
          }.${dataImage.fileExtension}`}
        />
      </Head>
      <ListTags listTags={listtags} link="/" />
      <Viewer
        data={dataImage}
        error={dataImageDetail.error}
        loading={dataImageDetail.loading}
        nextImage={handleNextImage}
        previousImage={handlePrevImage}
        closeImage={handleCloseImage}
        priceConvert={priceConvert}
        handleSave={e => {
          e.preventDefault();
          isLoggedIn()
            ? dispatch(openModal(types.OPEN_MODAL_SAVE_COLLETION))
            : dispatch(openModal(types.OPEN_MODAL_SIGN_UP));
        }}
        handleLicense={e => {
          e.preventDefault();
          dispatch(openModal(types.OPEN_MODAL_GET_LICENSE));
        }}
        handleEmbed={e => {
          e.preventDefault();
          dispatch(openModal(types.OPEN_MODAL_GET_EMBED));
        }}
      />
      <MainDetail
        data={dataImageDetail.data.msg}
        user={dataImageDetail.data.user || {}}
        relateds={dataImageRelated}
      />
      <SaveCollectionModal
        handleClose={() =>
          dispatch(openModal(types.CLOSE_MODAL_SAVE_COLLECTION))
        }
        dataCollections={dataCollections}
        albumId={albumId}
        publicid={publicid}
      />
      {statusGetLicense && (
        <GetLicenseModal
          handleClose={() => dispatch(openModal(types.CLOSE_MODAL_GET_LICENSE))}
          status={statusGetLicense}
          priceConvert={priceConvert}
          albumId={albumId}
          publicid={publicid}
          data={dataImageDetail.data.msg}
        />
      )}
      {statusGetEmbed && (
        <GetEmbedModal
          handleClose={() => dispatch(openModal(types.CLOSE_MODAL_GET_EMBED))}
          status={statusGetEmbed}
          data={dataImageDetail.data.msg}
        />
      )}
    </>
  );
}

DetailPage.getInitialProps = async ({ reduxStore, query, ...restProps }) => {
  const { albumId, publicid } = query;
  const { currency } = nextCookie(restProps);

  const isVisited = !restProps.req;
  if (!isVisited) {
    const data = await reduxStore.dispatch(
      getImageDetails({
        albumId,
        publicid
      })
    );
    let user = data.msg;
    await Promise.all([
      reduxStore.dispatch(
        getPhotoRelatedByUser(
          {
            userID: user.userid,
            galleryID: albumId,
            photoID: publicid
          },
          reduxStore.getState().gallery
        )
      ),
      reduxStore.dispatch(
        selectPrice({
          base: currency && currency !== "null" ? currency : DEFAULT_CURRENCY
        })
      ),
      reduxStore.dispatch(getLikeImage(albumId, publicid))
    ]);
  }

  return {
    albumId,
    publicid,
    isVisited,
    currency
  };
};

export default DetailPage;
