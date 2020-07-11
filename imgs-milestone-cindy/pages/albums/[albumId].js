import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";
import nextCookie from "next-cookies";

import {
  getDataAlbumDetails,
  paginateAlbumDetailsLocal
} from "../../redux/actions/albumDetails";
import { AlbumDetails } from "../../components/albumDetails";
import ChooseSizeModal from "../../components/common/ChooseSizeModal";
import { handleImageDetails } from "../../utils/helpers";
import { openModal } from "../../redux/actions/modal";
import * as types from "../../redux/constants";
import SaveCollectionModal from "../../components/common/SaveCollectionModal";
import GetLicenseModal from "../../components/common/GetLicenseModal";
import { selectPrice } from "../../redux/actions/price";
import { DEFAULT_CURRENCY } from "../../utils/constant";
import config from "../../config";
import { CheckoutModal } from "../../components/common";
import { getDataCartList } from "../../redux/actions/cartList";
import { getUserIdOrLocalUserId } from "../../auth";
function DetailAlbum({ isVisited, albumId, currency }) {
  const router = useRouter();
  // const { albumId } = router.query;
  const [data, setData] = React.useState(null);
  const [publicid, setPublicid] = React.useState("");
  const dispatch = useDispatch();
  const statusCheckout = useSelector(store => store.modal.checkout);

  const handleGetListCart = React.useCallback(() => {
    const _id = getUserIdOrLocalUserId();
    dispatch(getDataCartList(_id));
  }, [dispatch]);

  React.useEffect(() => {
    if (isVisited) {
      dispatch(
        selectPrice({
          base: currency && currency !== "null" ? currency : DEFAULT_CURRENCY
        })
      );
      dispatch(
        getDataAlbumDetails({
          albumId,
          page: 0,
          limit: 30
        })
      );
    }
    handleGetListCart();
  }, [albumId, handleGetListCart]);

  const showModal = (e, item) => {
    e.preventDefault();
    let price = item.price == null ? {} : item.price;
    let imagePrice = {
      small: price.small ? parseInt(price.small) : 0,
      medium: price.medium ? parseInt(price.medium) : 0,
      large: price.large ? parseInt(price.large) : 0
    };
    let imageDetails = handleImageDetails(
      item.imagewidth,
      item.imageheight,
      imagePrice
    );
    setData(imageDetails);
    setPublicid(item.publicid);
    dispatch(openModal(types.OPEN_MODAL_CHOOSE_SIZE));
  };
  const showImageDetails = (albumId, imageId) => {
    router.push(`/pictures/${albumId}/${imageId}`);
  };

  const dataAlbumDetails = useSelector(store => store.albumDetails.data);
  const statusChooseSize = useSelector(store => store.modal.chooseSize);
  const statusGetLicense = useSelector(store => store.modal.getLicense);
  const dataCollections = useSelector(
    store => store.collections.allcollections
  );
  let listTags = [...dataAlbumDetails.tags];
  for (const element of dataAlbumDetails.msg) {
    listTags = [...listTags, ...element.tags];
  }

  const title = `${dataAlbumDetails.albumname} - VAVEL Images`;
  const description = `Explore the ${dataAlbumDetails.msg.length} pictures of this Album.`;
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
      <AlbumDetails
        albumId={albumId}
        msg={dataAlbumDetails.msgLocal}
        loading={dataAlbumDetails.loading}
        showModal={showModal}
        showImageDetails={showImageDetails}
        count={dataAlbumDetails.msg.length}
        page={dataAlbumDetails.page}
        limit={dataAlbumDetails.limit}
        actionUpdateParams={paginateAlbumDetailsLocal}
        data={dataAlbumDetails}
        datamsg={dataAlbumDetails.msg}
        usrdetls={dataAlbumDetails.usrdetls}
        listTags={listTags}
        error={dataAlbumDetails.error}
      />
      {statusChooseSize && (
        <ChooseSizeModal
          data={data}
          handleClicked={() =>
            dispatch(openModal(types.OPEN_MODAL_SAVE_COLLETION))
          }
          handleClose={() => dispatch(openModal(types.CLOSE_MODAL_CHOOSE_SIZE))}
          handleGetLicense={e => e.preventDefault()}
          isOpen={statusChooseSize}
        />
      )}
      <SaveCollectionModal
        handleClose={() =>
          dispatch(openModal(types.CLOSE_MODAL_SAVE_COLLECTION))
        }
        publicid={publicid}
        albumId={albumId}
        dataCollections={dataCollections}
      />
      {statusGetLicense && (
        <GetLicenseModal
          handleClose={() => dispatch(openModal(types.CLOSE_MODAL_GET_LICENSE))}
          handleClicked={e => e.preventDefault()}
          status={statusGetLicense}
        />
      )}
      {statusCheckout && (
        <CheckoutModal
          handleClose={() => dispatch(openModal(types.CLOSE_MODAL_CHECKOUT))}
          externalAmount={dataAlbumDetails.albumprice}
        />
      )}
    </>
  );
}

DetailAlbum.getInitialProps = async ({ reduxStore, query, ...restProps }) => {
  const { albumId } = query;
  const { currency } = nextCookie(restProps);

  const isVisited = !restProps.req;

  if (!isVisited) {
    await Promise.all([
      reduxStore.dispatch(
        selectPrice({
          base: currency && currency !== "null" ? currency : DEFAULT_CURRENCY
        })
      ),
      reduxStore.dispatch(
        getDataAlbumDetails({
          albumId,
          page: 0,
          limit: 30
        })
      )
    ]);
  }
  return {
    isVisited,
    albumId,
    currency
  };
};
export default DetailAlbum;
