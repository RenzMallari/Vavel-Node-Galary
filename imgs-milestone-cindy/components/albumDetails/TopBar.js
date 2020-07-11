import React from "react";
import Link from "next/link";
import { list_currencies } from "../../utils/constSetting";

import { useSelector, useDispatch } from "react-redux";
import config from "../../config";
import * as types from "../../redux/constants";
import { PriceConvert } from "../common/ConvertPrice";
import { DEFAULT_CURRENCY } from "../../utils/constant";
import { openModal } from "../../redux/actions/modal";

function TopBar(props) {
  const { data, msg, usrdetls } = props;
  const dispatch = useDispatch();
  const price = useSelector(store => store.price.base) || DEFAULT_CURRENCY;
  const isDisplay = price === DEFAULT_CURRENCY ? "none" : "inline-block";

  return (
    <div id="TopBar">
      <div className="col-xs-8 clearfix clr-mobile">
        <Link href={`/myaccount/[accountId]`} as={`/myaccount/${usrdetls._id}`}>
          <a className="ember-view pull-left">
            <img
              alt=""
              src={`${config.ftpAvatarPath}${config.cropt200}${usrdetls.profileimage}`}
            />
          </a>
        </Link>
        <h2 className="title-medium">{data.albumname}</h2>
        <p>
          <Link
            href={`/myaccount/[accountId]`}
            as={`/myaccount/${usrdetls._id}`}
          >
            <a className="ember-view">
              By
              <b> {usrdetls.fullname}</b>
            </a>
          </Link>
        </p>
      </div>
      <div className="col-xs-4 clr-mobile">
        <button
          className="btn-default pull-right btn-album-mobile"
          onClick={() => dispatch(openModal(types.OPEN_MODAL_CHECKOUT))}
        >
          Buy
        </button>
        <h5 className="btn-album-mobile pull-right">
          {price === DEFAULT_CURRENCY ? (
            <span>
              {list_currencies[price].symbol}
              {data.albumprice}
            </span>
          ) : (
            <PriceConvert
              amoutDefault={data.albumprice}
              from={DEFAULT_CURRENCY}
              to={price}
            />
          )}
          <br />
          <span className="content-xs" style={{ display: isDisplay }}>
            ${data.albumprice}
          </span>
          <span className="content-xs"> {msg.length} photos</span>
        </h5>
      </div>
      <hr />
    </div>
  );
}

export default TopBar;
