import * as types from '../constants';

const initialState = {
  listAllMembers: {
    members: [],
    error: ""
  },
  contentById: {
    data: {},
    error: ""
  }
}

export default function reducer(state = initialState, actions) {
  switch(actions.type) {
    case types.GET_TEAM_MEMBERS:
      return {
        ...state,
      };
    case types.GET_TEAM_MEMBERS_SUCCESS:
      return {
        ...state,
        listAllMembers: {
          ...state.listAllMembers,
          members: actions.payload
        }
      };
    case types.GET_TEAM_MEMBERS_FAIL: {
      return {
        ...state,
        listAllMembers: {
          ...state.listAllMembers,
          error: actions.payload
        }
      }
    }
    case types.GET_TEAM_CONTENT: 
      return {
        ...state
      }  
    case types.GET_TEAM_CONTENT_SUCCESS: {
      return {
        ...state,
        contentById: {
          ...state.contentById,
          data: actions.payload
        }
      }
    }
    case types.GET_TEAM_CONTENT_FAIL: {
      return {
        ...state,
        contentById: {
          ...state.contentById,
          error: actions.payload
        }
      }
    }
    default:
      return state;
  }
}