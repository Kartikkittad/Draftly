import React from "react";

import { Container as BaseContainer } from "@usewaypoint/block-container";

import { useCurrentBlockId } from "../../editor/EditorBlock";
import {
  setDocument,
  setSelectedBlockId,
  useDocument,
} from "../../editor/EditorContext";
import EditorChildrenIds from "../helpers/EditorChildrenIds";

import { ContainerProps } from "./ContainerPropsSchema";

export default function ContainerEditor({ style, props }: ContainerProps) {
  const childrenIds = props?.childrenIds ?? [];

  const document = useDocument();
  const currentBlockId = useCurrentBlockId();

  return (
    <BaseContainer style={style}>
      <EditorChildrenIds
        childrenIds={childrenIds}
        onChange={({ block, blockId, childrenIds, _allBlocks }) => {
          if (_allBlocks) {
            // Handle component with multiple blocks
            setDocument({
              ..._allBlocks,
              [currentBlockId]: {
                type: "Container",
                data: {
                  ...document[currentBlockId].data,
                  props: { childrenIds: childrenIds },
                },
              },
            });
            setSelectedBlockId(blockId);
          } else {
            setDocument({
              [blockId]: block,
              [currentBlockId]: {
                type: "Container",
                data: {
                  ...document[currentBlockId].data,
                  props: { childrenIds: childrenIds },
                },
              },
            });
            setSelectedBlockId(blockId);
          }
        }}
      />
    </BaseContainer>
  );
}
