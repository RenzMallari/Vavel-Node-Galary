import React from "react";

import GridSearch from "./GridSearch";
import SearchList from "./SearchList";

function AlbumFound({ album, loading }) {
  return (
    <div>
      <SearchList
        title="Album Found"
        id="album-list"
        idLeft="left-album"
        idRight="right-album"
      >
        {album
          .slice(0)
          .reverse()
          .map(item => (
            <GridSearch
              key={item.albumid}
              publicid={item.publicid}
              fileExtension={item.fileExtension}
              name={item.name}
              shortPath={`/albums/${item.albumid}`}
            />
          ))}
      </SearchList>
    </div>
  );
}

export default AlbumFound;
