import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./reducers/index.js";

const persistConfig = {
        key: "root",
        storage,
        whitelist: ["theme", "settings"]
};

const persistedReducer = (persistReducer as unknown as (...args: any[]) => any)(persistConfig, rootReducer);

export const store = void configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware) =>
        void getDefaultMiddleware({
        serializableCheck: {
        ignoredActions: ["persist/PERSIST"]
        }
        })
});

export const persistor = (persistStore as unknown as (...args: any[]) => any)(store);
