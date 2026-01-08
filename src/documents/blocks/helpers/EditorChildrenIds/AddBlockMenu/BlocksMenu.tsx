import React, { useState } from "react";

import { Box, Menu } from "@mui/material";
import { LibraryAddOutlined } from "@mui/icons-material";

import { TEditorBlock } from "../../../../editor/core";

import BlockButton from "./BlockButton";
import { BUTTONS } from "./buttons";
import ReusableComponentsDialog from "./ReusableComponentsDialog";

type BlocksMenuProps = {
  anchorEl: HTMLElement | null;
  setAnchorEl: (v: HTMLElement | null) => void;
  onSelect: (block: TEditorBlock) => void;
};
export default function BlocksMenu({
  anchorEl,
  setAnchorEl,
  onSelect,
}: BlocksMenuProps) {
  const [componentDialogOpen, setComponentDialogOpen] = useState(false);

  const onClose = () => {
    if (!componentDialogOpen) {
      setAnchorEl(null);
    }
  };

  const onClick = (block: TEditorBlock) => {
    onSelect(block);
    setAnchorEl(null);
  };

  const handleSelectComponent = (componentData: any) => {
    if (componentData.editorJson) {
      // Find the root block or first block in the component
      const rootBlockId =
        Object.keys(componentData.editorJson).find(
          (key) =>
            (componentData.editorJson[key] as any)?.type === "EmailLayout"
        ) || Object.keys(componentData.editorJson)[0];

      if (rootBlockId) {
        // Pass the entire component structure with all blocks
        const componentBlock: TEditorBlock = {
          ...componentData.editorJson[rootBlockId],
          _allBlocks: componentData.editorJson, // Store all blocks for later
        } as any;
        onClick(componentBlock);
      }
    }
    setComponentDialogOpen(false);
  };

  if (anchorEl === null && !componentDialogOpen) {
    return null;
  }

  return (
    <>
      <Menu
        open
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Box
          sx={{
            p: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
          }}
        >
          {BUTTONS.map((k, i) => (
            <BlockButton
              key={i}
              label={k.label}
              icon={k.icon}
              onClick={() => onClick(k.block())}
            />
          ))}
          <BlockButton
            label="Reusable Component"
            icon={<LibraryAddOutlined />}
            onClick={() => {
              setComponentDialogOpen(true);
              setAnchorEl(null);
            }}
          />
        </Box>
      </Menu>

      <ReusableComponentsDialog
        open={componentDialogOpen}
        onClose={() => {
          setComponentDialogOpen(false);
          setAnchorEl(null);
        }}
        onSelectComponent={handleSelectComponent}
      />
    </>
  );
}
