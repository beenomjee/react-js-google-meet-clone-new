import { configureStore } from "@reduxjs/toolkit";
import { userSlice } from "./slices";

const store = configureStore({
  reducer: {
    user: userSlice,
  },
});

export const dispatch = store.dispatch;
export default store;
