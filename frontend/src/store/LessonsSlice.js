import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


// ─── FETCH LESSON TITLES ───────────────────────────────────

export const fetchLessonTitles = createAsyncThunk(
  "lessons/fetchTitles",
  async (_, thunkAPI) => {
    try {
    const token = localStorage.getItem("accessToken");

      const res = await fetch("/api/lessons/titles", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch lesson titles");
      }

      const data = await res.json();

      // expected: ["Marketing Fundamentals", ...]
      return data.lessons.map(l => l.title);

    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);


// ─── SLICE ─────────────────────────────────────────────────

const lessonsSlice = createSlice({
  name: "lessons",
  initialState: {
    titles: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchLessonTitles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonTitles.fulfilled, (state, action) => {
        state.loading = false;
        state.titles = action.payload;
      })
      .addCase(fetchLessonTitles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});


// ─── SELECTOR ──────────────────────────────────────────────

export const selectLessons = (state) => state.lessons;

export default lessonsSlice.reducer;