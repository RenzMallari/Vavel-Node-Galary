import React from "react";
import { Modal } from "reactstrap";
import { PriceConvert } from "../common/ConvertPrice";
import { useSelector, useDispatch } from "react-redux";
import { postCart } from "../../redux/actions/gallery";
import config from "../../config";
import { getUserIdOrLocalUserId } from "../../auth";
import { useRouter } from "next/router";
import { DEFAULT_CURRENCY } from "../../utils/constant";

function GetLicenseModal({
  handleClose,
  status,
  priceConvert,
  albumId,
  publicid,
  data
}) {
  const dispatch = useDispatch();
  const picture = useSelector(store => store.picture.data);
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const _id = getUserIdOrLocalUserId();
  const phoneNumber = "+91-";
  const imageType = picture.size;
  const price = picture.price;
  const _widhtImg = picture.width;
  const _heightImg = picture.height;
  const imgDpi = picture.imgDpi;
  const galleryid = albumId;
  const imageid = publicid;
  const image =
    data.images.filter(image => image.publicid === imageid)[0] || {};
  const downloadLink = `${config.ftpFullPath}/w_${_widhtImg},h_${_heightImg}/${publicid}.${image.fileExtension}`;
  const imagePublicId = image.publicid;
  const soldout = image.soldout;
  const sellonetime = image.sellonetime;
  const seller_id = image.userid;
  const type = "album";

  const handlePostCart = () =>
    dispatch(
      postCart(
        phoneNumber,
        imageType,
        price,
        downloadLink,
        _widhtImg,
        _heightImg,
        imgDpi,
        price,
        galleryid,
        imageid,
        _id,
        imagePublicId,
        soldout,
        sellonetime,
        seller_id,
        type
      )
    );

  const addToCart = async e => {
    e.preventDefault();
    setLoading(true);
    await handlePostCart();
    setLoading(false);
    handleClose();
  };

  const handleCompleteCheckout = async e => {
    e.preventDefault();
    setLoading(true);
    await handlePostCart();
    setLoading(false);
    handleClose();
    router.push("/checkout");
  };

  return (
    <Modal className="GetLicenseModal" isOpen={status} toggle={handleClose}>
      <div className="modal-header">
        <button className="close" type="button" onClick={() => handleClose()}>
          <span>×</span>
        </button>
        <a href="#" className="logo-top">
          <img src="/static/images/logo-modal.png" className="img-responsive" />
        </a>
        <h5 className="modal-title">Get License</h5>
        <h6 className="modal-slogan">
          <div className="modal-image-size">{picture.size}</div>
          <div className="modal-image-price">
            <PriceConvert
              amoutDefault={picture.price}
              from={DEFAULT_CURRENCY}
              to={priceConvert}
            ></PriceConvert>
          </div>
        </h6>
      </div>
      <div className="modal-body">
        <div className="confirm_form">
          <button className="btn btn-block modal-button" onClick={addToCart}>
            Add to Cart
          </button>
          <button
            className="btn btn-block modal-button"
            onClick={handleCompleteCheckout}
          >
            Complete Checkout
          </button>
        </div>
      </div>
      <div className="modal-footer">
        <p>
          <a href="#">admin@vavel.com</a>
        </p>
      </div>
      {loading && (
        <div className="cart-loading">
          <div />
        </div>
      )}
    </Modal>
  );
}

export default GetLicenseModal;
