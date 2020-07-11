import React from "react";
import { Modal } from "reactstrap";

const logoModal = "/static/images/logo-modal.png";

function ImageSize({ id, title, item, checked, onChangeSize }) {
  return (
    <div className="ImageSize">
      <input
        type="radio"
        id={id}
        name="size"
        value={title}
        className="radio-btn-white"
        checked={checked}
        onChange={onChangeSize}
      />
      <label htmlFor={id} style={{ display: "block" }}>
        <div className="caps text-bright fw-700 clearfix">
          <span className="ng-binding">{title}</span>
          <span
            className="pull-right text-right"
            style={{ textTransform: "none" }}
          >
            {false && <div style={{ fontSize: "10px" }}>$10.00</div>}
            <div className="ng-binding">${item.price}</div>
          </span>
        </div>
        <div className="small text-medium ng-binding">
          {item.width} x {item.height} px | {item.inch} @ {item.dpi} dpi
        </div>
      </label>
    </div>
  );
}

function ChooseSizeModal({
  isOpen,
  data,
  handleClicked,
  handleClose,
  handleGetLicense
}) {
  const [state, setState] = React.useState({
    size: ""
  });
  const handleChangeSize = type => () => {
    setState({
      ...state,
      size: type
    });
  };

  return (
    <Modal
      className="ChooseSizeModal"
      isOpen={isOpen}
      toggle={() => handleClose()}
    >
      <div className="modal-header">
        <button className="modal-close" onClick={() => handleClose()}>
          ×
        </button>
        <img className="modal-logo" src={logoModal} alt="" />
        <h5 className="modal-title">Choose Size</h5>
      </div>
      <div className="modal-body">
        <div className="main">
          <div>
            {data.imagedetails.map(item => {
              return (
                <ImageSize
                  key={`image-${item.type}`}
                  id={`image-${item.type}`}
                  title={item.type}
                  item={item}
                  onChangeSize={handleChangeSize(item.type)}
                  checked={state.size === item.type}
                />
              );
            })}
          </div>
          <div className="purchase-con">
            <div onClick={e => handleGetLicense(e)} className="btn-get-license">
              <i className="download-icon-md"></i>
              Get License
            </div>
          </div>
          <div className="photo-actions">
            <a onClick={e => handleClicked(e)} className="btn-collect">
              <i className="collect-icon-reg"></i>Save to Collection
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ChooseSizeModal;
