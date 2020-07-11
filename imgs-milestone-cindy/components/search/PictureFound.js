import React from "react";
import SearchTitle from "./SearchTitle";
import Pagination from "./Pagination";
import { Loading, GridImages } from "../common";

function PictureFound({
  dataImages,
  page,
  count,
  limit,
  actionGetData,
  keyword,
  loading
}) {
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="search-picture">
          <SearchTitle title="Picture Found" />
          <GridImages dataImages={dataImages} />
          <Pagination
            page={page}
            actionGetData={actionGetData}
            limit={limit}
            count={count}
            keyword={keyword}
          />
        </div>
      )}
    </>
  );
}

export default PictureFound;
