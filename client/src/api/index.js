import axios from "axios";

const API_URL = "https://qualia-library.herokuapp.com";
const API = axios.create({ baseURL: API_URL });

// send user token for use in auth middleware
API.interceptors.request.use((req) => {
  if (localStorage.getItem("userProfile")) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem("userProfile")).token}`;
  }
  return req;
});

export const signUpAPI = (userData) => API.post(`/users/signUp`, userData);
export const logInAPI = (userData) => API.post(`/users/logIn`, userData);

export const getUserBookAPI = (user_id, OL_key) => API.get(`/userBooks/${user_id}/books/${OL_key}`);
export const searchUserBooksAPI = (user_id, searchRequest) => API.get(`/userBooks/${user_id}/search?${searchRequest}`);
export const putUserBookAPI = (user_id, OL_key, userBookData) => API.put(`/userBooks/${user_id}/books/${OL_key}`, userBookData);
export const deleteUserBookAPI = (user_id, OL_key) => API.delete(`/userBooks/${user_id}/books/${OL_key}`);

export const getUserStatsAPI = (user_id) => API.get(`/userStats/${user_id}`);
