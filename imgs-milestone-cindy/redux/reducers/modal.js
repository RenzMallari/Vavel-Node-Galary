import * as types from '../constants';

const initialState = {
  signUp: false,
  forgotPassword: false,
  saveCollection: false,
  getLicense: false,
  chooseSize: false,
  checkout: false,
  getEmbed: false,
};

export const reducer = (state = initialState, actions) => {
  switch (actions.type) {
    case types.OPEN_MODAL_SIGN_UP:
      return {
        ...initialState,
        signUp: true
      };
    case types.OPEN_MODAL_FORGET_PASWWORD:
      return {
        ...initialState,
        forgotPassword: true
      };
    case types.OPEN_MODAL_SAVE_COLLETION:
      return {
        ...initialState,
        saveCollection: true
      }
    case types.OPEN_MODAL_CHOOSE_SIZE: 
      return {
        ...initialState,
        chooseSize: true
      }
    case types.OPEN_MODAL_GET_LICENSE:
      return {
        ...initialState,
        getLicense: true
      }
    case types.OPEN_MODAL_CHECKOUT:
    return {
      ...initialState,
      checkout: true
    }
    case types.OPEN_MODAL_GET_EMBED:
      return {
        ...initialState,
        getEmbed: true
      }
    case types.CLOSE_MODAL_SIGN_UP:
    case types.CLOSE_MODAL_FORGET_PASWWORD:
    case types.CLOSE_MODAL_SAVE_COLLECTION:
    case types.CLOSE_MODAL_CHOOSE_SIZE:
    case types.CLOSE_MODAL_GET_LICENSE:
    case types.CLOSE_MODAL_CHECKOUT:
    case types.CLOSE_MODAL_GET_EMBED:
      return {
        ...initialState
      };

    default:
      return state;
  }
};

export default reducer;
