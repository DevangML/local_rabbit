import { combineReducers } from "@reduxjs/toolkit";
import themeReducer from "../themeSlice";
import diffViewReducer from "./diffViewReducer.js";

export default combineReducers({
  theme: themeReducer,
  diffView: diffViewReducer,
});
