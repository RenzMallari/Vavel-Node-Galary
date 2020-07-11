import React from "react";

const imageLoading = "/static/images/loading.gif";

function Loading() {
  return (
    <div className="CommonLoading">
      <img src={imageLoading} alt="Loading" />
    </div>
  );
}

export default Loading;
