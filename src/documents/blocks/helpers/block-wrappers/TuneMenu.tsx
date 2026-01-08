import React, { useState } from "react";

import {
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@mui/icons-material";
import {
  IconButton,
  Paper,
  Stack,
  SxProps,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

import { TEditorBlock } from "../../../editor/core";
import {
  resetDocument,
  setSelectedBlockId,
  useDocument,
} from "../../../editor/EditorContext";
import { ColumnsContainerProps } from "../../ColumnsContainer/ColumnsContainerPropsSchema";
import { renderToStaticMarkup } from "@usewaypoint/email-builder";
import { apiJson } from "../../../../lib/api";
import { toast } from "sonner";

const sx: SxProps = {
  position: "absolute",
  top: 0,
  left: -56,
  borderRadius: 64,
  paddingX: 0.5,
  paddingY: 1,
  zIndex: "fab",
};
type EditorDoc = Record<string, TEditorBlock>;
type Props = {
  blockId: string;
};
export default function TuneMenu({ blockId }: Props) {
  const document = useDocument();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [componentName, setComponentName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleDeleteClick = () => {
    const filterChildrenIds = (childrenIds: string[] | null | undefined) => {
      if (!childrenIds) {
        return childrenIds;
      }
      return childrenIds.filter((f) => f !== blockId);
    };
    const nDocument: typeof document = { ...document };
    for (const id in nDocument) {
      const block = nDocument[id];
      if (id === blockId) {
        continue;
      }
      switch (block.type) {
        case "EmailLayout":
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              childrenIds: filterChildrenIds(block.data.childrenIds),
            },
          };
          break;
        case "Container":
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              props: {
                ...block.data.props,
                childrenIds: filterChildrenIds(block.data.props?.childrenIds),
              },
            },
          };
          break;
        case "ColumnsContainer":
          nDocument[id] = {
            type: "ColumnsContainer",
            data: {
              style: block.data.style,
              props: {
                ...block.data.props,
                columns: block.data.props?.columns?.map((c: any) => ({
                  childrenIds: filterChildrenIds(c.childrenIds),
                })),
              },
            } as ColumnsContainerProps,
          };
          break;
        default:
          nDocument[id] = block;
      }
    }
    delete nDocument[blockId];
    resetDocument(nDocument as any);
  };

  const handleMoveClick = (direction: "up" | "down") => {
    const moveChildrenIds = (ids: string[] | null | undefined) => {
      if (!ids) {
        return ids;
      }
      const index = ids.indexOf(blockId);
      if (index < 0) {
        return ids;
      }
      const childrenIds = [...ids];
      if (direction === "up" && index > 0) {
        [childrenIds[index], childrenIds[index - 1]] = [
          childrenIds[index - 1],
          childrenIds[index],
        ];
      } else if (direction === "down" && index < childrenIds.length - 1) {
        [childrenIds[index], childrenIds[index + 1]] = [
          childrenIds[index + 1],
          childrenIds[index],
        ];
      }
      return childrenIds;
    };
    const nDocument: typeof document = { ...document };

    for (const [id, b] of Object.entries(nDocument)) {
      const block = b as TEditorBlock;
      if (id === blockId) {
        continue;
      }
      switch (block.type) {
        case "EmailLayout":
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              childrenIds: moveChildrenIds(block.data.childrenIds),
            },
          };
          break;
        case "Container":
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              props: {
                ...block.data.props,
                childrenIds: moveChildrenIds(block.data.props?.childrenIds),
              },
            },
          };
          break;
        case "ColumnsContainer":
          nDocument[id] = {
            type: "ColumnsContainer",
            data: {
              style: block.data.style,
              props: {
                ...block.data.props,
                columns: block.data.props?.columns?.map((c: any) => ({
                  childrenIds: moveChildrenIds(c.childrenIds),
                })),
              },
            } as ColumnsContainerProps,
          };
          break;
        default:
          nDocument[id] = block;
      }
    }

    resetDocument(nDocument as any);
    setSelectedBlockId(blockId);
  };

  const handleSaveComponentSubmit = async () => {
    if (!componentName.trim()) {
      toast.error("Component name is required");
      return;
    }

    setIsSaving(true);
    try {
      const htmlBody = renderToStaticMarkup(document as any, {
        rootBlockId: blockId,
      });

      // Create a minimal document with the selected block and all its children
      const getBlockAndChildren = (id: string): Record<string, any> => {
        const result: Record<string, any> = {};
        const queue = [id];
        const visited = new Set<string>();

        while (queue.length > 0) {
          const currentId = queue.shift();
          if (!currentId || visited.has(currentId)) continue;
          visited.add(currentId);

          const block = (document as any)[currentId];
          if (!block) continue;

          result[currentId] = block;

          // Add children to queue based on block type
          const childrenIds: string[] = [];
          if ((block as any).data?.childrenIds) {
            childrenIds.push(...(block as any).data.childrenIds);
          }
          if ((block as any).data?.props?.childrenIds) {
            childrenIds.push(...(block as any).data.props.childrenIds);
          }
          if ((block as any).data?.props?.columns) {
            (block as any).data.props.columns.forEach((col: any) => {
              if (col.childrenIds) childrenIds.push(...col.childrenIds);
            });
          }
          queue.push(...childrenIds);
        }

        return result;
      };

      const componentEditorJson = getBlockAndChildren(blockId);

      await apiJson.post("/templates/create", {
        name: componentName,
        subject: "",
        htmlBody,
        editorJson: componentEditorJson,
        fromEmailUsername: null,
        isComponent: true,
      });

      toast.success("Component saved successfully");
      setSaveDialogOpen(false);
      setComponentName("");
    } catch (error) {
      toast.error("Failed to save component");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveComponentClick = () => {
    setComponentName("");
    setSaveDialogOpen(true);
  };

  return (
    <Paper sx={sx} onClick={(ev) => ev.stopPropagation()}>
      <Stack>
        <Tooltip title="Move up" placement="left-start">
          <IconButton
            onClick={() => handleMoveClick("up")}
            sx={{ color: "text.primary" }}
          >
            <ArrowUpwardOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Move down" placement="left-start">
          <IconButton
            onClick={() => handleMoveClick("down")}
            sx={{ color: "text.primary" }}
          >
            <ArrowDownwardOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Save as component" placement="left-start">
          <IconButton
            onClick={handleSaveComponentClick}
            sx={{ color: "text.primary" }}
          >
            <SaveOutlined fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete" placement="left-start">
          <IconButton
            onClick={handleDeleteClick}
            sx={{ color: "text.primary" }}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Save as Component</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Component Name"
            fullWidth
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
            margin="normal"
            placeholder="e.g. Hero Section, Footer"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveComponentSubmit}
            variant="contained"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Component"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
