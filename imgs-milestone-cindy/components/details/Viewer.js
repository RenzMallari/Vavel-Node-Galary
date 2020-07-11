import React from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import classnames from "classnames";
import { postLikeImage } from "../../redux/actions/gallery";
import config from "../../config";
import { PriceConvert } from "../common/ConvertPrice";
import { checkSizePicture } from "../../redux/actions/picture";
import { isLoggedIn } from "../../auth";
import { DEFAULT_CURRENCY } from "../../utils/constant";
import { formatPrefix } from "../../utils/helpers";
import * as types from "../../redux/constants";
import { openModal } from "../../redux/actions/modal";

const photoLoading = "/static/images/loading-image.gif";

function ImageSize({ id, title, item, checked, onChangeSize, priceConvert }) {
  const dispatch = useDispatch();
  checked &&
    dispatch(
      checkSizePicture({
        data: {
          size: item.type,
          price: item.price,
          width: item.width,
          height: item.height,
          imgDpi: item.dpi
        }
      })
    );
  const isDisplay = priceConvert === DEFAULT_CURRENCY ? "none" : "inline-block";

  return (
    <div className="size-con">
      <input
        type="radio"
        id={id}
        name="size"
        value={title}
        className="radio-btn-white"
        checked={checked}
        onChange={onChangeSize}
      />
      <label htmlFor={id} style={{ display: "block" }}>
        <div className="caps text-bright fw-700 clearfix">
          <span className="ng-binding">{title}</span>
          <span
            className="pull-right text-right"
            style={{ textTransform: "none" }}
          >
            {false && <div style={{ fontSize: "12px" }}>$10.00</div>}
            <div
              className="ng-binding"
              style={{ fontSize: "10px", display: isDisplay }}
            >
              <PriceConvert
                amoutDefault={item.price}
                from={DEFAULT_CURRENCY}
                to={priceConvert}
              ></PriceConvert>
            </div>
            <div className="ng-binding">${item.price}</div>
          </span>
        </div>
        <div className="small text-medium ng-binding">
          {item.width} x {item.height} px | {item.inch} @ {item.dpi} dpi
        </div>
      </label>
    </div>
  );
}

function Viewer(props) {
  const {
    data,
    nextImage,
    previousImage,
    closeImage,
    handleSave,
    handleLicense,
    priceConvert,
    handleEmbed
  } = props;
  const totalLikes = useSelector(store => store.gallery.totalLikes);
  const [state, setState] = React.useState({
    size: ""
  });
  const [liked, setLiked] = React.useState(false);
  const refImg = React.useRef(null);
  const refPrev = React.useRef(null);
  const refNext = React.useRef(null);
  const router = useRouter();
  const { albumId, publicid } = router.query;
  const dispatch = useDispatch();

  React.useEffect(() => {
    window.addEventListener("keyup", handleKeyup);
    return () => {
      window.removeEventListener("keyup", handleKeyup);
    };
  }, []);

  const handleKeyup = e => {
    if (e.keyCode === 39) {
      refNext.current.click();
    } else if (e.keyCode === 37) {
      refPrev.current.click();
    }
  };

  const handleChangeSize = type => () => {
    setState({
      ...state,
      size: type
    });
  };

  const handleLike = e => {
    e.preventDefault();
    if (isLoggedIn()) {
      dispatch(postLikeImage(albumId, publicid));
      setLiked(true);
    } else {
      dispatch(openModal(types.OPEN_MODAL_SIGN_UP));
    }
  };

  return (
    <section id="imageViewer">
      {data && (
        <div className="preview-main-container clearfix">
            <a onClick={closeImage} className="text-link dark close-control">
              ×
            </a>
          <a
            ref={refPrev}
            onClick={previousImage}
            className="prev-arrow visible-md visible-lg ember-view ng-scope"
          ></a>
          <a
            ref={refNext}
            onClick={nextImage}
            className="next-arrow visible-md visible-lg ember-view ng-scope"
          ></a>
          <div className="container nopd">
            <div className="row-image">
              <div className="row-image-main">
                <div className="img-preview">
                    <a onClick={e => e.preventDefault()}>
                      {/* {isShowLoadingImage && ( */}
                      <div className="loading">
                        <img alt="" src={photoLoading} width="100%" />
                      </div>
                      {/* )} */}
                      <img
                        alt=""
                        style={{
                          display: `${props.loading ? "none" : "unset"}`
                        }}
                        ref={refImg}
                        src={`${config.ftpFullPath}${formatPrefix(
                          data.album.date
                        )}${data.imagepublicid}.${data.fileExtension}`}
                        width="100%"
                        onClick={nextImage}
                      />
                    </a>
                </div>
                <div className="detail-bar">
                  <a onClick={handleLike}>
                    <div className="total-like">
                      <i
                        className={classnames("love-icon", { liked: liked })}
                      ></i>
                      <span className="small">{totalLikes}</span>
                    </div>
                  </a>
                    <a onClick={handleEmbed}>
                      <div className="download-embed">
                        <i className="download-icon"></i>
                        <span className="small">Embed</span>
                      </div>
                    </a>
                </div>
              </div>
              <div className="row-image-sub">
                <div>
                  {data.imagedetails &&
                    data.imagedetails.map(item => {
                      return (
                        <ImageSize
                          key={`image-${item.type}`}
                          id={`image-${item.type}`}
                          title={item.type}
                          item={item}
                          onChangeSize={handleChangeSize(item.type)}
                          checked={state.size === item.type}
                          priceConvert={priceConvert}
                        />
                      );
                    })}
                  <div className="purchase-con">
                      <a
                        onClick={handleLicense}
                        className={
                          state.size != ""
                            ? "btn-get-license"
                            : "btn-get-license disable"
                        }
                      >
                        <i className="download-icon-md"></i>
                        Get License
                      </a>
                  </div>
                  <div className="photo-actions">
                      <a onClick={handleSave} className="btn-collect">
                        <i className="collect-icon-reg"></i>Save to Collection
                      </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Viewer;
