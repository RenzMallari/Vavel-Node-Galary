import React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";

function Pagination({ page, count, limit, actionGetData, keyword }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pageCount = page;
  const lastPage = Math.ceil(count / limit);
  const handleChange = e => {
    e.preventDefault();
    dispatch(
      actionGetData({
        page: parseInt(page),
        limit: parseInt(e.target.value),
        keyword
      })
    );
  };
  const handleNext = () => {
    router.push(`/search?keyword=${keyword}&page=${parseInt(page) + 1}`);
  };

  const handlePrev = () => {
    router.push(`/search?keyword=${keyword}&page=${parseInt(page) - 1}`);
  };

  return (
    <div className="SearchPagination">
      <div className="pagination__buttons">
        {parseInt(page) !== 1 && lastPage > 1 && (
          <button onClick={handlePrev}>
            <span>‹</span>prev
          </button>
        )}
        {parseInt(pageCount) !== lastPage && lastPage > 1 && (
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
