/* eslint-disable no-useless-escape */
import * as types from "../constants";
import request from "../../utils/request";
import { defaultPrice } from "../../utils/constSetting";
import { getUserIdOrLocalUserId } from "../../auth";
const galleryName = "galleryImages";

export const getImageDetails = (
  params = {},
  resolve = () => {}
) => dispatch => {
  dispatch({
    type: types.GET_IMAGE_DETAILS,
    payload: {
      ...params
    }
  });
  return request()
    .get(`/gallery/getimagedetails/${params.albumId}/${params.publicid}`)
    .then(response => {
      resolve(response.data);
      let msg = response.data.msg;
      if (msg) {
        let price = msg.price == null ? {} : msg.price;
        let imagePrice = {
          small: price.small ? parseInt(price.small) : 0,
          medium: price.medium ? parseInt(price.medium) : 0,
          large: price.large ? parseInt(price.large) : 0
        };
        let imageDetails = handleImageDetails(
          msg.imagewidth,
          msg.imageheight,
          imagePrice
        );
        msg = {
          ...msg,
          ...imageDetails
        };
        response.data.msg = msg;
      }
      dispatch({
        payload: response.data,
        type: types.GET_IMAGE_DETAILS_SUCCED
      });
      return response.data;
    })
    .catch(error => {
      dispatch({
        payload: "Sorry! We don't have this picture!",
        type: types.GET_IMAGE_DETAILS_FAIL
      });
    });
};

export const getPhotoRelatedByUser = (
  params = {},
  storeGallery = {}
) => dispatch => {
  // let photoUser = getGalleryImages(storeGallery)[params.userID];
  // if (photoUser) {
  //   var album = photoUser.filter(
  //     img => img.albumid === params.galleryID && img.publicid !== params.photoID
  //   );
  //   dispatch({
  //     payload: album,
  //     type: types.GET_IMAGE_RELATED_SUCCED
  //   });
  // } else {
    return request()
      .get(`/album/getalbums/${params.userID}`)
      .then(response => {
        let data = response.data;
        var lastimage = null;
        let cachedImages = [];
        try {
          data.allalbums.forEach(function(album, key) {
            album.images.forEach(function(image, ikey) {
              if (key || ikey) {
                // first
                image.next = {
                  id: lastimage.publicid,
                  album: lastimage.albumid
                };
              }
              if (lastimage) {
                // next
                lastimage.previous = {
                  id: image.publicid,
                  album: album._id
                };
              }
              image.albumid = album._id;
              cachedImages.push(image);
              lastimage = image;
            });
          });
          var album = cachedImages.filter(
            img =>
              img.albumid === params.galleryID &&
              img.publicid !== params.photoID
          );
          dispatch({
            payload: album,
            type: types.GET_IMAGE_RELATED_SUCCED
          });
        } catch (e) {
          dispatch({
            payload: response.data,
            type: types.GET_IMAGE_RELATED_FAIL
          });
        }
      })
      .catch(error => {
        dispatch({
          payload: error,
          type: types.GET_IMAGE_RELATED_FAIL
        });
      });
  // }
};

const saveGalleryImages = images => dispatch => {
  dispatch({ type: types.SAVE_GALLERY_IMAGES, payload: images });
};

const getGalleryImages = storeGallery => {
  return storeGallery.images || {};
};

function handleImageDetails(imagewidth, imageheight, imagePrice) {
  let imagedetails = [];
  let replaceimagedetails = {};
  if (
    parseInt(imagewidth) >= 1600 ||
    parseInt(imageheight) >= 1200 ||
    parseInt(imageheight) >= 1600 ||
    parseInt(imagewidth) >= 1200
  ) {
    let largewidth = parseInt(imagewidth);
    let largeheight = parseInt(imageheight);
    let largedpi = 300;
    let largeinch = `${parseFloat(largewidth / largedpi).toFixed(
      1
    )}\" X ${parseFloat(largeheight / largedpi).toFixed(1)}\"`;
    let largedetails = {
      width: largewidth,
      height: largeheight,
      dpi: largedpi,
      inch: largeinch,
      type: "large",
      price: imagePrice.large || defaultPrice().large,
      ischecked: true
    };
    replaceimagedetails = largedetails;

    var mediumwidth = parseInt(largewidth / 2);
    var mediumheight = parseInt(largeheight / 2);
    var mediumdpi = 300;
    var mediuminch = `${parseFloat(mediumwidth / mediumdpi).toFixed(
      1
    )}\" X ${parseFloat(mediumheight / mediumdpi).toFixed(1)}\"`;
    var mediumdetails = {
      width: mediumwidth,
      height: mediumheight,
      dpi: mediumdpi,
      inch: mediuminch,
      type: "medium",
      price: imagePrice.medium || defaultPrice().medium,
      ischecked: false
    };

    var smallwidth = parseInt(mediumwidth / 2);
    var smallheight = parseInt(mediumheight / 2);
    var smalldpi = 72;
    var smallinch = `${parseFloat(smallwidth / smalldpi).toFixed(
      1
    )}\" X ${parseFloat(smallheight / smalldpi).toFixed(1)}\"`;
    var smalldetails = {
      width: smallwidth,
      height: smallheight,
      dpi: smalldpi,
      inch: smallinch,
      type: "small",
      price: imagePrice.small || defaultPrice().small,
      ischecked: false
    };
    imagedetails.push(smalldetails);
    imagedetails.push(mediumdetails);
    imagedetails.push(largedetails);
  } else if (
    (imagewidth >= 1024 && imagewidth < 1600) ||
    (imageheight >= 768 && imageheight < 1200) ||
    (imageheight >= 1024 && imageheight < 1600) ||
    (imagewidth >= 768 && imagewidth < 1200)
  ) {
    mediumwidth = parseInt(imagewidth);
    mediumheight = parseInt(imageheight);
    mediumdpi = 300;
    mediuminch = `${parseFloat(mediumwidth / mediumdpi).toFixed(
      1
    )}\" X ${parseFloat(mediumheight / mediumdpi).toFixed(1)}\"`;
    mediumdetails = {
      width: mediumwidth,
      height: mediumheight,
      dpi: mediumdpi,
      inch: mediuminch,
      type: "medium",
      price: imagePrice.medium || defaultPrice().medium,
      ischecked: true
    };
    replaceimagedetails = mediumdetails;

    smallwidth = parseInt(mediumwidth / 2);
    smallheight = parseInt(mediumheight / 2);
    smalldpi = 72;
    smallinch = `${parseFloat(smallwidth / smalldpi).toFixed(
      1
    )}\" X ${parseFloat(smallheight / smalldpi).toFixed(1)}\"`;
    smalldetails = {
      width: smallwidth,
      height: smallheight,
      dpi: smalldpi,
      inch: smallinch,
      type: "small",
      price: imagePrice.small || defaultPrice().small,
      ischecked: false
    };
    imagedetails.push(smalldetails);
    imagedetails.push(mediumdetails);
  } else {
    smallwidth = parseInt(imagewidth);
    smallheight = parseInt(imageheight);
    smalldpi = 72;
    smallinch = `${parseFloat(smallwidth / smalldpi).toFixed(
      1
    )}\" X ${parseFloat(smallheight / smalldpi).toFixed(1)}\"`;
    smalldetails = {
      width: smallwidth,
      height: smallheight,
      dpi: smalldpi,
      inch: smallinch,
      type: "small",
      price: imagePrice.small || defaultPrice().small,
      ischecked: true
    };
    replaceimagedetails = smalldetails;
    imagedetails.push(smalldetails);
  }
  return { imagedetails, replaceimagedetails };
}

export const getLikeImage = (albumId, imageId) => dispatch => {
  if (!albumId || !imageId) {
    throw new Error("albumId and imageId are required");
  }
  return request()
    .get(`/gallery/getlikesall/${albumId}/${imageId}`)
    .then(response => {
      dispatch({
        payload: response.data,
        type: types.GET_LIKE_IMAGE
      });
    })
    .catch(error => {});
};

export const postLikeImage = (albumId, imageId) => dispatch => {
  if (!albumId || !imageId) {
    throw new Error("albumId and imageId are required");
  }
  return request()
    .post(`/gallery/postlike`, {
      galleryid: albumId,
      imageid: imageId,
      userid: getUserIdOrLocalUserId()
    })
    .then(response => {
      dispatch({
        payload: response.data,
        type: types.POST_LIKE_IMAGE
      });
    })
    .catch(error => {});
};

export const postCart = (
  phoneNumber,
  imageType,
  imagePrice,
  downloadLink,
  width,
  height,
  imageDPI,
  price,
  albumId,
  imageId,
  buyer_id,
  publicId,
  soldout,
  sellonetime,
  userID,
  type
) => dispatch => {
  if (!albumId || !imageId) {
    throw new Error("albumId and imageId are required");
  }
  return request()
    .post(`/gallery/addtocart`, {
      phonenumber: phoneNumber,
      imagetype: imageType,
      imageprice: imagePrice,
      downloadlink: downloadLink,
      imagewidth: width,
      imageheight: height,
      imagedpi: imageDPI,
      price: price,
      galleryid: albumId,
      imageid: imageId,
      buyer_id: buyer_id,
      image_publicid: publicId,
      soldout: soldout,
      sellonetime: sellonetime,
      seller_id: userID,
      type: type
    })
    .then(response => {
      dispatch({
        payload: response.data,
        type: types.POST_CART_SUCCEED
      });
    })
    .catch(error => {});
};

// export const postSeller = (albumId, imageId) => dispatch => {
//   if (!albumId || !imageId) {
//     throw new Error("albumId and imageId are required");
//   }
//   return request()
//     .post(`/gallery/getseller_id`, {
//       galleryid: albumId,
//       imageid: imageId
//     })
//     .then(response => {
//       dispatch({
//         payload: response.data,
//         type: types.POST_SELLER
//       });
//     })
//     .catch(error => {});
// };
