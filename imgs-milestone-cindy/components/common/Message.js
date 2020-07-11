import React from 'react';
import { useSelector } from 'react-redux';
import { Toast, ToastHeader } from 'reactstrap';
import styled from 'styled-components';
import { isEmpty } from 'lodash';
import { closeMessage } from '../../redux/actions/message';
import { useDispatch } from "react-redux";

const StyledMessage = styled(Toast)`
  && {
    background-color: #fff;
    position: fixed;
    z-index: 999;
    padding: 10px 20px;
    max-width: 500px;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 75px;
    max-width: 500px;
    .toast-header {
      border-bottom: none;
      strong {
        padding: 0 30px 0 0;
      }
    }
  }
`;

export const Message = () => {
  const data = useSelector((state) => state.message);
  const dispatch = useDispatch();
  return isEmpty(data) ? null : (
    <StyledMessage isOpen>
      <ToastHeader
        icon={data.type}
        toggle={() => {
          dispatch(closeMessage());
        }}
      >
        {data.content}
      </ToastHeader>
    </StyledMessage>
  );
};

export default Message;
