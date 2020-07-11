import React from "react";
import { useDispatch } from "react-redux";

function PaginationLocal({ page, count, limit, actionUpdateParams }) {
  const dispatch = useDispatch();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Because page is started from 0
  const pageCount = page + 1;
  const lastPage = Math.ceil(count / limit);

  const handleChange = e => {
    e.preventDefault();
    dispatch(actionUpdateParams({ page: 0, limit: e.target.value }));
  };

  const handleNext = () => {
    dispatch(actionUpdateParams({ page: page + 1, limit }));
  };

  const handlePrev = () => {
    dispatch(actionUpdateParams({ page: page - 1, limit }));
  };

  return (
    <div className="Pagination">
      <div className="pagination__buttons">
        {page !== 0 && (
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

export default PaginationLocal;
