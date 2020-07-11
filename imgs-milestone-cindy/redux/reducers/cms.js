import * as types from "../constants";

const initialState = {
  pageName: '',
  pageTitle: '',
  pageContent: '',
  error: '',
  loading: false
}

export default function reducer(state = initialState, actions) {
  switch (actions.type) {
    case types.GET_CMS_DATA: 
      return {
        ...state,
        loading: true
      };
    case types.GET_CMS_DATA_SUCCED: {
      const { pagename, pagetitle, pagecontent } = actions.payload;
      return {
        ...state,
        pageName: pagename,
        pageTitle: pagetitle,
        pageContent: pagecontent,
        loading: false
      };
    }
    case types.GET_CMS_DATA_FAIL: {
      return {
        ...state,
        error: actions.payload,
        loading: false
      };
    }
    default:
      return state;
  }
}