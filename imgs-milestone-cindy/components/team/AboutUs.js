import React from "react";

function AboutUs({ listAllMembers, contentById }) {
  return (
    <div className="AboutUs about">
      <div className="container-fluid">
        <div className="about-heading">
          <h2 className="about-heading-title">{contentById.data.title}</h2>
          <p className="about-heading-subtitle">{contentById.data.subtitle}</p>
        </div>
      </div>
      <div className="container">
        <div className="row" style={{ marginBottom: "30px" }}>
          <div className="about-text">
            <p
              dangerouslySetInnerHTML={{ __html: contentById.data.content }}
            ></p>
            <h5>{contentById.data.contentbelow}</h5>
          </div>
        </div>
        <div className="row">
          {listAllMembers.members.map(item => (
            <div key={item._id} className="cards">
              <img src={item.image} className="cards-img" alt="" />
              <h5 className="cards-name">{item.name}</h5>
              <p className="cards-info small">{item.designation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
