import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiJson } from "../lib/api";

interface FileUploadState {
  loading: boolean;
  error: string | null;
  uploadedFileUrl: string | null;
}

const initialState: FileUploadState = {
  loading: false,
  error: null,
  uploadedFileUrl: null,
};

export const uploadFile = createAsyncThunk(
  "files/upload",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiJson.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
  initialState,
  reducers: {
    clearUploadedFile(state) {
      state.uploadedFileUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadedFileUrl = action.payload as string;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUploadedFile } = fileUploadSlice.actions;
export default fileUploadSlice.reducer;
