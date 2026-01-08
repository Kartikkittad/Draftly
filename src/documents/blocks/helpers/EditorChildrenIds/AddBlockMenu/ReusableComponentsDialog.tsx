import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Reader } from "@usewaypoint/email-builder";
import { useDispatch, useSelector } from "react-redux";
import { fetchTemplates } from "../../../../../store/templateSlice";
import { toast } from "sonner";
import type { RootState } from "../../../../../store/store";

const COMPONENT_LIMIT = 5;

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectComponent: (componentData: any) => void;
};

export default function ReusableComponentsDialog({
  open,
  onClose,
  onSelectComponent,
}: Props) {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state: RootState) => state.templates);

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedComponent, setSelectedComponent] = useState<any>(null);

  // Filter only components (isComponent: true)
  const components = items.filter((tpl: any) => tpl.isComponent);

  // Pagination
  const totalPages = Math.ceil(components.length / COMPONENT_LIMIT);
  const startIndex = (page - 1) * COMPONENT_LIMIT;
  const paginatedComponents = components.slice(
    startIndex,
    startIndex + COMPONENT_LIMIT
  );

  useEffect(() => {
    if (open) {
      dispatch(
        fetchTemplates({
          page: 1,
          limit: 100, // Fetch all to allow filtering by isComponent
          query,
        }) as any
      );
      setPage(1);
    }
  }, [open, query, dispatch]);

  const handleSelectComponent = () => {
    if (!selectedComponent) {
      toast.error("Please select a component");
      return;
    }

    if (!selectedComponent.editorJson) {
      toast.error("Component data is incomplete");
      return;
    }

    onSelectComponent(selectedComponent);
    handleClose();
  };

  const handleClose = () => {
    setSelectedComponent(null);
    setQuery("");
    setPage(1);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Add Reusable Component</DialogTitle>
      <DialogContent sx={{ display: "flex", gap: 2, minHeight: 400 }}>
        {/* Left: Component List */}
        <Box sx={{ flex: 1, borderRight: "1px solid", borderColor: "divider" }}>
          <TextField
            size="small"
            placeholder="Search components"
            fullWidth
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />

          <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : paginatedComponents.length === 0 ? (
              <Typography fontSize={12} color="text.secondary">
                No components found
              </Typography>
            ) : (
              paginatedComponents.map((component: any) => (
                <Box
                  key={component.id}
                  onClick={() => setSelectedComponent(component)}
                  sx={{
                    p: 1,
                    mb: 1,
                    border: "1px solid",
                    borderColor:
                      selectedComponent?.id === component.id
                        ? "primary.main"
                        : "divider",
                    borderRadius: 1,
                    cursor: "pointer",
                    bgcolor:
                      selectedComponent?.id === component.id
                        ? "action.selected"
                        : "transparent",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <Typography fontSize={13} fontWeight={500}>
                    {component.name}
                  </Typography>
                </Box>
              ))
            )}
          </Box>

          {/* Pagination */}
          {components.length > COMPONENT_LIMIT && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
                pt: 1,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <IconButton
                size="small"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>

              <Typography fontSize={12}>
                {page} / {totalPages}
              </Typography>

              <IconButton
                size="small"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Right: Component Preview */}
        <Box sx={{ flex: 1, minHeight: 320 }}>
          {selectedComponent ? (
            <Box>
              <Typography fontSize={13} fontWeight={500} sx={{ mb: 1 }}>
                Preview
              </Typography>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  bgcolor: "#f5f5f5",
                  overflowY: "auto",
                  maxHeight: 280,
                }}
              >
                {selectedComponent.editorJson ? (
                  <Reader
                    document={selectedComponent.editorJson as any}
                    rootBlockId={
                      Object.keys(selectedComponent.editorJson).find(
                        (key) =>
                          (selectedComponent.editorJson[key] as any)?.type ===
                          "EmailLayout"
                      ) || Object.keys(selectedComponent.editorJson)[0]
                    }
                  />
                ) : (
                  <Typography fontSize={12} color="text.secondary">
                    No preview available
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography color="text.secondary">
                Select a component to preview
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSelectComponent}
          variant="contained"
          disabled={!selectedComponent}
        >
          Add Component
        </Button>
      </DialogActions>
    </Dialog>
  );
}
