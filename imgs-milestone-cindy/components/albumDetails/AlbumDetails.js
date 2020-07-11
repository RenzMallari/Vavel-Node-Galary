import React from "react";
import GridImages from "./GridImages";
import TopBar from "./TopBar";
import { Loading, PaginationLocal, NotFound } from "../common";
import ListTags from "../listTags/ListTags";

function AlbumDetails({
  msg,
  loading,
  showModal,
  showImageDetails,
  page,
  count,
  limit,
  actionUpdateParams,
  data,
  datamsg,
  usrdetls,
  listTags,
  albumId,
  error
}) {
  if (error) {
    return <NotFound message={error} />;
  }

  return (
    <div id="AlbumDetails">
      {loading ? (
        <div className="loading">
          <Loading />
        </div>
      ) : (
        <>
          <ListTags listTags={listTags} link="/" />
          <TopBar data={data} msg={datamsg} usrdetls={usrdetls} />
          <GridImages
            albumId={albumId}
            dataImages={msg}
            showModal={showModal}
            showImageDetails={showImageDetails}
          />
          <PaginationLocal
            page={page}
            count={count}
            limit={limit}
            actionUpdateParams={actionUpdateParams}
          />
        </>
      )}
    </div>
  );
}

export default AlbumDetails;
