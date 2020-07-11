import React from "react";
import GridPhoto from "./GridPhoto";

function TimeLine({
  dataPhotos,
  actionFilterData,
  tag,
  year,
  month,
  url,
  route,
  isDynamicLink
}) {
  return (
    <div id="CommonTimeLine" className="dates-wrapper">
      <GridPhoto
        dataPhotos={dataPhotos}
        actionFilterData={actionFilterData}
        tag={tag}
        year={year}
        month={month}
        url={url}
        route={route}
        isDynamicLink={isDynamicLink}
      />
      <div className="paddle">
        <button className="right-paddle"> > </button>
      </div>
    </div>
  );
}

export default TimeLine;
