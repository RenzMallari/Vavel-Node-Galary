import React from "react";
import Link from "next/link";
import config from "../../config";

function GridImages({
  dataImages,
  albumId,
  heightImage = "155px",
  isAlbum = false,
  showModal
}) {
  const handleImageError = e => {
    // Hide image if getting error from server
    if (e.target && e.target.parentNode) {
      e.target.parentNode.style.display = "none";
    }
  };

  return (
    <div id="GridImages">
      {dataImages.map(item => {
        const images = (isAlbum ? item.thumbnail : item.images) || {};
        const randomWidth =
          (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random()) * 40;
        return (
          <Link
            key={item.userid + item._id + images._id}
            href={
              isAlbum ? `/albums/[albumId]` : `/pictures/[albumId]/[publicid]`
            }
            as={
              isAlbum
                ? `/albums/${albumId}`
                : `/pictures/${albumId}/${item.publicid}`
            }
          >
            <a
              style={{
                height: heightImage,
                flexBasis: `${200 + randomWidth}px`
              }}
            >
              <img
                src={`${config.ftpFullPath}${config.crop200}${item.publicid}.${item.fileExtension}`}
                alt={item.name}
                onError={handleImageError}
              />
              {isAlbum && (
                <div className="image-title">
                  <p>{item.name}</p>
                </div>
              )}
              <span className="btn-add">
                <div className="btn-collect" onClick={e => showModal(e, item)}>
                  <i className="collect-icon"></i>
                </div>
              </span>
            </a>
          </Link>
        );
      })}
    </div>
  );
}

export default GridImages;
