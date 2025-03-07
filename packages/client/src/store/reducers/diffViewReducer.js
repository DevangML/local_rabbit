import { createSlice } from "@reduxjs/toolkit";

const diffViewSlice = createSlice({
  name: "diffView",
  initialState: {
    activeView: "diff",
    loading: false,
    error: null,
  },
  reducers: {
    setActiveView: (state, action) => {
      state.activeView = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setActiveView, setLoading, setError } = diffViewSlice.actions;
export default diffViewSlice.reducer;
