import React from "react";
import { GridImages, Loading, Pagination } from "../common";

function Banner({
  data,
  loading,
  page,
  count,
  limit,
  actionGetData,
  tag,
  year,
  month,
  isAlbum = false,
  isPushURL = false,
  URL,
  isDynamicLink,
  route
}) {
  return (
    <section className="Banner">
      {loading ? (
        <div className="loading">
          <Loading />
        </div>
      ) : (
        <>
          <GridImages isAlbum={isAlbum} dataImages={data} />
          <Pagination
            page={page}
            count={count}
            limit={limit}
            actionGetData={actionGetData}
            tag={tag}
            year={year}
            month={month}
            isPushURL={isPushURL}
            URL={URL}
            isDynamicLink={isDynamicLink}
            route={route}
          />
        </>
      )}
    </section>
  );
}

export default Banner;
