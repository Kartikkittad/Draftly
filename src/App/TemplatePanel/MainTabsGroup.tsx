import React from "react";

import {
  CodeOutlined,
  DataObjectOutlined,
  EditOutlined,
  PreviewOutlined,
} from "@mui/icons-material";
import { Tab, Tabs, Tooltip } from "@mui/material";

import {
  setSelectedMainTab,
  useSelectedMainTab,
  useIsPreviewMode,
} from "../../documents/editor/EditorContext";

export default function MainTabsGroup() {
  const selectedMainTab = useSelectedMainTab();
  const isPreviewMode = useIsPreviewMode();

  const handleChange = (_: unknown, v: unknown) => {
    switch (v) {
      case "json":
      case "preview":
      case "editor":
      case "html":
        setSelectedMainTab(v);
        return;
      default:
        setSelectedMainTab("editor");
    }
  };

  return (
    <Tabs value={selectedMainTab} onChange={handleChange}>
      <Tab
        value="editor"
        label={
          <Tooltip title="Edit">
            <EditOutlined fontSize="small" />
          </Tooltip>
        }
      />
      <Tab
        value="preview"
        label={
          <Tooltip title="Preview">
            <PreviewOutlined fontSize="small" />
          </Tooltip>
        }
      />
      <Tab
        value="html"
        disabled={isPreviewMode}
        label={
          <Tooltip
            title={isPreviewMode ? "Disabled in preview mode" : "HTML output"}
          >
            <CodeOutlined fontSize="small" />
          </Tooltip>
        }
      />
      <Tab
        value="json"
        disabled={isPreviewMode}
        label={
          <Tooltip
            title={isPreviewMode ? "Disabled in preview mode" : "JSON output"}
          >
            <DataObjectOutlined fontSize="small" />
          </Tooltip>
        }
      />
    </Tabs>
  );
}
