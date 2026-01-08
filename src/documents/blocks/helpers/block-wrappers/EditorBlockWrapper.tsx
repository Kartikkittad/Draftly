import React, { CSSProperties, useState } from "react";

import { Box } from "@mui/material";

import { useCurrentBlockId } from "../../../editor/EditorBlock";
import {
  setSelectedBlockId,
  useSelectedBlockId,
  useIsPreviewMode,
} from "../../../editor/EditorContext";

import TuneMenu from "./TuneMenu";

type TEditorBlockWrapperProps = {
  children: JSX.Element;
};

export default function EditorBlockWrapper({
  children,
}: TEditorBlockWrapperProps) {
  const selectedBlockId = useSelectedBlockId();
  const isPreviewMode = useIsPreviewMode();
  const [mouseInside, setMouseInside] = useState(false);
  const blockId = useCurrentBlockId();

  let outline: CSSProperties["outline"];
  if (selectedBlockId === blockId) {
    outline = "2px solid rgba(0,121,204, 1)";
  } else if (mouseInside) {
    outline = "2px solid rgba(0,121,204, 0.3)";
  }

  const renderMenu = () => {
    if (selectedBlockId !== blockId || isPreviewMode) {
      return null;
    }
    return <TuneMenu blockId={blockId} />;
  };

  return (
    <Box
      sx={{
        position: "relative",
        maxWidth: "100%",
        outlineOffset: "-1px",
        outline: isPreviewMode ? undefined : outline,
      }}
      onMouseEnter={(ev) => {
        if (isPreviewMode) return;
        setMouseInside(true);
        ev.stopPropagation();
      }}
      onMouseLeave={() => {
        setMouseInside(false);
      }}
      onClick={(ev) => {
        if (isPreviewMode) return;
        setSelectedBlockId(blockId);
        ev.stopPropagation();
        ev.preventDefault();
      }}
    >
      {renderMenu()}
      {children}
    </Box>
  );
}
