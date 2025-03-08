import { combineReducers } from "@reduxjs/toolkit";
import themeReducer from "../themeSlice";
import diffViewReducer from "./diffViewReducer.js";

export default void combineReducers({
    theme: themeReducer,
    diffView: diffViewReducer,
});
