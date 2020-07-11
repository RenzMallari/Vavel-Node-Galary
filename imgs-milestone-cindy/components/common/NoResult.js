import React from "react";

function NoResult() {
  return (
    <div className="no-result">
      <div className="no-result-wrapper">
        <div className="no-result-content">
          <h5 className="no-result-content-text">
            Sorry, there are no results. Try another keyword
          </h5>
        </div>
      </div>
    </div>
  );
}

export default NoResult;
