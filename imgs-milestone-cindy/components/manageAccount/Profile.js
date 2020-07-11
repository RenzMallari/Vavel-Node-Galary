import React from "react";
import styled from "styled-components";
import config from "../../config";

const ContainerProfile = styled.div`
  background-image: ${props =>
    props.image ? `url(${config.ftpCoverPath}${props.image})` : ""};
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
`;

const Profile = ({ userDetail }) => {
  const { data, albumUser } = userDetail;

  return (
    <>
      <ContainerProfile className="Profile" image={data.coverimage}>
        <div className="blur-div">
          <div className="profile">
            <div className="profile-info">
              <div className="avatar">
                <img
                  alt="avatar"
                  src={`${config.ftpAvatarPath}${data.image}`}
                />
              </div>
              <h3 className="name-profile">
                <h3>{data.fullname}</h3>
                <p>@{data.username}</p>
                <p>{data.bio}</p>
              </h3>
            </div>
            <div className="profile-stats">
              <p>PHOTOS: {albumUser.count}</p>
              <p>IMAGES SOLD: 0</p>
              <p>ALBUMS SOLD: 0</p>
            </div>
          </div>
        </div>
      </ContainerProfile>
    </>
  );
};

export default Profile;
