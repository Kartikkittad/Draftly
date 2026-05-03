import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiJson } from "../lib/api";

export const sendEmail = createAsyncThunk(
  "email/send",
  async (
    payload: {
      emails: string[];
      subject: string;
      html: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiJson.post("/emails/send", payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Send failed");
    }
  }
);

const emailSlice = createSlice({
  name: "email",
  initialState: { loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendEmail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default emailSlice.reducer;
