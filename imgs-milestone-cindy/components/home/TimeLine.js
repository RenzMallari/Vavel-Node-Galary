import React from "react";

import GridPhoto from "../home/GridPhoto";

function TimeLine({ dataPhotos, actionFilterData, tag, year, month }) {
  return (
    <div className="TimeLine">
      <GridPhoto
        dataPhotos={dataPhotos}
        actionFilterData={actionFilterData}
        tag={tag}
        year={year}
        month={month}
      />
      <div className="paddle">
        <button className="right-paddle"> > </button>
      </div>
    </div>
  );
}

export default TimeLine;
