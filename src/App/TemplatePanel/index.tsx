import React from "react";

import {
  AddOutlined,
  EditOutlined,
  MonitorOutlined,
  PhoneIphoneOutlined,
  SaveOutlined,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  Stack,
  SxProps,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { Reader } from "@usewaypoint/email-builder";
import type { TReaderProps } from "@usewaypoint/email-builder";
import EditorBlock from "../../documents/editor/EditorBlock";
import {
  setSelectedScreenSize,
  useDocument,
  useSelectedMainTab,
  useSelectedScreenSize,
  useIsPreviewMode,
  useIsEditMode,
  useCurrentTemplateId,
  exitPreviewModeAndEnterEditMode,
  setCurrentTemplateId,
  loadTemplateInPreviewMode,
} from "../../documents/editor/EditorContext";
import ToggleInspectorPanelButton from "../InspectorDrawer/ToggleInspectorPanelButton";
import ToggleSamplesPanelButton from "../SamplesDrawer/ToggleSamplesPanelButton";

import DownloadJson from "./DownloadJson";
import HtmlPanel from "./HtmlPanel";
import ImportJson from "./ImportJson";
import JsonPanel from "./JsonPanel";
import MainTabsGroup from "./MainTabsGroup";
import ShareButton from "./ShareButton";

import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import SaveTemplateDialog from "../SaveTemplateDialogBox";
import {
  createTemplate,
  updateTemplate,
  loadTemplate,
  setCurrentTemplateId as setReduxTemplateId,
} from "../../store/templateSlice";
import { useMemo } from "react";
import { renderToStaticMarkup } from "@usewaypoint/email-builder";
import { getFinalHtml } from "../../utils/getFinalHtml";
import type { RootState } from "../../store/store";

export default function TemplatePanel() {
  const document = useDocument();
  const selectedMainTab = useSelectedMainTab();
  const selectedScreenSize = useSelectedScreenSize();
  const isPreviewMode = useIsPreviewMode();
  const isEditMode = useIsEditMode();
  const currentTemplateId = useCurrentTemplateId();
  const { currentTemplate } = useSelector(
    (state: RootState) => state.templates
  );

  const dispatch = useDispatch();
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [isDuplicateMode, setIsDuplicateMode] = React.useState(false);

  // Get the root block id from the document config
  const rootBlockId =
    (document &&
      Object.keys(document).find(
        (key) => document[key as keyof typeof document]?.type === "EmailLayout"
      )) ||
    "root";

  const code = useMemo(
    () =>
      renderToStaticMarkup(document as TReaderProps["document"], {
        rootBlockId: rootBlockId,
      }),
    [document, rootBlockId]
  );

  let mainBoxSx: SxProps = {
    height: "100%",
  };
  if (selectedScreenSize === "mobile") {
    mainBoxSx = {
      ...mainBoxSx,
      margin: "32px auto",
      width: 370,
      height: 800,
      boxShadow:
        "rgba(33, 36, 67, 0.04) 0px 10px 20px, rgba(33, 36, 67, 0.04) 0px 2px 6px, rgba(33, 36, 67, 0.04) 0px 0px 1px",
    };
  }

  const handleScreenSizeChange = (_: unknown, value: unknown) => {
    switch (value) {
      case "mobile":
      case "desktop":
        setSelectedScreenSize(value);
        return;
      default:
        setSelectedScreenSize("desktop");
    }
  };

  const renderMainPanel = () => {
    if (isPreviewMode) {
      return (
        <Box sx={mainBoxSx}>
          <Reader
            document={document as TReaderProps["document"]}
            rootBlockId={rootBlockId}
          />
        </Box>
      );
    }

    switch (selectedMainTab) {
      case "editor":
        return (
          <Box sx={mainBoxSx}>
            <EditorBlock id={rootBlockId} />
          </Box>
        );
      case "preview":
        return (
          <Box sx={mainBoxSx}>
            <Reader
              document={document as TReaderProps["document"]}
              rootBlockId={rootBlockId}
            />
          </Box>
        );
      case "html":
        return <HtmlPanel />;
      case "json":
        return <JsonPanel />;
    }
  };

  const handleSaveTemplate = ({
    name,
    subject,
    fromEmailUsername,
  }: {
    name: string;
    subject: string;
    fromEmailUsername: string;
  }) => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }

    if (!subject.trim()) {
      toast.error("Email subject is required");
      return;
    }

    const htmlBody = getFinalHtml(document);

    // Determine whether to create or update
    if (isEditMode && currentTemplateId && !isDuplicateMode) {
      // Update existing template
      dispatch(
        updateTemplate({
          templateId: currentTemplateId,
          name,
          subject,
          fromEmailUsername,
          htmlBody,
          editorJson: document,
        }) as any
      )
        .unwrap()
        .then(() => {
          toast.success("Template updated successfully");
          setSaveOpen(false);
        })
        .catch((err: string) => {
          toast.error(err);
        });
    } else {
      // Create new template (or duplicate)
      dispatch(
        createTemplate({
          name,
          subject,
          fromEmailUsername,
          htmlBody,
          editorJson: document,
        }) as any
      )
        .unwrap()
        .then((createdTemplate: any) => {
          toast.success(
            isDuplicateMode
              ? "Template duplicated successfully"
              : "Template saved successfully"
          );
          setSaveOpen(false);
          setIsDuplicateMode(false);

          // If duplicate mode, auto-load the new template in preview
          if (isDuplicateMode && createdTemplate?.id) {
            dispatch(loadTemplate(createdTemplate.id) as any)
              .unwrap()
              .then((result: any) => {
                if (result.editorJson) {
                  // Set template ID for preview mode and load it
                  dispatch(setReduxTemplateId(createdTemplate.id) as any);
                  setCurrentTemplateId(createdTemplate.id);
                  loadTemplateInPreviewMode(result.editorJson);
                  toast.success(
                    `Loaded "${createdTemplate.name}" in preview mode`
                  );
                }
              })
              .catch(() => {
                toast.error("Created but failed to load template");
              });
          }
        })
        .catch((err: string) => {
          toast.error(err);
          setIsDuplicateMode(false);
        });
    }
  };

  const handleDuplicateClick = () => {
    if (!isPreviewMode || !currentTemplate) {
      toast.error("Please load a template first");
      return;
    }
    setIsDuplicateMode(true);
    setSaveOpen(true);
  };

  return (
    <>
      <Stack
        sx={{
          height: 49,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "white",
          position: "sticky",
          top: 0,
          zIndex: "appBar",
          px: 1,
        }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <ToggleSamplesPanelButton />
        <Stack
          px={2}
          direction="row"
          gap={2}
          width="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={2}>
            <MainTabsGroup />
          </Stack>
          <Stack direction="row" spacing={2}>
            {isPreviewMode && (
              <Tooltip title="Edit template" placement="bottom">
                <IconButton
                  onClick={() => exitPreviewModeAndEnterEditMode()}
                  sx={{
                    cursor: "pointer",
                    color: "primary.main",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <EditOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {isPreviewMode && (
              <Tooltip title="Duplicate Template" placement="bottom">
                <span>
                  <IconButton
                    onClick={handleDuplicateClick}
                    disabled={isEditMode}
                    sx={{
                      cursor: isEditMode ? "not-allowed" : "pointer",
                      color: isEditMode ? "action.disabled" : "primary.main",
                      "&:hover": isEditMode
                        ? {}
                        : {
                            backgroundColor: "action.hover",
                          },
                    }}
                  >
                    <AddOutlined fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <Tooltip title="Save Template" placement="bottom">
              <span>
                <IconButton
                  onClick={() => setSaveOpen(true)}
                  disabled={isPreviewMode}
                  sx={{
                    cursor: isPreviewMode ? "not-allowed" : "pointer",
                  }}
                >
                  <SaveOutlined fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <DownloadJson />
            <ImportJson />
            <ToggleButtonGroup
              value={selectedScreenSize}
              exclusive
              size="small"
              onChange={handleScreenSizeChange}
            >
              <ToggleButton value="desktop">
                <Tooltip title="Desktop view">
                  <MonitorOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="mobile">
                <Tooltip title="Mobile view">
                  <PhoneIphoneOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            <ShareButton />
          </Stack>
        </Stack>
        <ToggleInspectorPanelButton />
      </Stack>
      <Box
        sx={{ height: "calc(100vh - 49px)", overflow: "auto", minWidth: 370 }}
      >
        {renderMainPanel()}
      </Box>

      <SaveTemplateDialog
        open={saveOpen}
        onClose={() => {
          setSaveOpen(false);
          setIsDuplicateMode(false);
        }}
        onSave={handleSaveTemplate}
        isEditMode={isEditMode}
        currentTemplate={currentTemplate}
        isDuplicateMode={isDuplicateMode}
      />
    </>
  );
}
