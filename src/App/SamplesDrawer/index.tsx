import React, { useRef } from "react";

import {
  Box,
  Button,
  Divider,
  Drawer,
  Link,
  Stack,
  Typography,
} from "@mui/material";

import {
  useSamplesDrawerOpen,
  resetDocument,
} from "../../documents/editor/EditorContext";
import { useDispatch } from "react-redux";
import {
  setCurrentTemplate,
  setCurrentTemplateId,
} from "../../store/templateSlice";
import getConfiguration from "../../getConfiguration";

import SidebarButton from "./SidebarButton";
import TemplatesDropdown from "./TemplatesDropdown";
import { ArrowBack, BackHand } from "@mui/icons-material";
import "../../../global.css";

export const SAMPLES_DRAWER_WIDTH = 240;

export default function SamplesDrawer() {
  const samplesDrawerOpen = useSamplesDrawerOpen();
  const dispatch = useDispatch();
  const templatesDropdownRef = useRef<any>(null);

  const handleEmptyClick = () => {
    // Explicitly reset the document and clear template state
    const emptyDocument = getConfiguration("#");
    resetDocument(emptyDocument);
    dispatch(setCurrentTemplate(null) as any);
    dispatch(setCurrentTemplateId(null) as any);

    // Reset the dropdown selection
    if (templatesDropdownRef.current) {
      templatesDropdownRef.current.resetSelected();
    }
  };

  const handleTemplateReset = () => {
    // Only reset template dropdown when navigating away from template selection
    dispatch(setCurrentTemplate(null) as any);
    dispatch(setCurrentTemplateId(null) as any);

    // Reset the dropdown selection
    if (templatesDropdownRef.current) {
      templatesDropdownRef.current.resetSelected();
    }
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={samplesDrawerOpen}
      sx={{
        width: samplesDrawerOpen ? SAMPLES_DRAWER_WIDTH : 0,
      }}
    >
      <Stack
        spacing={3}
        py={1}
        px={2}
        width={SAMPLES_DRAWER_WIDTH}
        justifyContent="space-between"
        height="100%"
      >
        <Stack
          spacing={2}
          sx={{
            "& .MuiButtonBase-root": {
              width: "100%",
              justifyContent: "flex-start",
            },
          }}
        >
          <div className="logo-container">
            <Link href="/" underline="none" onClick={handleTemplateReset}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  p: 0.75,
                  color: "oklch(51.1% 0.262 276.966)",
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                EmailMaster
              </Typography>
            </Link>
            <button
              onClick={() => {
                window.parent.postMessage(
                  {
                    type: "NAVIGATE",
                    path: "/campaigns/create-campaign",
                  },
                  "*" // 👈 no hardcoded origin
                );
              }}
              className="back-btn"
            >
              <ArrowBack sx={{ fontSize: 14, textAlign: "center" }} />
            </button>
          </div>

          <Stack alignItems="flex-start">
            <SidebarButton href="#" onClick={handleEmptyClick}>
              Empty
            </SidebarButton>
            <SidebarButton href="#sample/welcome">Welcome email</SidebarButton>
            <SidebarButton href="#sample/one-time-password">
              One-time passcode (OTP)
            </SidebarButton>
            <SidebarButton href="#sample/reset-password">
              Reset password
            </SidebarButton>
            <SidebarButton href="#sample/order-ecomerce">
              E-commerce receipt
            </SidebarButton>
            <SidebarButton href="#sample/subscription-receipt">
              Subscription receipt
            </SidebarButton>
            <SidebarButton href="#sample/reservation-reminder">
              Reservation reminder
            </SidebarButton>
            <SidebarButton href="#sample/post-metrics-report">
              Post metrics
            </SidebarButton>
            <SidebarButton href="#sample/respond-to-message">
              Respond to inquiry
            </SidebarButton>
          </Stack>

          <Divider />
          <Stack>
            <TemplatesDropdown ref={templatesDropdownRef} />
          </Stack>
        </Stack>
      </Stack>
    </Drawer>
  );
}
