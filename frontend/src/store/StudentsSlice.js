import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { io } from "socket.io-client";

export const socket = io("localhost:5000");



// async action
export const fetchStudents = createAsyncThunk(
  "students/fetchStudents",
  async (_, thunkAPI) => {
    try{
    const token = localStorage.getItem("accessToken");

      const res = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const studentsSlice = createSlice({
    name: "students",
    initialState: {
      students: [],
      loading: false,
      error: null,
    },
    reducers: {},
  
    extraReducers: (builder) => {
      builder
        .addCase(fetchStudents.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchStudents.fulfilled, (state, action) => {
          state.loading = false;
          state.students = action.payload;
        })
        .addCase(fetchStudents.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });

export const selectStudents = (state) => state.students

  
  export default studentsSlice.reducer;

