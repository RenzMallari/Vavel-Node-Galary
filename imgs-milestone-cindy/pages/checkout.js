import React from "react";
import nextCookie from "next-cookies";
import _ from "lodash";
import { getDataCartList, deleteCartItem } from "../redux/actions/cartList";
import { useSelector, useDispatch } from "react-redux";
import { openModal } from "../redux/actions/modal";
import * as types from "../redux/constants";
import ListTags from "../components/listTags/ListTags";
import { Table, Button } from "reactstrap";
import { getUserIdOrLocalUserId } from "../auth";
import { PriceConvert, CheckoutModal } from "../components/common";
import Link from "next/link";
import { DEFAULT_CURRENCY } from "../utils/constant";
import { selectPrice } from "../redux/actions/price";
import config from "../config";

function getTableData() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    const _id = getUserIdOrLocalUserId();
    dispatch(getDataCartList(_id));
  }, [dispatch]);
  const cartList = useSelector(store => store.cartList.data);

  return cartList;
}

function getDataCartTable() {
  const dispatch = useDispatch();
  const cartList = getTableData();
  const defaultCurrency = useSelector(store => store.price.base);

  const getTotalFromCartList = () => {
    return _.sumBy(cartList, o => Number(o.price));
  };

  if (cartList.length) {
    const tbody = cartList.map((cart, i) => {
      let imageLink = `pictures/${cart.gallery_id}/${cart.image_id}`;

      return (
        <tr key={i}>
          <td>
            <Link href="/pictures/[albumId]/[publicid]" as={imageLink}>
              <a>
                <img
                  className="table-image"
                  src={`${config.ftpFullPath}${config.crop200}${cart.image_id}.${cart.image_extension}`}
                />
              </a>
            </Link>
          </td>
          <td>{cart.seller_name}</td>
          <td>
            <PriceConvert
              amoutDefault={cart.price}
              to={defaultCurrency}
              from={cart.currency}
            />
          </td>
          <td>{cart.type}</td>
          <td>
            <a
              href=""
              onClick={e => {
                e.preventDefault();
                dispatch(deleteCartItem(cart._id, cart.price));
              }}
            >
              Remove
            </a>
          </td>
        </tr>
      );
    });

    return (
      <div className="container-fluid">
        <div className="row">
          <div
            style={{ paddingTop: "15px" }}
            className="challenge-list container"
          >
            <h5
              style={{ margin: "25px 0 4px 0px" }}
              className="caps text-centered strong"
            >
              Your Cart
            </h5>
            <div className="collection-list" style={{ textAlign: "center" }}>
              {false ? <h4>The cart is empty!</h4> : null}
            </div>
            <Table
              id="example"
              className="table table-striped table-bordered"
              striped
              bordered
            >
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Created By</th>
                  <th>Price</th>
                  <th>Image Type</th>
                  <th>Option</th>
                </tr>
              </thead>
              <tbody>
                {tbody}
                <tr>
                  <td>
                    <b>SUM</b>
                  </td>
                  <td></td>
                  <td>
                    <PriceConvert
                      amoutDefault={getTotalFromCartList()}
                      to={defaultCurrency}
                      from={
                        cartList[0] && cartList[0].currency
                          ? cartList[0].currency
                          : DEFAULT_CURRENCY
                      }
                    />
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </Table>
            <Button
              style={{ marginBottom: "23px", float: "right" }}
              className="btn btn-modal-checkout"
              onClick={e => {
                e.preventDefault();
                dispatch(openModal(types.OPEN_MODAL_CHECKOUT));
              }}
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="container-fluid">
        <div className="row">
          <div
            style={{ paddingTop: "15px" }}
            className="challenge-list container"
          >
            <h5
              style={{ margin: "25px 0 4px 0px" }}
              className="caps text-centered strong"
            >
              Your Cart
            </h5>
            <div className="collection-list" style={{ textAlign: "center" }}>
              <h4>The cart is empty!</h4>
            </div>
            <Button
              style={{ marginBottom: "23px", float: "right" }}
              className="btn btn-modal-checkout"
              onClick={e => {
                e.preventDefault();
                dispatch(openModal(types.OPEN_MODAL_CHECKOUT));
              }}
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
function Checkout({ loading, listTags, error, isVisited, currency }) {
  if (error) {
    return <NotFound message={error} />;
  }

  const dispatch = useDispatch();
  const statusCheckout = useSelector(store => store.modal.checkout);

  React.useEffect(() => {
    if (isVisited) {
      dispatch(
        selectPrice({
          base: currency && currency !== "null" ? currency : DEFAULT_CURRENCY
        })
      );
    }
  }, []);

  return (
    <section id="checkoutPage">
      {loading ? (
        <div className="loading">
          <Loading />
        </div>
      ) : (
        <>
          <ListTags listTags={listTags} link="/" />
          {getDataCartTable()}
        </>
      )}
      {statusCheckout && (
        <CheckoutModal
          handleClose={() => dispatch(openModal(types.CLOSE_MODAL_CHECKOUT))}
        />
      )}
    </section>
  );
}

Checkout.getInitialProps = async ({ ...restProps }) => {
  const { currency } = nextCookie(restProps);

  const isVisited = !restProps.req;

  if (!isVisited) {
    await Promise.all([
      restProps.reduxStore.dispatch(
        selectPrice({
          base: currency && currency !== "null" ? currency : DEFAULT_CURRENCY
        })
      )
    ]);
  }

  return { isVisited, currency };
};
export default Checkout;
