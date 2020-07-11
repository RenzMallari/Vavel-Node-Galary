import React from "react";
import { Input as ReInput } from "reactstrap";

function Input(props) {
  return <ReInput {...props} classname={`ReInput ${props.className}`} />;
}

export default Input;
