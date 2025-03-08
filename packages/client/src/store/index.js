import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./reducers/index.js";

const persistConfig = {
        key: "root",
        storage,
        whitelist: ["theme", "settings"]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({
                        serializableCheck: {
                                ignoredActions: ["persist/PERSIST"]
                        }
                })
});

export const persistor = persistStore(store);
