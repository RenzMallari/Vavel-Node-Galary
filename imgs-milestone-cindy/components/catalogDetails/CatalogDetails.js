import React from "react";

import GridImagesCatalog from "./GridImagesCatalog";
import { Loading } from "../common";

function CatalogDetails({ msg, loading, showModal, showImageDetails }) {
  return (
    <div id="CatalogDetails">
      {loading ? (
        <div className="loading">
          <Loading />
        </div>
      ) : (
        <GridImagesCatalog
          dataImages={msg}
          showModal={showModal}
          showImageDetails={showImageDetails}
        />
      )}
    </div>
  );
}

export default CatalogDetails;
