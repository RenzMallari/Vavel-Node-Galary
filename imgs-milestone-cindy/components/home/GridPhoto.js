import React from "react";
import classnames from "classnames";
import Link from "next/link";

import config from "../../config";
import { printMonth } from "../../utils/helpers";

function GridPhoto({ dataPhotos, actionFilterData, tag, year, month }) {
  return (
    <div className="HomeGridPhotos list-dates">
      {dataPhotos.map((item, index) => (
        <div
          key={index}
          className={classnames("date-item", {
            active:
              item.year === parseInt(year) && item.month === parseInt(month)
          })}
        >
          <Link href={`/?tag=${tag}&year=${item.year}&month=${item.month}`}>
            <a onClick={actionFilterData}>
              <img
                src={`${config.ftpFullPath}${config.crop200}${item.publicid}.${item.fileExtension}`}
                alt="ims"
              />
              <span className="month-name">
                {printMonth(item.month)} {item.year}
              </span>
            </a>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default GridPhoto;
