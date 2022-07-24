import { createSlice } from "@reduxjs/toolkit";
import { flushUserBooks } from "../userBook/userBookSlice";

const defaultState = {
  info: null,
  authPopUp: false,
};

const userSlice = createSlice({
  name: "user",
  initialState: defaultState,
  reducers: {
    newSession: (userState, action) => {
      localStorage.setItem("userProfile", JSON.stringify({ ...action?.payload }));
      userState.info = action?.payload;
    },
    flushUser: (userState, action) => {
      localStorage.removeItem("userProfile");
      return defaultState;
    },
    setAuthPopUp: (userState, action) => {
      userState.authPopUp = action.payload;
    },
    handleUnauthorizedAction: (userState, action) => {
      if (!userState.info) {
        action.payload.push("/browse");
        userState.authPopUp = true;
      }
    },
  },
});

export const selectUser = (state) => state.user.info;
export const selectAuthVisibility = (state) => state.user.authPopUp;

export const { newSession, setAuthPopUp, handleUnauthorizedAction } = userSlice.actions;
export const logOut = () => (dispatch, getState) => {
  dispatch(flushUserBooks());
  dispatch(userSlice.actions.flushUser());
};

export default userSlice.reducer;
