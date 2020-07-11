import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";

import { getDataFooter } from "../../redux/actions/footer";
import { ActiveLink } from "../common";

function Footer() {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(getDataFooter());
  }, []);

  const dataFooter = useSelector(store => store.footer);

  return (
    <footer className="footer">
      <div className="footer-show">
        <div className="footer-base">
          <div className="container">
            <div className="t20-icon"></div>
            <p
              className="footer-wrapper-text"
              dangerouslySetInnerHTML={{ __html: dataFooter.data.copyright }}
            ></p>
          </div>
        </div>
        <div className="footer-list container">
          <ul className="footer-list-small">
            <li className="">
              <Link href="/register">
                <a>
                  <b>Register as photographer</b>
                </a>
              </Link>
            </li>
            <li>
              <ActiveLink activeClassName="--active" href="/corporate/license">
                <a className="dark">License</a>
              </ActiveLink>
            </li>
            <li>
              <ActiveLink activeClassName="--active" href="/team">
                <a className="dark">About us</a>
              </ActiveLink>
            </li>
            <li>
              <ActiveLink activeClassName="--active" href="/contact">
                <a className="dark">Contact us</a>
              </ActiveLink>
            </li>
            <li>
              <ActiveLink activeClassName="--active" href="/corporate/terms">
                <a className="dark">Terms</a>
              </ActiveLink>
            </li>
            <li>
              <ActiveLink activeClassName="--active" href="/corporate/privacy">
                <a className="dark">Privacy</a>
              </ActiveLink>
            </li>
            <li>
              <a href={dataFooter.data.instagram}>
                <i className="icon-ig-footer"></i>
                Instagram
              </a>
            </li>
            <li>
              <a href={dataFooter.data.facebook}>
                <i className="icon-fb-footer"></i> Facebook
              </a>
            </li>
            <li>
              <a href={dataFooter.data.twitter}>
                <i className="icon-tw-footer"></i> Twitter
              </a>
            </li>
            <li></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
