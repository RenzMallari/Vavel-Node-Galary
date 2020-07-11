import React from "react";
import { Modal, Form, FormGroup, Button, Input } from "reactstrap";
import config from "../../config";

function GetEmbedModal({ handleClose, status, data }) {
  const refImgEmbed = React.useRef(null);
  const refInput = React.useRef(null);
  const [embedDom, setEmbedDom] = React.useState("");
  React.useEffect(() => {
    // TODO: fixme wait 1s to get dom for now
    setTimeout(() => {
      setEmbedDom(refImgEmbed.current ? refImgEmbed.current.innerHTML : "");
    }, 1000);
  }, []);

  const handleCopy = e => {
    e.preventDefault();
    const copyText = document.getElementById("copy-embed-form-input");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
  };

  return (
    <Modal className="GetEmbedModal" isOpen={status} toggle={handleClose}>
      <div className="modal-header">
        <button className="close" type="button" onClick={() => handleClose()}>
          <span>×</span>
        </button>
        <h4 className="modal-title">Get Embed</h4>
      </div>
      <div className="modal-body">
        <div ref={refImgEmbed} className="img-embed" id="img-embed">
          <div
            style={{
              backgroundColor: "#fff",
              display: "inline-block",
              fontFamily: "Roboto,sans-serif",
              color: "#a7a7a7",
              fontSize: "12px",
              width: "100%",
              maxWidth: "594px"
            }}
          >
            <div style={{ padding: 0, margin: 0, textAlign: "left" }}>
              <a
                href={`/embed/${data.album._id}/${data.imagepublicid}`}
                target="_blank"
                style={{
                  color: "#a7a7a7",
                  textDecoration: "none",
                  fontWeight: "normal !important",
                  border: "none",
                  display: "inline-block"
                }}
              >
                Embed from Vavel
              </a>
            </div>
            <div
              style={{
                overflow: "hidden",
                position: "relative",
                height: "0",
                padding: "82.667% 0 0 0",
                width: "100%"
              }}
            >
              <iframe
                src={`${config.HOST}/embed/${data.album._id}/${data.imagepublicid}`}
                scrolling="no"
                frameBorder="0"
                width="594px"
                height="396px"
                style={{
                  display: "inline-block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  margin: 0
                }}
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <Form className="copy-embed-form">
          <FormGroup className="copy-embed-form-group">
            <Input
              type="text"
              className="copy-embed-form-input"
              id="copy-embed-form-input"
              defaultValue={embedDom}
            />
            <Button onClick={handleCopy} className="copy-embed-form-button">
              Copy
            </Button>
          </FormGroup>
        </Form>
      </div>
    </Modal>
  );
}

export default GetEmbedModal;
