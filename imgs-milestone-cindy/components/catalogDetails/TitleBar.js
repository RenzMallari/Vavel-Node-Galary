import React from "react";
import Link from "next/link";

function TitleBar({ name, count }) {
  return (
    <div className="titlebar">
      <div className="row">
        <div className="titlebar-content">
          <h5 className="titlebar-content-text">
            {name} ~ {count} photos
          </h5>
          <Link href="/albums">
            <a className="titlebar-content-link">
              <i className="right-arrow" />
              Albums
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TitleBar;
