import React from "react";

import { Box, Button, Drawer, Tab, Tabs } from "@mui/material";

import {
  setSidebarTab,
  useInspectorDrawerOpen,
  useSelectedSidebarTab,
  useIsPreviewMode,
} from "../../documents/editor/EditorContext";

import ConfigurationPanel from "./ConfigurationPanel";
import StylesPanel from "./StylesPanel";
import { Logout } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import { logout } from "../../lib/api";

export const INSPECTOR_DRAWER_WIDTH = 320;

export default function InspectorDrawer() {
  const selectedSidebarTab = useSelectedSidebarTab();
  const inspectorDrawerOpen = useInspectorDrawerOpen();
  const isPreviewMode = useIsPreviewMode();

  const renderCurrentSidebarPanel = () => {
    if (isPreviewMode) {
      return (
        <Box sx={{ p: 2, color: "text.secondary", fontSize: 14 }}>
          Inspector is disabled in preview-only mode.
        </Box>
      );
    }

    switch (selectedSidebarTab) {
      case "block-configuration":
        return <ConfigurationPanel />;
      case "styles":
        return <StylesPanel />;
    }
  };

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={inspectorDrawerOpen}
      sx={{
        width: inspectorDrawerOpen ? INSPECTOR_DRAWER_WIDTH : 0,
      }}
    >
      <Box
        sx={{
          width: INSPECTOR_DRAWER_WIDTH,
          height: 49,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          px: 1,
        }}
      >
        {/* Tabs */}
        <Tabs
          value={selectedSidebarTab}
          onChange={(_, v) => {
            if (!isPreviewMode) {
              setSidebarTab(v);
            }
          }}
        >
          <Tab value="styles" label="Styles" disabled={isPreviewMode} />
          <Tab
            value="block-configuration"
            label="Inspect"
            disabled={isPreviewMode}
          />
        </Tabs>

        {/* 🔥 Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Logout */}
        <IconButton onClick={logout} sx={{ color: "error.main" }} size="small">
          <Logout />
        </IconButton>
      </Box>
      <Box
        sx={{
          width: INSPECTOR_DRAWER_WIDTH,
          height: "calc(100% - 49px)",
          overflow: "auto",
        }}
      >
        {renderCurrentSidebarPanel()}
      </Box>
    </Drawer>
  );
}
