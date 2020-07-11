import React from "react";
import { Loading } from "../common";

function Terms({ pageTitle, pageContent, loading }) {
  return (
    <>
      {loading ? (
        <div className="loading">
          <Loading />
        </div>
      ) : (
        <div className="cms">
          <div className="cms-body">
            <h3 className="cms-title">{pageTitle}</h3>
            <hr className="light" />
            <div
              className="cms-content"
              dangerouslySetInnerHTML={{ __html: pageContent }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Terms;
