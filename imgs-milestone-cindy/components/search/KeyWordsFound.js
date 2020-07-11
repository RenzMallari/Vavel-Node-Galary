import React from "react";

import GridSearch from "./GridSearch";
import SearchList from "./SearchList";

function KeyWordsFound({ data, loading }) {
  const keywords = Object.keys(data);
  return (
    <div>
      <SearchList
        id="keyword-list"
        title="Keywords Found"
        idLeft="left-keyword"
        idRight="right-keyword"
      >
        {keywords
          .slice(0)
          .reverse()
          .map((item, index) => (
            <GridSearch
              key={index}
              publicid={data[item].slice(0).reverse()[0].imageid}
              name={item}
              countImage={data[item].length}
              shortPath={`/?tag=${item}`}
            />
          ))}
      </SearchList>
    </div>
  );
}

export default KeyWordsFound;
