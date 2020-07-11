import styled from "styled-components";

export const LayoutAlbum = styled.div`
  background-color: #000;
  padding: 15px;
  @media (max-width: 992px) {
    padding: 7px 7px 15px;
  }
  h3 {
    color: #fff;
    font-weight: bold;
    margin-bottom: 30px;
  }
  section {
    padding: 0;
    .pagination__options > select {
      background-color: #fff !important;
    }
  }
`;

export default LayoutAlbum;
