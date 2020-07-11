import React, { useEffect, useReducer } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, Form, FormGroup, Input, Modal } from "reactstrap";
import ReCAPTCHA from "react-google-recaptcha";
import btDropin from "braintree-web-drop-in";
import _ from "lodash";
import { list_countries } from "../../utils/constants";
import { isLoggedIn, getUserInfo } from "../../auth";
import {
  getClientTokenBrainTree,
  checkoutBrainTree
} from "../../redux/actions/payment";
import config from "../../config";
import { signUp } from "../../redux/actions/signup";
import { PriceConvert } from "../../components/common";

function CheckoutModal({ handleClose, externalAmount }) {
  const isAuthed = isLoggedIn();
  const userInfo = getUserInfo();
  const localUser = JSON.parse(window.localStorage.getItem("localUser")) || {};
  const dispatch = useDispatch();

  const clientToken = useSelector(store => store.payment.clientToken);
  const cartList = useSelector(store => store.cartList.data);
  const defaultCurrency = useSelector(store => store.price.base);

  const [state, setState] = useReducer(
    (preState, newState) => ({ ...preState, ...newState }),
    {
      firstName: "",
      lastName: "",
      country: "",
      email: "",
      password: "",
      gReCaptchaResponse: null,
      errorMessage: null,
      readyForPay: false
    }
  );

  const {
    firstName,
    lastName,
    country,
    email,
    password,
    errorMessage,
    gReCaptchaResponse,
    readyForPay
  } = state;

  useEffect(() => {
    dispatch(getClientTokenBrainTree());
  }, []);

  useEffect(() => {
    if (btDropin) {
      btDropin.create(
        {
          authorization: clientToken,
          container: "#bt-dropin",
          paypal: {
            flow: "vault"
          }
        },
        function(createErr, instance) {
          // console.log(createErr, instance);
          if (!window.btInstance) {
            window.btInstance = instance;
          }
          setState({ readyForPay: true });
        }
      );
    }
  }, [clientToken]);

  const handleSubmit = e => {
    e.preventDefault();
    const totalAmount = getTotalFromCartList();
    if (!isAuthed) {
      if (!gReCaptchaResponse) {
        setState({ errorMessage: "Please fill captcha to sign up" });
        return;
      }
      dispatch(
        signUp(
          { ...state, "g-recaptcha-response": gReCaptchaResponse },
          res => {
            createTransaction(
              totalAmount,
              _.get(res, "msg._id", ""),
              localUser._id
            ).then(
              res => {
                setTimeout(function() {
                  window.location.assign(`${config.SUB_HOST}/downloads`);
                }, 1000);
              },
              err => {
                setState({
                  errorMessage: err.message || "Something went wrong"
                });
              }
            );
          },
          err => {
            setState({ errorMessage: err });
          }
        )
      );
    } else {
      createTransaction(totalAmount, userInfo._id).then(
        res => {
          setTimeout(function() {
            window.location.assign(`${config.SUB_HOST}/downloads`);
          }, 1000);
        },
        err => {
          setState({ errorMessage: err.message || "Something went wrong" });
        }
      );
    }
  };

  const handleOnChangeInput = e =>
    setState({ [e.target.name]: e.target.value });

  const createTransaction = (amount, customerId, localId, meta) => {
    const data = meta || {};

    return new Promise((resolve, reject) => {
      if (!data.soldout) {
        window.btInstance.requestPaymentMethod(function(err, res) {
          if (err) {
            reject(err);
            return;
          }
          checkoutBrainTree({
            amount,
            payment_method_nonce: res.nonce,
            local_id: localId,
            user_id: customerId,
            type: data.type,
            albumid: data.albumid
          })
            .then(res => resolve(res))
            .catch(err => reject(err || {}));
        });
      } else {
        reject({
          type: "error",
          msg: "Sold out"
        });
      }
    });
  };

  const getTotalFromCartList = () => {
    if (externalAmount) {
      return externalAmount;
    }
    return _.sumBy(cartList, o => Number(o.price));
  };

  return (
    <Modal className="CheckoutModal" isOpen toggle={handleClose}>
      <div className="modal-header">
        <Button className="close" type="button" onClick={() => handleClose()}>
          <span>×</span>
        </Button>
        <a href="#" className="logo-top">
          <img src="/static/images/logo-modal.png" className="img-responsive" />
        </a>
      </div>
      <div className="modal-body">
        <div className="checkout-form">
          <Form className="form-price">
            {!isAuthed && (
              <>
                <FormGroup className="form-group">
                  <Input
                    type="text"
                    className="form-input"
                    placeholder="First Name"
                    required
                    value={firstName}
                    name="firstName"
                    onChange={e => handleOnChangeInput(e)}
                  />
                </FormGroup>
                <FormGroup className="form-group">
                  <Input
                    type="text"
                    className="form-input"
                    placeholder="Last Name"
                    required
                    value={lastName}
                    name="lastName"
                    onChange={e => handleOnChangeInput(e)}
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    type="select"
                    required
                    value={country}
                    name="country"
                    onChange={e => handleOnChangeInput(e)}
                  >
                    <option value="">Please, select your country</option>
                    {list_countries.map(ele => (
                      <option key={ele.name} value={ele.name}>
                        {ele.name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
                <FormGroup className="form-group">
                  <Input
                    type="text"
                    className="form-input"
                    value={email}
                    name="email"
                    placeholder="Email address for login"
                    onChange={e => handleOnChangeInput(e)}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    type="password"
                    required
                    placeholder="Create Password"
                    value={password}
                    name="password"
                    onChange={e => handleOnChangeInput(e)}
                  />
                </FormGroup>
              </>
            )}
            <div id="bt-wrap">
              <div id="bt-dropin"></div>
            </div>
            <div className="form-group ember-view">
              {!isAuthed && (
                <ReCAPTCHA
                  sitekey={config.ReCaptchaKey}
                  onChange={value =>
                    setState({
                      errorMessage: null,
                      gReCaptchaResponse: value
                    })
                  }
                />
              )}
              {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
              <Button
                disabled={!readyForPay}
                onClick={handleSubmit}
                className="btn modal-button"
              >
                <div className="btn-loading-text">
                  Pay Now (
                  <span className="">
                    <PriceConvert
                      amoutDefault={getTotalFromCartList()}
                      to={defaultCurrency}
                      from={_.get(cartList, "[0].currency", "USD")}
                    />
                  </span>
                  )
                </div>
              </Button>
            </div>
          </Form>
        </div>
      </div>
      <div className="modal-footer">
        {!isAuthed && (
          <p>
            <a href="#">Have an account? Login</a>
          </p>
        )}
        <p>
          <a href="mailto:admin@vavel.com">admin@vavel.com</a>
        </p>
      </div>
    </Modal>
  );
}

export default CheckoutModal;
