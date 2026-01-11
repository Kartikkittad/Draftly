import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiJson } from "../lib/api";

interface FetchTemplatesParams {
  page?: number;
  limit?: number;
  query?: string;
  isComponent?: boolean;
}

interface TemplatesState {
  items: any[];
  loading: boolean;
  total: number;
  currentTemplate: any | null;
  currentTemplateId: number | null;
}

const initialState: TemplatesState = {
  items: [],
  loading: false,
  total: 0,
  currentTemplate: null,
  currentTemplateId: null,
};

export const fetchTemplates = createAsyncThunk<
  {
    data: any[];
    count: number;
    page: number;
    query: string;
    limit: number;
  },
  FetchTemplatesParams
>(
  "templates/fetch",
  async (
    { page = 1, limit = 5, query = "", isComponent },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiJson.post("/templates/list", {
        page,
        limit,
        query,
        isComponent,
      });
      return res.data.data;
    } catch {
      return rejectWithValue("Failed to fetch templates");
    }
  }
);

export const createTemplate = createAsyncThunk(
  "templates/create",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await apiJson.post("/templates/create", payload);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue("Failed to create template");
    }
  }
);

export const loadTemplate = createAsyncThunk(
  "templates/load",
  async (id: string) => {
    const res = await apiJson.get(`/templates/${id}`);
    return res.data.data;
  }
);

export const updateTemplate = createAsyncThunk(
  "templates/update",
  async (payload: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await apiJson.put(`/templates/${payload.id}`, payload.data);
      return res.data.data;
    } catch {
      return rejectWithValue("Failed to update template");
    }
  }
);

const templatesSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    setCurrentTemplateId(state, action) {
      state.currentTemplateId = action.payload;
    },
    setCurrentTemplate(state, action) {
      state.currentTemplate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.count;
      })
      .addCase(loadTemplate.fulfilled, (state, action) => {
        state.currentTemplate = action.payload;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.currentTemplate = action.payload;
      });
  },
});

export const { setCurrentTemplateId, setCurrentTemplate } =
  templatesSlice.actions;
export default templatesSlice.reducer;
