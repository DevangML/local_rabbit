import { combineReducers } from '@reduxjs/toolkit';
import themeReducer from './themeReducer.js';
import diffViewReducer from './diffViewReducer.js';

export default combineReducers({
  theme: themeReducer,
  diffView: diffViewReducer
});
