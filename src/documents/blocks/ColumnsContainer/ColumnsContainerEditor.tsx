import React from "react";

import { ColumnsContainer as BaseColumnsContainer } from "@usewaypoint/block-columns-container";

import { useCurrentBlockId } from "../../editor/EditorBlock";
import { setDocument, setSelectedBlockId } from "../../editor/EditorContext";
import EditorChildrenIds, {
  EditorChildrenChange,
} from "../helpers/EditorChildrenIds";

import ColumnsContainerPropsSchema, {
  ColumnsContainerProps,
} from "./ColumnsContainerPropsSchema";

const EMPTY_COLUMNS = [
  { childrenIds: [] },
  { childrenIds: [] },
  { childrenIds: [] },
];

export default function ColumnsContainerEditor({
  style,
  props,
}: ColumnsContainerProps) {
  const currentBlockId = useCurrentBlockId();

  const { columns, ...restProps } = props ?? {};
  const columnsValue = columns ?? EMPTY_COLUMNS;

  const updateColumn = (
    columnIndex: 0 | 1 | 2,
    { block, blockId, childrenIds, _allBlocks }: EditorChildrenChange
  ) => {
    const nColumns = [...columnsValue];
    nColumns[columnIndex] = { childrenIds };

    // Cast restProps to match the expected type
    const validProps = {
      ...restProps,
      fixedWidths: restProps.fixedWidths
        ? ([
            restProps.fixedWidths[0],
            restProps.fixedWidths[1],
            restProps.fixedWidths[2],
          ] as [number, number, number])
        : undefined,
    };

    if (_allBlocks) {
      // Handle component with multiple blocks
      setDocument({
        ..._allBlocks,
        [currentBlockId]: {
          type: "ColumnsContainer",
          data: ColumnsContainerPropsSchema.parse({
            style,
            props: {
              ...validProps,
              columns: nColumns,
            },
          }),
        },
      });
    } else {
      setDocument({
        [blockId]: block,
        [currentBlockId]: {
          type: "ColumnsContainer",
          data: ColumnsContainerPropsSchema.parse({
            style,
            props: {
              ...validProps,
              columns: nColumns,
            },
          }),
        },
      });
    }
    setSelectedBlockId(blockId);
  };

  return (
    <BaseColumnsContainer
      props={restProps}
      style={style}
      columns={[
        <EditorChildrenIds
          childrenIds={columns?.[0]?.childrenIds}
          onChange={(change) => updateColumn(0, change)}
        />,
        <EditorChildrenIds
          childrenIds={columns?.[1]?.childrenIds}
          onChange={(change) => updateColumn(1, change)}
        />,
        <EditorChildrenIds
          childrenIds={columns?.[2]?.childrenIds}
          onChange={(change) => updateColumn(2, change)}
        />,
      ]}
    />
  );
}
