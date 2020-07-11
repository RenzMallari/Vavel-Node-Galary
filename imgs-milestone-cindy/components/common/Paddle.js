import React from "react";
import styled from "styled-components";

import { handlePaddle } from "../../utils/helpers";

const StyledPaddle = styled.div`
  .paddle {
    top: ${({ topAbolute }) => (topAbolute ? topAbolute : "50%")};
  }
`;

function Paddle({ id, idLeft, idRight, topAbolute }) {
  return (
    <StyledPaddle className="Paddle" topAbolute={topAbolute}>
      <button
        id={idRight}
        className="right-paddle paddle"
        onClick={() => handlePaddle(id, idRight, idLeft, "right")}
      >
        >
      </button>
      <button
        id={idLeft}
        className="left-paddle paddle hide"
        onClick={() => handlePaddle(id, idRight, idLeft, "left")}
      >
        {`<`}
      </button>
    </StyledPaddle>
  );
}

export default Paddle;
