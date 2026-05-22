import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchPaymentStatus = createAsyncThunk(
  "payment/fetchStatus",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("accessToken");

    if (!token) return rejectWithValue("No token");

    const res = await fetch("/api/payments/status", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return rejectWithValue("Failed to fetch payment status");
    }

    const data = await res.json();

    /*
      expected response examples:

      {
        status: "paid"
      }

      {
        status: "pending"
      }

      {
        status: null
      }
    */

    return data;
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const paymentSlice = createSlice({
  name: "payment",

  initialState: {
    status: null, // null | pending | paid
    loading: false,
    error: null,
  },

  reducers: {
    setPaymentStatus(state, action) {
      state.status = action.payload.status;
      state.loading = false;
      state.error = null;
    },

    clearPaymentStatus(state) {
      state.status = null;
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPaymentStatus.fulfilled, (state, action) => {
        state.status = action.payload.status ?? null;
        state.loading = false;
      })

      .addCase(fetchPaymentStatus.rejected, (state, action) => {
        state.status = null;
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setPaymentStatus, clearPaymentStatus } =
  paymentSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectPaymentStatus = (state) => state.payment.status;

export const selectHasPaid = (state) =>
  state.payment.status === "paid";

export const selectPaymentPending = (state) =>
  state.payment.status === "pending";



export const selectPaymentLoading = (state) =>
  state.payment.loading;

export const selectPaymentError = (state) =>
  state.payment.error;

export default paymentSlice.reducer;