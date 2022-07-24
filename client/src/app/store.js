import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import userBookReducer from "../features/userBook/userBookSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    userBook: userBookReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["user/handleUnauthorizedAction"],
      },
    }),
});
