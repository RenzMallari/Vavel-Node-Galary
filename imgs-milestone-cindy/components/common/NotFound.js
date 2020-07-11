import React from "react";
import Link from "next/link";

function NotFound({ title = "Oops!", message = "404 - PAGE NOT FOUND" }) {
  return (
    <section id="NotFound">
      <h1>{title}</h1>
      <h4>{message}</h4>
      <Link href="/">
        <a className="btn-gohome">GO TO HOMEPAGE</a>
      </Link>
    </section>
  );
}

export default NotFound;
