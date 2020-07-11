import React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { parseURL } from "../../utils/helpers";

function Pagination({
  page,
  count,
  limit,
  actionGetData,
  tag,
  year,
  month,
  isPushURL = false,
  URL = "/",
  isDynamicLink,
  route
}) {
  if (isDynamicLink && !route) {
    throw new Error("prop route and isDynamicLink are required");
  }
  const dispatch = useDispatch();
  const router = useRouter();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Because page is started from 0
  const pageCount = parseInt(page || 0) + 1;
  const lastPage = Math.ceil(parseInt(count) / parseInt(limit));

  const handleChange = e => {
    e.preventDefault();
    const { country, time, from, to } = router.query;
    const params = {
      page: 0,
      limit: e.target.value,
      tag,
      year,
      month,
      time,
      from,
      to,
      country
    };
    dispatch(actionGetData(params));
    _updateURL(params);
  };

  const handleNext = () => {
    const { country, time, from, to } = router.query;
    const params = {
      page: parseInt(page) + 1,
      limit,
      tag,
      year,
      month,
      time,
      from,
      to,
      country
    };
    dispatch(actionGetData(params));
    _updateURL(params);
  };

  const handlePrev = () => {
    const { country, time, from, to } = router.query;
    const params = {
      page: parseInt(page) - 1,
      limit,
      tag,
      year,
      month,
      time,
      from,
      to,
      country
    };
    dispatch(actionGetData(params));
    _updateURL(params);
  };

  const _updateURL = params => {
    if (!isPushURL) {
      return;
    }

    let href = parseURL(params, URL);
    const as = href;

    if (isDynamicLink) {
      href = parseURL(params, route);
    }
    router.push(href, as, { shallow: true });
  };

  return (
    <div className="Pagination">
      <div className="pagination__buttons">
        {pageCount !== 1 && (
          <button onClick={handlePrev}>
            <span>‹</span>prev
          </button>
        )}
        {pageCount !== lastPage && (
          <button className="next" onClick={handleNext}>
            next<span>›</span>
          </button>
        )}
      </div>
      <div className="pagination__options">
        Pages {pageCount} of {lastPage} Per page:{" "}
        <select onChange={handleChange} value={limit}>
          <option value="30">30</option>
          <option value="50">50</option>
          <option value="70">70</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
  );
}

export default Pagination;
