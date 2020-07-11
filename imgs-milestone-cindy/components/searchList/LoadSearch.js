import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import LoadSearchList from "./LoadSearchList";

const StyledLoadSearch = styled.div`
  display: ${({ open }) => (open ? "block" : "none")};
`;

function LoadSearch({ open, onClose }) {
  const storeAlbumLoad = useSelector(store => store.searchList.albums);
  const storeCatalogLoad = useSelector(store => store.searchList.catalogs);
  const storeUsersLoad = useSelector(store => store.searchList.users);
  const storeCollectionsLoad = useSelector(
    store => store.searchList.collections
  );

  const storeLoad = [
    {
      listTitle: "keyword",
      data: storeCatalogLoad.data,
      shortPath: "?tag=",
      imgPath: "bunch"
    },
    {
      listTitle: "albums",
      data: storeAlbumLoad.data,
      shortPath: "albums/",
      imgPath: null
    },
    {
      listTitle: "users",
      data: storeUsersLoad,
      shortPath: "myaccount/",
      imgPath: "avatar"
    },
    {
      listTitle: "collections",
      data: storeCollectionsLoad.data,
      shortPath: "albums/",
      imgPath: null
    }
  ];

  const check = [
    ...storeCatalogLoad.data,
    ...storeAlbumLoad.data,
    ...storeUsersLoad.data,
    ...storeCollectionsLoad.data
  ];

  return (
    <>
      {check.length > 0 && (
        <StyledLoadSearch id="load-search" className="load-search" open={open}>
          <div className="exit" onClick={onClose}>
            ×
          </div>
          {storeLoad.map((item, index) => {
            return (
              item.data.length > 0 && (
                <LoadSearchList
                  key={index}
                  listTitle={item.listTitle}
                  data={item.data}
                  shortPath={item.shortPath}
                  imgPath={item.imgPath}
                />
              )
            );
          })}
        </StyledLoadSearch>
      )}
    </>
  );
}

export default LoadSearch;
