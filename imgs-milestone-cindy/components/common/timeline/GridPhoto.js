import React from "react";
import classnames from "classnames";
import Link from "next/link";

import config from "../../../config";
import { printMonth, parseURL } from "../../../utils/helpers";

function GridPhoto({
  dataPhotos,
  actionFilterData,
  tag,
  year,
  month,
  url = "/",
  route,
  isDynamicLink
}) {
  if (isDynamicLink && !route) {
    throw new Error("prop route and isDynamicLink are required");
  }
  return (
    <div id="CommonListDates" className="list-dates">
      {dataPhotos.map((item, index) => {
        let linkProps = {};
        if (isDynamicLink) {
          linkProps = {
            href: parseURL({ tag, year: item.year, month: item.month }, route),
            as: parseURL({ tag, year: item.year, month: item.month }, url)
          };
        } else {
          linkProps = {
            href: parseURL({ tag, year: item.year, month: item.month }, url)
          };
        }
        return (
          <div
            key={index}
            className={classnames("date-item", {
              active:
                item.year === parseInt(year) && item.month === parseInt(month)
            })}
          >
            <Link {...linkProps}>
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
        );
      })}
    </div>
  );
}

export default GridPhoto;
