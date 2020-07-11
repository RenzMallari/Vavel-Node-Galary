import * as types from "../constants";
import request from "../../utils/request";

export const getMembersTeam = (params = {}, resolve = () => {}) => dispatch => {
  dispatch({ type: types.GET_TEAM_MEMBERS });
  return request()
    .get("/teams/listallmembers", { params })
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: response.data,
        type: types.GET_TEAM_MEMBERS_SUCCESS
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_TEAM_MEMBERS_FAIL
      });
    });
}

export const getContentTeam = (params = {}, resolve = () => {}) => dispatch => {
  dispatch({type: types.GET_TEAM_CONTENT });
  return request()
    .get("teams/getcontentbyid/1", { params })
    .then(response => {
      resolve(response.data);
      dispatch({
        payload: response.data,
        type: types.GET_TEAM_CONTENT_SUCCESS
      });
    })
    .catch(error => {
      dispatch({
        payload: error,
        type: types.GET_TEAM_CONTENT_FAIL
      });
    });
}