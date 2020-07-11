import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunkMiddleware from "redux-thunk";
import rootReducer from "./redux/reducers/index";
// import { initialStateCounter } from "./redux/reducers/counter";

// const initialState = {
//   counter: initialStateCounter
// };

export function initializeStore(preloadedState) {
  return createStore(
    rootReducer,
    preloadedState,
    composeWithDevTools(applyMiddleware(thunkMiddleware))
  );
}
