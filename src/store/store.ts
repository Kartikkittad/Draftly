import { configureStore } from "@reduxjs/toolkit";
import templatesReducer from "./templateSlice";
import fileUploadReducer from "./fileUploadSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    templates: templatesReducer,
    fileUpload: fileUploadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
