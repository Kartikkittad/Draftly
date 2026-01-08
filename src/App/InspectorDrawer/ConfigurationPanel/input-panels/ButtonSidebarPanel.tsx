import React, { useState } from "react";

import { ToggleButton, Box, Typography } from "@mui/material";
import {
  ButtonProps,
  ButtonPropsDefaults,
  ButtonPropsSchema,
} from "@usewaypoint/block-button";

import BaseSidebarPanel from "./helpers/BaseSidebarPanel";
import ColorInput from "./helpers/inputs/ColorInput";
import RadioGroupInput from "./helpers/inputs/RadioGroupInput";
import TextInput from "./helpers/inputs/TextInput";
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel";

type ButtonSidebarPanelProps = {
  data: ButtonProps;
  setData: (v: ButtonProps) => void;
};
export default function ButtonSidebarPanel({
  data,
  setData,
}: ButtonSidebarPanelProps) {
  const [, setErrors] = useState<Zod.ZodError | null>(null);
  const [text, setText] = useState(
    data.props?.text ?? ButtonPropsDefaults.text
  );
  const [url, setUrl] = useState(data.props?.url ?? ButtonPropsDefaults.url);

  const updateData = (d: unknown) => {
    const res = ButtonPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    updateData({ ...data, props: { ...data.props, text: newText } });
  };

  function extractRawUrl(value: string) {
    try {
      const u = new URL(value);

      // If it's already a tracking URL → extract ?url=
      if (u.searchParams.has("url")) {
        return decodeURIComponent(u.searchParams.get("url")!);
      }

      return value;
    } catch {
      return value;
    }
  }

  const handleUrlChange = (input: string) => {
    const rawUrl = extractRawUrl(input);

    setUrl(rawUrl);

    // Store ONLY raw URL
    updateData({
      ...data,
      props: {
        ...data.props,
        url: rawUrl,
      },
    });
  };

  const getPreviewUrl = () => {
    const apiBase = import.meta.env.VITE_API_URL;

    // Don't wrap unsubscribe URLs
    if (url.includes("/track/unsubscribe/")) {
      return url;
    }

    const encodedUrl = encodeURIComponent(url);
    const encodedName = encodeURIComponent(text);
    return `${apiBase}/track/click/{{log_id}}?url=${encodedUrl}&link_name=${encodedName}`;
  };
  const fullWidth = data.props?.fullWidth ?? ButtonPropsDefaults.fullWidth;
  const size = data.props?.size ?? ButtonPropsDefaults.size;
  const buttonStyle =
    data.props?.buttonStyle ?? ButtonPropsDefaults.buttonStyle;
  const buttonTextColor =
    data.props?.buttonTextColor ?? ButtonPropsDefaults.buttonTextColor;
  const buttonBackgroundColor =
    data.props?.buttonBackgroundColor ??
    ButtonPropsDefaults.buttonBackgroundColor;

  return (
    <BaseSidebarPanel title="Button block">
      <TextInput label="Text" defaultValue={text} onChange={handleTextChange} />
      <TextInput label="Url" defaultValue={url} onChange={handleUrlChange} />
      <Box sx={{ mt: 2, p: 1.5, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
        <Typography
          variant="caption"
          sx={{ display: "block", mb: 0.5, fontWeight: 600 }}
        >
          Preview URL:
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            wordBreak: "break-all",
            fontSize: "0.7rem",
            color: "#666",
            fontFamily: "monospace",
          }}
        >
          {getPreviewUrl()}
        </Typography>
      </Box>
      <RadioGroupInput
        label="Width"
        defaultValue={fullWidth ? "FULL_WIDTH" : "AUTO"}
        onChange={(v) =>
          updateData({
            ...data,
            props: { ...data.props, fullWidth: v === "FULL_WIDTH" },
          })
        }
      >
        <ToggleButton value="FULL_WIDTH">Full</ToggleButton>
        <ToggleButton value="AUTO">Auto</ToggleButton>
      </RadioGroupInput>
      <RadioGroupInput
        label="Size"
        defaultValue={size}
        onChange={(size) =>
          updateData({ ...data, props: { ...data.props, size } })
        }
      >
        <ToggleButton value="x-small">Xs</ToggleButton>
        <ToggleButton value="small">Sm</ToggleButton>
        <ToggleButton value="medium">Md</ToggleButton>
        <ToggleButton value="large">Lg</ToggleButton>
      </RadioGroupInput>
      <RadioGroupInput
        label="Style"
        defaultValue={buttonStyle}
        onChange={(buttonStyle) =>
          updateData({ ...data, props: { ...data.props, buttonStyle } })
        }
      >
        <ToggleButton value="rectangle">Rectangle</ToggleButton>
        <ToggleButton value="rounded">Rounded</ToggleButton>
        <ToggleButton value="pill">Pill</ToggleButton>
      </RadioGroupInput>
      <ColorInput
        label="Text color"
        defaultValue={buttonTextColor}
        onChange={(buttonTextColor) =>
          updateData({ ...data, props: { ...data.props, buttonTextColor } })
        }
      />
      <ColorInput
        label="Button color"
        defaultValue={buttonBackgroundColor}
        onChange={(buttonBackgroundColor) =>
          updateData({
            ...data,
            props: { ...data.props, buttonBackgroundColor },
          })
        }
      />
      <MultiStylePropertyPanel
        names={[
          "backgroundColor",
          "fontFamily",
          "fontSize",
          "fontWeight",
          "textAlign",
          "padding",
        ]}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
