import React from "react";
import SearchTitle from "./SearchTitle";
import Paddle from "../common/Paddle";

function SearchList({ title, id, idLeft, idRight, children }) {
  return (
    <div>
      <div className="search search-container">
        <SearchTitle title={title} />
        <div id={id} className="search-list">
          {children}
        </div>
        <Paddle id={id} idLeft={idLeft} idRight={idRight} />
      </div>
    </div>
  );
}

export default SearchList;
