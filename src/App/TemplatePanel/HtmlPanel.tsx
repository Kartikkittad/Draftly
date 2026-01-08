import React, { useMemo } from "react";

import { renderToStaticMarkup } from "@usewaypoint/email-builder";

import { useDocument } from "../../documents/editor/EditorContext";
import { getFinalHtml } from "../../utils/getFinalHtml";

import HighlightedCodePanel from "./helper/HighlightedCodePanel";

export default function HtmlPanel() {
  const document = useDocument();
  const code = useMemo(() => getFinalHtml(document), [document]);
  return <HighlightedCodePanel type="html" value={code} />;
}
