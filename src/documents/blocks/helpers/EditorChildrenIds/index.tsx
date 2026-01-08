import React, { Fragment } from "react";

import { TEditorBlock } from "../../../editor/core";
import EditorBlock from "../../../editor/EditorBlock";

import AddBlockButton from "./AddBlockMenu";

export type EditorChildrenChange = {
  blockId: string;
  block: TEditorBlock;
  childrenIds: string[];
  _allBlocks?: Record<string, TEditorBlock>; // For components with multiple blocks
};

function generateId() {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const remapComponentIds = (
  allBlocks: Record<string, TEditorBlock>,
  oldRootId: string
): { remappedBlocks: Record<string, TEditorBlock>; newRootId: string } => {
  const idMap = new Map<string, string>();
  const remappedBlocks: Record<string, TEditorBlock> = {};

  // Create mapping for all block IDs
  Object.keys(allBlocks).forEach((oldId) => {
    const newId = generateId();
    idMap.set(oldId, newId);
  });

  // Remap blocks and update child references
  Object.keys(allBlocks).forEach((oldId) => {
    const block = allBlocks[oldId];
    const newId = idMap.get(oldId)!;

    const remappedBlock = { ...block } as any;

    // Update childrenIds if present
    if ((block as any).data?.childrenIds) {
      remappedBlock.data = {
        ...remappedBlock.data,
        childrenIds: (block as any).data.childrenIds.map(
          (id: string) => idMap.get(id) || id
        ),
      };
    }

    // Update props.childrenIds if present
    if ((block as any).data?.props?.childrenIds) {
      remappedBlock.data = {
        ...remappedBlock.data,
        props: {
          ...(block as any).data.props,
          childrenIds: (block as any).data.props.childrenIds.map(
            (id: string) => idMap.get(id) || id
          ),
        },
      };
    }

    // Update columns childrenIds if present
    if ((block as any).data?.props?.columns) {
      remappedBlock.data = {
        ...remappedBlock.data,
        props: {
          ...(block as any).data.props,
          columns: (block as any).data.props.columns.map((col: any) => ({
            ...col,
            childrenIds: col.childrenIds?.map(
              (id: string) => idMap.get(id) || id
            ),
          })),
        },
      };
    }

    remappedBlocks[newId] = remappedBlock;
  });

  const newRootId = idMap.get(oldRootId)!;
  return { remappedBlocks, newRootId };
};

export type EditorChildrenIdsProps = {
  childrenIds: string[] | null | undefined;
  onChange: (val: EditorChildrenChange) => void;
};
export default function EditorChildrenIds({
  childrenIds,
  onChange,
}: EditorChildrenIdsProps) {
  const appendBlock = (block: TEditorBlock) => {
    // Handle component with multiple blocks
    const allBlocks = (block as any)._allBlocks;
    if (allBlocks) {
      // Find the root block ID
      const oldRootBlockId =
        Object.keys(allBlocks).find(
          (key) => (allBlocks[key] as any)?.type === "EmailLayout"
        ) || Object.keys(allBlocks)[0];

      // Remap all IDs to be unique
      const { remappedBlocks, newRootId } = remapComponentIds(
        allBlocks,
        oldRootBlockId
      );

      const rootBlock = { ...remappedBlocks[newRootId] };
      delete (rootBlock as any)._allBlocks;

      return onChange({
        blockId: newRootId,
        block: rootBlock,
        childrenIds: [...(childrenIds || []), newRootId],
        _allBlocks: remappedBlocks,
      } as any);
    }

    const blockId = generateId();
    return onChange({
      blockId,
      block,
      childrenIds: [...(childrenIds || []), blockId],
    });
  };

  const insertBlock = (block: TEditorBlock, index: number) => {
    // Handle component with multiple blocks
    const allBlocks = (block as any)._allBlocks;
    if (allBlocks) {
      // Find the root block ID
      const oldRootBlockId =
        Object.keys(allBlocks).find(
          (key) => (allBlocks[key] as any)?.type === "EmailLayout"
        ) || Object.keys(allBlocks)[0];

      // Remap all IDs to be unique
      const { remappedBlocks, newRootId } = remapComponentIds(
        allBlocks,
        oldRootBlockId
      );

      const rootBlock = { ...remappedBlocks[newRootId] };
      delete (rootBlock as any)._allBlocks;

      const newChildrenIds = [...(childrenIds || [])];
      newChildrenIds.splice(index, 0, newRootId);
      return onChange({
        blockId: newRootId,
        block: rootBlock,
        childrenIds: newChildrenIds,
        _allBlocks: remappedBlocks,
      } as any);
    }

    const blockId = generateId();
    const newChildrenIds = [...(childrenIds || [])];
    newChildrenIds.splice(index, 0, blockId);
    return onChange({
      blockId,
      block,
      childrenIds: newChildrenIds,
    });
  };

  if (!childrenIds || childrenIds.length === 0) {
    return <AddBlockButton placeholder onSelect={appendBlock} />;
  }

  return (
    <>
      {childrenIds.map((childId, i) => (
        <Fragment key={childId}>
          <AddBlockButton onSelect={(block) => insertBlock(block, i)} />
          <EditorBlock id={childId} />
        </Fragment>
      ))}
      <AddBlockButton onSelect={appendBlock} />
    </>
  );
}
