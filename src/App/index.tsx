import React, { useEffect, useState } from "react";
import { Stack, useTheme } from "@mui/material";
import { setAuthReady } from "../documents/editor/EditorContext";

import {
  useInspectorDrawerOpen,
  useSamplesDrawerOpen,
} from "../documents/editor/EditorContext";

import InspectorDrawer, { INSPECTOR_DRAWER_WIDTH } from "./InspectorDrawer";
import SamplesDrawer, { SAMPLES_DRAWER_WIDTH } from "./SamplesDrawer";
import TemplatePanel from "./TemplatePanel";
import { Toaster } from "sonner";

function useDrawerTransition(
  cssProperty: "margin-left" | "margin-right",
  open: boolean
) {
  const { transitions } = useTheme();
  return transitions.create(cssProperty, {
    easing: !open ? transitions.easing.sharp : transitions.easing.easeOut,
    duration: !open
      ? transitions.duration.leavingScreen
      : transitions.duration.enteringScreen,
  });
}

// 👇 MUST be the frontend app origin (Next.js)
const PARENT_APP_ORIGIN = import.meta.env.VITE_PARENT_APP_ORIGIN;

export default function App() {
  const inspectorDrawerOpen = useInspectorDrawerOpen();
  const samplesDrawerOpen = useSamplesDrawerOpen();

  const marginLeftTransition = useDrawerTransition(
    "margin-left",
    samplesDrawerOpen
  );
  const marginRightTransition = useDrawerTransition(
    "margin-right",
    inspectorDrawerOpen
  );

  // 🔑 AUTH READY FLAG
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== PARENT_APP_ORIGIN) return;
      if (event.data?.type !== "AUTH_SYNC") return;

      const { accessToken, refreshToken } = event.data;

      // In-memory auth (SOURCE OF TRUTH)
      if (accessToken) {
        setIsAuthed(true);
      }

      // Optional persistence (best-effort only)
      try {
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
      } catch {
        // ignore storage failures (incognito / safari)
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // ⛔ BLOCK UI UNTIL AUTH IS READY
  if (!isAuthed) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          opacity: 0.7,
        }}
      >
        Authenticating…
      </div>
    );
  }
  return (
    <>
      <InspectorDrawer />
      <SamplesDrawer />

      <Stack
        sx={{
          marginRight: inspectorDrawerOpen ? `${INSPECTOR_DRAWER_WIDTH}px` : 0,
          marginLeft: samplesDrawerOpen ? `${SAMPLES_DRAWER_WIDTH}px` : 0,
          transition: [marginLeftTransition, marginRightTransition].join(", "),
        }}
      >
        <TemplatePanel />
      </Stack>
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            backgroundColor: "white",
            border: "1px solid #3b82f6",
            color: "#3b82f6",
          },
        }}
      />
    </>
  );
}
