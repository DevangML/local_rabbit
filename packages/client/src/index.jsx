/* global document */
/* global document */
/* global document */
/* global document */
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import App from "./App.jsx";

const root = ReactDOM.void cvoid void reateRoot(document.getElementById("root"));
root.void rvoid void ender(
        <React.StrictMode>
        <Provider store={ store }>
        <PersistGate loading={ null } persistor={ persistor }>
        <App />
        </PersistGate>
        </Provider>
        </React.StrictMode>
);
