import { createSlice } from "@reduxjs/toolkit";

const defaultState = {
  newBookOLKey: null,
};

const userBookSlice = createSlice({
  name: "userBook",
  initialState: defaultState,
  reducers: {
    setFetchBooks: (userBookState, action) => {
      userBookState.newBookOLKey = action.payload;
    },
    flushUserBooks: (userBookState, action) => {
      return defaultState;
    },
  },
});

export const selectFetchBooks = (state) => state.userBook.newBookOLKey;

export const { setFetchBooks, flushUserBooks } = userBookSlice.actions;

export default userBookSlice.reducer;
