import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Alert } from "reactstrap";
import DatePicker from "react-datepicker";

function CustomDate({ isOpen, toggle, handleCustomRange, isInvalid }) {
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  const handleStart = date => {
    setStartDate(date);
  };
  const handleEnd = date => {
    setEndDate(date);
  };
  return (
    <Modal className="CustomDate" isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Customed Date Range</ModalHeader>
      <ModalBody>
        {isInvalid && <Alert color="danger">Invalid date range</Alert>}
        <form className="navbar-form">
          <div className="form-group">
            <label>From</label>
            <DatePicker
              className="address"
              selected={startDate}
              onChange={date => handleStart(date)}
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div className="form-group">
            <label>To</label>
            <DatePicker
              className="address"
              selected={endDate}
              onChange={date => handleEnd(date)}
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <button
          className="picker-date"
          onClick={() => handleCustomRange(startDate, endDate)}
        >
          GO
        </button>
      </ModalFooter>
    </Modal>
  );
}

export default CustomDate;
