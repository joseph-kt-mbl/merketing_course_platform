import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    let token = localStorage.getItem("accessToken");

    if (!token) return rejectWithValue("No token");

    let res = await fetch("/api/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Token expired → try refresh once
    if (res.status === 401) {
      const refreshRes = await fetch("/api/users/refresh", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const refreshData = await refreshRes.json();

      if (!refreshRes.ok) {
        localStorage.removeItem("accessToken");
        return rejectWithValue("Refresh failed");
      }

      token = refreshData.accessToken;
      localStorage.setItem("accessToken", token);

      // Retry profile with new token
      res = await fetch("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }

    if (!res.ok) return rejectWithValue("Profile fetch failed");

    const data = await res.json();
    return data.user;
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Even if the request fails, we still clear locally
    } finally {
      localStorage.removeItem("accessToken");
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,   // true on app boot until we verify session
    error: null,
  },
  reducers: {
    // Call this after a successful login/register to inject user immediately
    setUser(state, action) {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearUser(state) {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.user = null;
        state.loading = false;
        state.error = action.payload;
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;