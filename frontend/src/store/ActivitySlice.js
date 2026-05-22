import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


// ─── FETCH LOGS ─────────────────────────────────────────────

export const fetchLogs = createAsyncThunk(
  "activity/fetchLogs",
  async (_, thunkAPI) => {
    try {
    const token = localStorage.getItem("accessToken");

      const res = await fetch("/api/logs", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      // 🔥 transform logs → UI format
      const formatted = data.map((log) => {
        const name = log.user
          ? `${log.user.firstname || ""} ${log.user.lastname || ""}`.trim()
          : "User";

        let text = "";

        switch (log.type) {
          case "REGISTER":
            text = `<strong>${name}</strong> registered`;
            break;

          case "ENROLL_PREMIUM":
            text = `<strong>${name}</strong> enrolled in Premium plan`;
            break;

          case "QUIZ_PASSED":
            text = `<strong>${name}</strong> passed a quiz`;
            break;

          case "COURSE_COMPLETED":
            text = `<strong>${name}</strong> completed the course`;
            break;

          case "PAYMENT_PENDING":
            text = `<strong>${name}</strong> registered — payment pending`;
            break;

          default:
            text = `<strong>${name}</strong> did an action`;
        }

        return {
          text,
          color: log.color || "var(--blue-acc)",
          time: log.createdAt,
        };
      });

      return formatted;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);


// ─── SLICE ─────────────────────────────────────────────────

const activitySlice = createSlice({
  name: "activity",
  initialState: {
    logs: [],
    needToRefetch: true,  // flag to trigger refetch after quiz completion
    logsLoading: false,
    error: null,
  },
  reducers: {
    setNeedToRefetch: (state, action) => {
      state.needToRefetch = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.logsLoading = true;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.logsLoading = false;
        state.logs = action.payload;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.logsLoading = false;
        state.error = action.payload;
      });
  },
});


// ─── SELECTOR ──────────────────────────────────────────────

export const selectLogs = (state) => state.activity;

export const { setNeedToRefetch } = activitySlice.actions;

export default activitySlice.reducer;