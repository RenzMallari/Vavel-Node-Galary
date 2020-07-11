import * as types from "../constants";
import { random } from "../../utils/helpers";

const initialState = {
  images: {},
  details: {
    data: {
      msg: null,
      user: {},
      imagedetails: [],
      replaceimagedetails: {}
    },
    loading: false,
    error: ""
  },
  related: [],
  totalLikes: 0
};

export default function reducer(state = initialState, actions) {
  switch (actions.type) {
    case types.GET_IMAGE_DETAILS:
      return {
        ...state,
        details: {
          ...state.details,
          loading: true,
          error: ""
        }
      };
    case types.GET_IMAGE_DETAILS_SUCCED:
      return {
        ...state,
        details: {
          data: actions.payload,
          loading: false,
          error: ""
        }
      };
    case types.GET_IMAGE_DETAILS_FAIL:
      return {
        ...state,
        details: {
          ...state.details,
          loading: false,
          error: actions.payload
        }
      };
    case types.GET_IMAGE_RELATED_SUCCED: {
      const randomIndexes = random(actions.payload, 18);
      const randomRelated = actions.payload.filter((r, index) => {
        return randomIndexes.includes(`${index}`);
      });
      return {
        ...state,
        related: randomRelated
      };
    }

    case types.GET_IMAGE_RELATED_FAIL:
      return {
        ...state,
        related: initialState.related
      };
    case types.SAVE_GALLERY_IMAGES:
      return {
        ...state,
        images: actions.payload
      };
    case types.GET_LIKE_IMAGE:
      return {
        ...state,
        totalLikes: actions.payload.totallikes || 0
      };
    case types.POST_LIKE_IMAGE:
      return {
        ...state,
        totalLikes: actions.payload.totallikes || 0
      };
    default:
      return state;
  }
}
