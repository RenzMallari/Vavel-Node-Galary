import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import {
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";
import { openModal, closeModal } from "../../redux/actions/modal";
import * as types from "../../redux/constants";
import { forgotPassword } from "../../auth";

const WrapperModal = styled(Modal)`
  .modal-content {
    border-radius: 30px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.2);
    background-clip: padding-box;
  }
  .modal-title {
    font-family: Ubuntu, "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 27px;
    line-height: 1.428571429;
    font-weight: 700;
    color: #333;
    margin: 0 auto;
  }
  .row {
    margin-bottom: 15px;
    p {
      color: #41494f;
    }
    .btn-primary {
      color: #fff;
      background-color: #0089d0;
      border-color: #0078b6;
      transition: 0.5s;
      font-family: sans-serif;
      letter-spacing: 3px;
      padding: 22px 25px;
      line-height: 11px;
      font-weight: 700;
      border-radius: 3px;
      &:hover {
        background-color: #009aea;
        border-color: #0089d0;
      }
    }
    .form-group {
      .form-control {
        font-family: Ubuntu, Open Sans, Arial;
        font-weight: 300;
        font-size: 18px;
        line-height: 24px;
        color: #41494f;
        padding: 7px 7px 7px 20px;
        height: 56px;
        border: 1px solid #ccc;
        border-radius: 20px;
      }
    }
  }
  && {
    @media (min-width: 768px) {
      max-width: 600px;
      margin: 100px auto 30px;
    }
  }
  .modal-footer {
    background-color: #f5f5f6;
    justify-content: center;
    border-radius: 0 0 30px 30px;
    p {
      font-family: Open Sans, Ubuntu, "Helvetica Neue", Helvetica, Arial,
        sans-serif;
      font-size: 16px;
      color: #41494f;
      span {
        color: #0089d0;
        transition: opacity 0.15s ease-in-out;
        cursor: pointer;
      }
    }
  }
`;
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const status = useSelector(state => state.modal.forgotPassword);
  const dispatch = useDispatch();

  const handleOnSubmit = e => {
    e.preventDefault();
    forgotPassword(email);
  };

  return (
    <WrapperModal
      isOpen={status}
      toggle={() => dispatch(closeModal(types.CLOSE_MODAL_FORGET_PASWWORD))}
    >
      <ModalHeader
        toggle={() => dispatch(closeModal(types.CLOSE_MODAL_FORGET_PASWWORD))}
      >
        Forgot your password?
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={e => handleOnSubmit(e)}>
          <Row>
            <Col>
              <FormGroup>
                <Input
                  type="text"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button color="primary" block type="submit">
                Submit Request
              </Button>
            </Col>
          </Row>
        </Form>
      </ModalBody>
      <ModalFooter>
        <p>
          Back to login{" "}
          <span
            aria-hidden
            onClick={() => dispatch(openModal(types.OPEN_MODAL_SIGN_UP))}
          >
            Login
          </span>
        </p>
      </ModalFooter>
    </WrapperModal>
  );
};

export default ForgotPassword;
