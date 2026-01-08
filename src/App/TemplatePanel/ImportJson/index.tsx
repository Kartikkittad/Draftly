import React, { useState } from "react";

import { FileUploadOutlined } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

import ImportJsonDialog from "./ImportJsonDialog";
import { useIsPreviewMode } from "../../../documents/editor/EditorContext";

export default function ImportJson() {
  const [open, setOpen] = useState(false);
  const isPreviewMode = useIsPreviewMode();

  let dialog = null;
  if (open) {
    dialog = <ImportJsonDialog onClose={() => setOpen(false)} />;
  }

  return (
    <>
      <Tooltip title="Import JSON" placement="bottom">
        <span>
          <IconButton
            onClick={() => setOpen(true)}
            disabled={isPreviewMode}
            sx={{
              cursor: isPreviewMode ? "not-allowed" : "pointer",
            }}
          >
            <FileUploadOutlined fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      {dialog}
    </>
  );
}
