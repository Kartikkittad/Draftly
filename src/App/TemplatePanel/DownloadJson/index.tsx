import React, { useMemo } from "react";

import { FileDownloadOutlined } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

import {
  useDocument,
  useIsPreviewMode,
} from "../../../documents/editor/EditorContext";

export default function DownloadJson() {
  const doc = useDocument();
  const isPreviewMode = useIsPreviewMode();

  const href = useMemo(() => {
    return `data:text/plain,${encodeURIComponent(JSON.stringify(doc, null, "  "))}`;
  }, [doc]);

  return (
    <Tooltip title="Download JSON file" placement="bottom">
      <span>
        <IconButton
          href={href}
          download="emailTemplate.json"
          disabled={isPreviewMode}
          sx={{
            cursor: isPreviewMode ? "not-allowed" : "pointer",
          }}
        >
          <FileDownloadOutlined fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
}
