import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiJson } from "../lib/api";

export const uploadFile = createAsyncThunk(
  "files/upload",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiJson.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (!res.data?.public_url) {
        throw new Error("Upload response missing public_url");
      }

      return res.data.public_url;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "File upload failed"
      );
    }
  }
);

const fileUploadSlice = createSlice({
  name: "fileUpload",
  initialState: {
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default fileUploadSlice.reducer;
