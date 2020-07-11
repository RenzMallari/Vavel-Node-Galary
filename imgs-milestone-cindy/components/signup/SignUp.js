import React, { useReducer } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Input,
  Alert
} from "reactstrap";
import ReCAPTCHA from "react-google-recaptcha";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import config from "../../config";
import { list_countries } from "../../utils/constants";
import { openModal } from "../../redux/actions/modal";
import * as types from "../../redux/constants";

const TheDeal = "/static/images/the-deal.png";
const BusinessModel = "/static/images/business-model.png";

const SignUp = ({ data, onSubmit, onLoginFb }) => {
  const [state, setState] = useReducer(
    (prestate, newState) => ({ ...prestate, ...newState }),
    {
      firstname: "",
      lastname: "",
      country: "",
      paypalemail: "",
      email: "",
      password: "",
      "g-recaptcha-response": null,
      errReCapcha: null
    }
  );

  const {
    firstname,
    lastname,
    country,
    paypalemail,
    email,
    password,
    errReCapcha
  } = state;

  const handleSubmit = e => {
    e.preventDefault();
    if (!state["g-recaptcha-response"]) {
      setState({ errReCapcha: "Please fill captcha to sign up" });
      return;
    }
    onSubmit(state);
  };
  const handleOnChangeInput = e =>
    setState({ [e.target.name]: e.target.value });

  const handleLoginFB = resp => {
    if (resp.accessToken) {
      onLoginFb(resp);
    }
  };

  return (
    <div className="SignUpForm">
      <div className="container-fluid">
        <h1>SELL YOUR PHOTOS</h1>
        <p
          className="pannel-head"
          dangerouslySetInnerHTML={{ __html: data.subtitle }}
        />
        <div className="bm-desktop">
          <img alt="logo" src={TheDeal} width="100%" />
        </div>
        <div className="bm-mobile">
          <img alt="logo" src={BusinessModel} width="100%" />
        </div>
      </div>
      <Container className="SignUpInner">
        <div className="errors"></div>
        <Row>
          <Col md="7">
            <Form onSubmit={e => handleSubmit(e)}>
              <Row>
                <Col md="6">
                  <FormGroup>
                    <Input
                      type="text"
                      required
                      placeholder="First Name"
                      value={firstname}
                      name="firstname"
                      onChange={e => handleOnChangeInput(e)}
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Input
                      type="text"
                      required
                      placeholder="Last Name"
                      value={lastname}
                      name="lastname"
                      onChange={e => handleOnChangeInput(e)}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="6">
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
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Input
                      type="text"
                      placeholder="Paypal email (optional)"
                      value={paypalemail}
                      onChange={e =>
                        setState({
                          errReCapcha: null,
                          paypalemail: e.target.value
                        })
                      }
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup>
                    <Input
                      type="email"
                      required
                      placeholder="Email address for login"
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
                      required
                      placeholder="Create Password"
                      value={password}
                      name="password"
                      onChange={e => handleOnChangeInput(e)}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <ReCAPTCHA
                  sitekey={config.ReCaptchaKey}
                  onChange={value =>
                    setState({
                      errReCapcha: null,
                      "g-recaptcha-response": value
                    })
                  }
                />
                {errReCapcha && <Alert color="danger">{errReCapcha}</Alert>}
              </Row>
              <Row>
                <Col>
                  <Button color="primary" block type="submit">
                    Create Account
                  </Button>
                  <p
                    className="xsmall"
                    dangerouslySetInnerHTML={{ __html: data.formbelowcontent }}
                  />
                  <FormGroup>
                    <p className="pull-left">
                      Already Joined?{" "}
                      <span
                        aria-hidden
                        onClick={() => openModal(types.OPEN_MODAL_SIGN_UP)}
                      >
                        Sign In
                      </span>
                    </p>
                  </FormGroup>
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
          </Col>
          <Col md="4">
            <h4>{data.righttitle}</h4>
            <div dangerouslySetInnerHTML={{ __html: data.rightcontent }} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SignUp;
