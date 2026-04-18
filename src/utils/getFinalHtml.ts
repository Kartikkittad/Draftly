import { renderToStaticMarkup } from "@usewaypoint/email-builder";

export function getFinalHtml(document: any) {
  return renderToStaticMarkup(document, {
    rootBlockId: "root",
  });
}
