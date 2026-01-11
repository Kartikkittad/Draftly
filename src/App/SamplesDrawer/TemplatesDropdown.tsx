import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import {
  Box,
  Divider,
  Typography,
  CircularProgress,
  TextField,
  Popover,
  InputAdornment,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import SidebarButton from "./SidebarButton";
import {
  fetchTemplates,
  loadTemplate,
  setCurrentTemplateId,
} from "../../store/templateSlice";
import {
  loadTemplateInPreviewMode,
  setCurrentTemplateId as setEditorTemplateId,
} from "../../documents/editor/EditorContext";
import type { RootState } from "../../store/store";

const TEMPLATE_LIMIT = 5;

const TemplateSelectDropdown = forwardRef((_, ref) => {
  const dispatch = useDispatch();
  const { items, loading, total } = useSelector(
    (state: RootState) => state.templates
  );

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  const open = Boolean(anchorEl);

  // Expose reset and select functions to parent
  useImperativeHandle(ref, () => ({
    resetSelected: () => setSelected(null),
    selectTemplate: (tpl: any) => setSelected(tpl),
  }));

  useEffect(() => {
    dispatch(
      fetchTemplates({
        page,
        limit: TEMPLATE_LIMIT,
        query,
      }) as any
    );
  }, [page, query, dispatch]);

  const handleSelectTemplate = async (tpl: any) => {
    setIsLoadingTemplate(true);
    try {
      const result = await dispatch(loadTemplate(tpl._id) as any).unwrap();

      if (!result.editorJson) {
        throw new Error("Template data is incomplete - no editorJson field");
      }

      // Store the template ID in Redux and Editor Context
      dispatch(setCurrentTemplateId(tpl._id) as any);
      setEditorTemplateId(tpl._id);

      // Load template with preview mode enabled (atomic state update)
      loadTemplateInPreviewMode(result.editorJson);

      toast.success(`Loaded "${tpl.name}" in preview mode`);
      setSelected(tpl);
      setAnchorEl(null);
    } catch (err) {
      toast.error("Failed to load template");
      console.error(err);
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Trigger */}
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          px: 1,
          py: 0.75,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "background.paper",
        }}
      >
        <Typography fontSize={13}>
          {selected ? selected.name : "Select template"}
        </Typography>
        <KeyboardArrowDownIcon fontSize="small" />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{
          sx: {
            width: 280,
            p: 1,
            maxHeight: 360,
          },
        }}
      >
        <TextField
          size="small"
          placeholder="Search templates"
          fullWidth
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          disabled={isLoadingTemplate}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Divider sx={{ my: 1 }} />

        <Box sx={{ maxHeight: 240, overflowY: "auto" }}>
          {loading || isLoadingTemplate ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={16} />
            </Box>
          ) : items.filter((tpl: any) => !tpl.isComponent).length === 0 ? (
            <Typography fontSize={12} color="text.secondary">
              No templates found
            </Typography>
          ) : (
            items
              .filter((tpl: any) => !tpl.isComponent)
              .map((tpl: any) => (
                <SidebarButton
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                >
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <span>{tpl.name}</span>
                    <span style={{ fontSize: 11, color: "#888" }}>
                      {tpl.subject}
                    </span>
                  </Box>
                </SidebarButton>
              ))
          )}
        </Box>
      </Popover>
    </Box>
  );
});

TemplateSelectDropdown.displayName = "TemplateSelectDropdown";

export default TemplateSelectDropdown;
