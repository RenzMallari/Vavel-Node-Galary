import React from "react";
import config from "../../config";

function GridImagesCatalog({
  dataImages,
  heightImage = "155px",
  showModal,
  showImageDetails
}) {
  const handleImageError = e => {
    // Hide image if getting error from server
    if (e.target && e.target.parentNode) {
      e.target.parentNode.style.display = "none";
    }
  };

  return (
    <div id="GridImagesCatalog">
      {dataImages.map(item => {
        const randomWidth =
          (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random()) * 40;
        const fileExtension = item.fileExtension ? item.fileExtension : "jpg";
        return (
          <div
            key={item._id}
            className="wrapper"
            style={{
              height: heightImage,
              flexBasis: `${200 + randomWidth}px`
            }}
          >
            <img
              src={`${config.ftpFullPath}${config.crop200}${item.imageid}.${fileExtension}`}
              onClick={() => showImageDetails(item.galleryid, item.imageid)}
              alt={item.name}
              onError={handleImageError}
            />
            <span className="btn-add">
              <a
                className="btn-collect"
                href="/#"
                onClick={e => showModal(e, item)}
              >
                <i className="collect-icon"></i>
              </a>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default GridImagesCatalog;
