import * as types from "../constants";

const initialState = {
  data: {
    msg: [],
    msgLocal: [],
    albumname: "",
    albumprice: "",
    usrdetls: [],
    tags: [],
    page: 0,
    limit: 30,
    loading: false,
    error: ""
  }
};

export default function reducer(state = initialState, actions) {
  switch (actions.type) {
    case types.GET_ALBUM_DETAILS:
      return {
        ...state,
        data: {
          ...state.data,
          ...actions.payload,
          msg: initialState.data.msg,
          msgLocal: initialState.data.msgLocal,
          loading: true,
          error: ""
        }
      };
    case types.GET_ALBUM_DETAILS_SUCCED:
      return {
        ...state,
        data: {
          ...state.data,
          ...actions.payload,
          msgLocal: actions.payload.msg.slice(0, 30),
          loading: false,
          error: ""
        }
      };
    case types.GET_ALBUM_DETAILS_FAIL:
      return {
        ...state,
        data: {
          ...state.data,
          loading: false,
          error: actions.payload
        }
      };
    case types.PAGINATE_ALBUM_DETAILS:
      return {
        ...state,
        data: {
          ...state.data,
          loading: true,
          error: ""
        }
      };
    case types.PAGINATE_ALBUM_DETAILS_SUCCED: {
      let newMsgLocal = [];
      const { page, limit } = actions.payload;
      if (page === 0) {
        newMsgLocal = state.data.msg.slice(0, limit);
      } else {
        newMsgLocal = state.data.msg.slice(limit * page, limit * (page + 1));
      }
      return {
        ...state,
        data: {
          ...state.data,
          page,
          limit,
          msgLocal: [...newMsgLocal],
          error: newMsgLocal.length ? "" : "Album is empty",
          loading: false
        }
      };
    }
    default:
      return state;
  }
}
