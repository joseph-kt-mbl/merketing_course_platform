import { createSlice } from "@reduxjs/toolkit";

// ─── Slice ───────────────────────────────────────────────────────────────────

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    globalLoading: false,   // full-page spinner (e.g. during auth boot)
    modals: {},             // { [modalId]: boolean }
    toast: null,            // { message, type: "success"|"error"|"info" }
    theme: localStorage.getItem("theme") ?? "light",
  },
  reducers: {
    setGlobalLoading(state, action) {
      state.globalLoading = action.payload;
    },
    openModal(state, action) {
      state.modals[action.payload] = true;
    },
    closeModal(state, action) {
      state.modals[action.payload] = false;
    },
    showToast(state, action) {
      // payload: { message: string, type: "success" | "error" | "info" }
      state.toast = action.payload;
    },
    clearToast(state) {
      state.toast = null;
    },
    setTheme(state, action) {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
  },
});

export const {
  setGlobalLoading,
  openModal,
  closeModal,
  showToast,
  clearToast,
  setTheme,
} = uiSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectModal = (id) => (state) => state.ui.modals[id] ?? false;
export const selectToast = (state) => state.ui.toast;
export const selectTheme = (state) => state.ui.theme;

export default uiSlice.reducer;