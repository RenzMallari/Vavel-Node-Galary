import React from "react";
import Link from "next/link";

function CartPayment(props) {
  const { cartNumber } = props;
  return (
    <div className="CartPayment">
      <div className="bottom-bar">
        <Link href="/checkout">
          <a style={{ transition: "none" }}>
            <span>Pay now </span>
            <span className="badge">{cartNumber}</span>
          </a>
        </Link>
      </div>
    </div>
  );
}

export default CartPayment;
