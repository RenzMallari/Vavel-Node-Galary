import React, { useMemo, lazy, Suspense } from "react";
import Link from "next/link";
import config from "../../config";
import { Tag, Map } from "../../components/common";
import { random } from "../../utils/helpers";

const verifiedIcon = "/static/images/verified-icon.svg";

function PhotoRelated({ relateds, count }) {
  const elements = useMemo(
    () =>
      relateds.map(related => (
        <Link
          key={related.publicid}
          href={`/pictures/[albumId]/[publicid]`}
          as={`/pictures/${related.albumid}/${related.publicid}`}
        >
          <a className="ember-view">
            <div className="image-related-container">
              <span className="ember-view image-loader">
                <img
                  alt=""
                  style={{ width: "100%", height: "100%" }}
                  width="100%"
                  src={`${config.ftpFullPath}${config.cropt200}${related.publicid}.${related.fileExtension}`}
                />
              </span>
            </div>
          </a>
        </Link>
      )),
    [relateds]
  );
  return (
    <div className="photo-related">
      <h3 className="related-titles">Related photos</h3>
      <div className="list-photo">{elements}</div>
    </div>
  );
}

function Main(props) {
  const { data, relateds, user } = props;
  const [state, setState] = React.useState({
    commerciallicense_icon: ""
  });
  React.useEffect(() => {
    if (data) {
      let commerciallicense_icon = "";
      if (data.commerciallicense === "Yes")
        commerciallicense_icon = "usage-icons ok";
      else commerciallicense_icon = "usage-icons restricted";
      let editoriallicense_icon = "";
      if (data.editoriallicense === "Yes")
        editoriallicense_icon = "usage-icons ok";
      else editoriallicense_icon = "usage-icons restricted";
      let albumaddress_icon = "";
      if (data.albumaddress !== "") albumaddress_icon = "location-icon";
      else albumaddress_icon = "";
      setState({
        commerciallicense_icon,
        editoriallicense_icon,
        albumaddress_icon
      });
    }
  }, [data]);

  return (
    <section id="imageMain">
      {data && (
        <div className="preview-main-container">
          <div className="photo-details clearfix">
            <div className="album-title">
              <span>Album: </span>
              <Link href={`/albums/[albumId]`} as={`/albums/${data.album._id}`}>
                <a className="ng-binding">{data.album.name}</a>
              </Link>
            </div>
            {data.tags && data.tags.length > 0 && (
              <div className="clearfix" ng-show="keywordsshow">
                <div className="meta-group" ng-show="keywordsshow">
                  <div className="keyword-list">
                    <h6 className="title">In this Photo:</h6>
                    {data.tags.map(item => {
                      return <Tag key={item._id} tag={item.tag} />;
                    })}
                  </div>
                </div>
              </div>
            )}

            <PhotoRelated relateds={relateds} count={18} />
          </div>
          <div className="photo-map">
            <div style={{ display: "flex" }}>
              <div style={{ position: "absolute", marginTop: "10px" }}>
                <Link
                  href={`/myaccount/[accountId]`}
                  as={`/myaccount/${user._id}`}
                >
                  <a id="ember1098" className="ember-view">
                    <div id="ember1198" className="ember-view inline-block">
                      <svg height="0" width="0">
                        <clipPath id="hexagonClipLarge">
                          <polygon points="40 0,74 18,74 62,40 80,6 62,6 18"></polygon>
                        </clipPath>
                      </svg>

                      <img
                        alt={`${user.firstname} ${user.lastname}`}
                        className="avatar hexagon-large ng-isolate-scope ng-scope"
                        src={`${config.ftpAvatarPath}${config.crop200}${user.profileimage}`}
                      />
                      <img
                        alt=""
                        src={verifiedIcon}
                        style={{
                          width: "24px",
                          position: "absolute",
                          right: 0,
                          bottom: 0
                        }}
                        className=""
                      />
                    </div>
                  </a>
                </Link>
              </div>
              <div style={{ paddingLeft: "95px", width: "100%" }}>
                <div className="meta-group">
                  <p className="pannel-head" style={{ margin: "30px 0 0px" }}>
                    Photo by
                  </p>
                  <h4 className="username" style={{ marginTop: "0px" }}>
                    <Link
                      href={`/myaccount/[accountId]`}
                      as={`/myaccount/${user._id}`}
                    >
                      <a id="ember1099" className="ember-view">
                        {`@${user.username}`}
                      </a>
                    </Link>
                  </h4>
                </div>
                {data.caption && (
                  <div className="meta-group">
                    <p>{data.caption}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="meta-group" style={{ margin: "30px 0 20px" }}>
              <h6 className="title">Photo Details</h6>
              <hr className="light slim" />
              <div className="row-img">
                <div className="col-md-4 col-sm-12">
                  <p className="small">
                    <i className="license-icon"></i>License:{" "}
                    <Link href="/corporate/license">Photography License</Link>
                  </p>
                  <p className="small">
                    <i className={state.editoriallicense_icon}></i>Editorial
                    License:
                    {data.editoriallicense}
                  </p>
                  <p className="small">
                    <i className={state.commerciallicense_icon}></i>Commercial
                    License:
                    {data.commerciallicense}
                  </p>
                  <p className="small">
                    <i className={state.albumaddress_icon}></i>
                    {data.albumaddress}
                  </p>
                </div>
                <div className="col-md-8 col-sm-12 clearfix">
                  <Map
                    isMarkerShown
                    lat={data.album ? data.album.lat : null}
                    lng={data.album ? data.album.lng : null}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Main;
