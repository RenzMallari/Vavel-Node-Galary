import React from "react";
import Link from "next/link";
import config from "../../config";

function GridImages({ dataImages, heightImage = "155px", isAlbum = false }) {
  const handleImageError = e => {
    // Hide image if getting error from server
    if (e.target && e.target.parentNode) {
      e.target.parentNode.style.display = "none";
    }
  };

  return (
    <div className="CommonGridImages">
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
                ? `/albums/${item._id}`
                : `/pictures/${item._id}/${images.publicid}`
            }
          >
            <a
              style={{
                height: heightImage,
                flexBasis: `${200 + randomWidth}px`
              }}
            >
              <img
                src={`${config.ftpFullPath}${config.crop200}${images.publicid}.${images.fileExtension}`}
                alt={item.name}
                onError={handleImageError}
              />
              {isAlbum && (
                <div className="image-title">
                  <p>{item.name}</p>
                </div>
              )}
            </a>
          </Link>
        );
      })}
    </div>
  );
}

export default GridImages;
