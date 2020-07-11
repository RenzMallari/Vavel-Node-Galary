import React from "react";

import GridSearch from "./GridSearch";
import config from "../../config";
import SearchList from "./SearchList";

function UsersFound({ users }) {
  return (
    <div style={{ marginBottom: "50px" }}>
      <SearchList
        title="Users Found"
        id="users-list"
        idLeft="left-users"
        idRight="right-users"
      >
        {users != null &&
          users
            .slice(0)
            .reverse()
            .map(item => (
              <GridSearch
                key={item._id}
                src={`${config.ftpAvatarPath}${item.profileimage ||
                  "photo-icon.png"}`}
                name={item.fullname}
                shortPath={`/myaccount/${item._id}`}
              />
            ))}
      </SearchList>
    </div>
  );
}

export default UsersFound;
