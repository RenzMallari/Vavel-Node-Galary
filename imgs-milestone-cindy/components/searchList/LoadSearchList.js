import React from "react";
import Link from "next/link";
import config from "../../config";

function LoadSearchList({ listTitle, data, shortPath, imgPath }) {
  return (
    <div className="load-search-list">
      <h3 className="load-search-list-title">{listTitle}</h3>
      {data.length &&
        data.map((item, index) => {
          let href = `/${shortPath}${item.id}`;
          let as = href;
          if (shortPath.includes("albums")) {
            href = "/albums/[albumId]";
          }
          const linkProps = { href, as };
          return (
            <div key={index} className="load-search-item">
              <Link {...linkProps}>
                <a>
                  <h3 className="load-search-item-title">{item.name}</h3>
                  {item.image && (
                    <img
                      src={`${config.ftpPath}${imgPath}/${item.image}`}
                      alt="BIG3"
                    />
                  )}
                </a>
              </Link>
            </div>
          );
        })}
    </div>
  );
}

export default LoadSearchList;
