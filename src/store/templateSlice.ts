import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiJson } from "./../lib/api";
import { updateTemplate as updateTemplateApi } from "./../lib/api";
import type { TEditorConfiguration } from "../documents/editor/core";

export const fetchTemplates = createAsyncThunk(
  "templates/fetch",
  async ({ page, limit, query }: any) => {
    const res = await apiJson.post("/templates/list", {
      page,
      limit,
      query,
    });
    // API returns: { status, message, code, data: { data: [...], count: N } }
    return res.data.data;
  }
);

export const createTemplate = createAsyncThunk(
  "templates/create",
  async (
    payload: {
      name: string;
      subject: string;
      fromEmailUsername: string;
      htmlBody: string;
      editorJson: TEditorConfiguration;
      isComponent?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiJson.post("/templates/create", payload);
      // API returns: { status, message, code, data: { id, name, ... } }
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to save template"
      );
    }
  }
);

export const updateTemplate = createAsyncThunk(
  "templates/update",
  async (
    payload: {
      templateId: string;
      name?: string | null;
      subject?: string | null;
      fromEmailUsername?: string | null;
      htmlBody?: string;
      editorJson?: TEditorConfiguration;
    },
    { rejectWithValue }
  ) => {
    try {
      const { templateId, ...updatePayload } = payload;
      const data = await updateTemplateApi(templateId, updatePayload);
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to update template"
      );
    }
  }
);

export const loadTemplate = createAsyncThunk(
  "templates/load",
  async (templateId: string, { rejectWithValue }) => {
    try {
      const res = await apiJson.get(`/templates/${templateId}`);
      // API returns: { status, message, code, data: { id, name, subject, htmlBody, editorJson, ... } }
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to load template"
      );
    }
  }
);

const templatesSlice = createSlice({
  name: "templates",
  initialState: {
    items: [],
    loading: false,
    total: 0,
    currentTemplate: null as any,
    currentTemplateId: null as string | null,
  },
  reducers: {
    setCurrentTemplate: (state, action) => {
      state.currentTemplate = action.payload;
    },
    setCurrentTemplateId: (state, action) => {
      state.currentTemplateId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload is { data: [...], count: N } from res.data.data
        state.items = action.payload.data || action.payload;
        state.total = action.payload.count || 0;
      })
      .addCase(loadTemplate.fulfilled, (state, action) => {
        // Store the loaded template data for use in edit mode
        state.currentTemplate = action.payload;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.currentTemplate = action.payload;
      });
  },
});

export const { setCurrentTemplate, setCurrentTemplateId } =
  templatesSlice.actions;
export default templatesSlice.reducer;
