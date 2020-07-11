import React from "react";

import config from "../../config";

function TagBar({ name, count, logo, logoReplacement }) {
  return (
    <div className="tagbar">
      <div className="tagbar-avatar">
        <img
          className="tagbar-avatar-image"
          src={`${config.ftpFullPath}${config.crop200}${logo ||
            logoReplacement}`}
          alt=""
        />
      </div>
      <div className="tagbar-name">
        <div className="tagbar-name-text">{name}</div>
        <div className="count-photos">{count} photos</div>
      </div>
      <div className="tagbar-image-word">Images</div>
    </div>
  );
}

export default TagBar;
