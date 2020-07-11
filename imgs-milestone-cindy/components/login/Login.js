import React, { useReducer } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  ModalFooter,
  Alert
} from "reactstrap";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { useRouter } from "next/router";
import config from "../../config";
import * as types from "../../redux/constants";
import { login, loginFb } from "../../auth";
import { openModal, closeModal } from "../../redux/actions/modal";
import { openMessage } from "../../redux/actions/message";

const Login = () => {
  const dispatch = useDispatch();
  const [state, setState] = useReducer(
    (prestate, newState) => ({ ...prestate, ...newState }),
    {
      email: "",
      password: "",
      errMsg: ""
    }
  );

  const status = useSelector(state => state.modal.signUp);
  const { email, password, errMsg } = state;
  const router = useRouter();

  const handleOnSubmit = e => {
    e.preventDefault();
    login(
      state,
      () => {
        dispatch(closeModal(types.CLOSE_MODAL_SIGN_UP));
        dispatch(
          openMessage({
            content: "You have successfully logged in!",
            type: "success"
          })
        );
        router.push(router.pathname, router.asPath, { shallow: true });
      },
      () => {
        setState({ errMsg: "Invalid email/password !" });
      }
    );
  };

  const handleLoginFB = resp => {
    if (resp.accessToken) {
      loginFb(
        resp,
        () => {
          dispatch(
            openMessage({
              content: "You have successfully logged in!",
              type: "success"
            })
          );
          router.push("/");
        },
        () => {
          dispatch(
            openMessage({
              content: "Invalid facebook login !",
              type: "danger"
            })
          );
        }
      );
    }
  };

  const handleOnChangeInput = e =>
    setState({ [e.target.name]: e.target.value, errMsg: "" });

  const redirectSignUp = () => {
    router.push("/register");
    dispatch(closeModal(types.CLOSE_MODAL_SIGN_UP));
  };

  return (
    <Modal
      className="ModalLogin"
      isOpen={status}
      toggle={() => dispatch(closeModal(types.CLOSE_MODAL_SIGN_UP))}
    >
      <ModalHeader
        toggle={() => dispatch(closeModal(types.CLOSE_MODAL_SIGN_UP))}
      >
        Sign In
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={e => handleOnSubmit(e)}>
          {errMsg && <Alert color="danger">{errMsg}</Alert>}
          <Row>
            <Col>
              <FormGroup>
                <Input
                  type="text"
                  placeholder="Email Address"
                  value={email}
                  name="email"
                  onChange={e => handleOnChangeInput(e)}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormGroup>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  name="password"
                  onChange={e => handleOnChangeInput(e)}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button color="primary" block type="submit">
                Sign in
              </Button>
              <p className="pull-right ">
                <span
                  aria-hidden
                  onClick={() =>
                    dispatch(openModal(types.OPEN_MODAL_FORGET_PASWWORD))
                  }
                >
                  Forgot Your Password?
                </span>
              </p>
            </Col>
          </Row>
        </Form>
        <Row>
          <Col className="social-auth">
            <hr />
            <p className="small">or</p>
            <FacebookLogin
              appId={config.appIdFB}
              fields="first_name,last_name, middle_name,id"
              onClick={() => dispatch(closeModal(types.CLOSE_MODAL_SIGN_UP))}
              callback={resp => handleLoginFB(resp)}
              render={renderProps => (
                <Button color="primary" block onClick={renderProps.onClick}>
                  <i className="fb-icon"></i>
                  Sign in with Facebook
                </Button>
              )}
            />
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <p>
          Don't have an account?{" "}
          <span aria-hidden onClick={() => redirectSignUp()}>
            Join
          </span>
        </p>
      </ModalFooter>
    </Modal>
  );
};

export default Login;
