import React from "react";
import Link from "next/link";

import config from "../../config";

function GridSearch({
  publicid,
  fileExtension = "jpg",
  name,
  countImage = null,
  shortPath,
  src
}) {
  return (
    <div className="GridSearch search-item">
      <img
        className="item-image"
        src={
          src ||
          `${config.ftpFullPath}${config.crop200}${publicid}.${fileExtension}`
        }
        alt=""
      />
      <div className="image-title">
        <Link href={shortPath}>
          <a target="blank">
            {countImage != null && (
              <p className="count-image">{countImage} photos</p>
            )}
            <h5>{name}</h5>
          </a>
        </Link>
      </div>
      <div className="overlay" />
    </div>
  );
}

export default GridSearch;
