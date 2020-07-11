import React from "react";
import Link from "next/link";
import classnames from "classnames";

import config from "../../config";

function Tag({ tag, url, activeTag, linktag = "" }) {
  return (
    <div className="Tag">
      <Link href={`/${linktag}?tag=${tag}`}>
        <a className={classnames({ active: tag === activeTag })}>
          {url != null && <img src={`${config.ftpFullPath}${url}`} alt="" />}
          <span>{tag}</span>
        </a>
      </Link>
    </div>
  );
}
export default Tag;
