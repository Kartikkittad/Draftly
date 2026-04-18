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

function unwrapApiPayload(payload: any) {
  if (!payload || typeof payload !== "object") return payload;
  if (!("data" in payload)) return payload;

  const nested = payload.data;
  const isNestedEnvelope =
    nested &&
    typeof nested === "object" &&
    !Array.isArray(nested) &&
    ("data" in nested ||
      "count" in nested ||
      "page" in nested ||
      "limit" in nested ||
      "query" in nested);

  return isNestedEnvelope ? nested : payload;
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
      const payload = unwrapApiPayload(res.data);
      return {
        data: payload?.data ?? [],
        count: payload?.count ?? 0,
        page: payload?.page ?? page,
        query: payload?.query ?? query,
        limit: payload?.limit ?? limit,
      };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message ?? "Failed to fetch templates"
      );
    }
  }
);

export const createTemplate = createAsyncThunk(
  "templates/create",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await apiJson.post("/templates/create", payload);
      return unwrapApiPayload(res.data);
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message ?? "Failed to create template"
      );
    }
  }
);

export const loadTemplate = createAsyncThunk(
  "templates/load",
  async (id: string) => {
    const res = await apiJson.get(`/templates/details/${id}`);
    const responsePayload = res?.data;
    const templateData =
      responsePayload?.data &&
      typeof responsePayload.data === "object" &&
      !Array.isArray(responsePayload.data) &&
      ("_id" in responsePayload.data ||
        "editorJson" in responsePayload.data ||
        "htmlBody" in responsePayload.data)
        ? responsePayload.data
        : unwrapApiPayload(responsePayload) ?? {};

    let parsedEditorJson = templateData?.editorJson;
    if (typeof parsedEditorJson === "string") {
      try {
        parsedEditorJson = JSON.parse(parsedEditorJson);
      } catch {
        parsedEditorJson = null;
      }
    }

    return {
      ...templateData,
      editorJson: parsedEditorJson,
    };
  }
);

export const updateTemplate = createAsyncThunk(
  "templates/update",
  async (payload: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await apiJson.put(`/templates/${payload.id}`, payload.data);
      return unwrapApiPayload(res.data);
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message ?? "Failed to update template"
      );
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
