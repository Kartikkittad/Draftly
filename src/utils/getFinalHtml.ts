import { renderToStaticMarkup } from "@usewaypoint/email-builder";

const OPEN_TRACKER_HTML = `
<img
  src="https://staging-email-master-apis.client2.nexeor.com/track/open/{{log_id}}"
  width="1"
  height="1"
  style="display:block;border:0;outline:none;width:1px;height:1px;"
  alt=""
/>
`;

export function getFinalHtml(document: any) {
  let html = renderToStaticMarkup(document, {
    rootBlockId: "root",
  });

  // Prevent duplicates
  if (html.includes("/track/open/")) {
    return html;
  }

  // Case 1: Body exists → inject before </body>
  if (html.includes("</body>")) {
    return html.replace("</body>", `${OPEN_TRACKER_HTML}</body>`);
  }

  // Case 2: No body/html → wrap properly
  return `
<!DOCTYPE html>
<html>
  <body>
    ${html}
    ${OPEN_TRACKER_HTML}
  </body>
</html>
`.trim();
}
