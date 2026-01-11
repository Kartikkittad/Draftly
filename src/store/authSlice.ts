import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiJson, setAccessToken } from "../lib/api";

interface AuthState {
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
};

// LOGIN
export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await apiJson.post("/auth/login", payload);
      setAccessToken(res.data.accessToken);
      return true;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Login failed");
    }
  }
);

// REGISTER
export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      await apiJson.post("/auth/register", payload);
      return true;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Registration failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem("accessToken");
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
