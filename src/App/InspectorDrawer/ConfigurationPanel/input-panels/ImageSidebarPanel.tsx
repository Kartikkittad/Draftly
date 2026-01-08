import React, { useState } from "react";
import {
  VerticalAlignBottomOutlined,
  VerticalAlignCenterOutlined,
  VerticalAlignTopOutlined,
  UploadOutlined,
} from "@mui/icons-material";
import {
  Stack,
  ToggleButton,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { ImageProps, ImagePropsSchema } from "@usewaypoint/block-image";
import { toast } from "sonner";

import BaseSidebarPanel from "./helpers/BaseSidebarPanel";
import RadioGroupInput from "./helpers/inputs/RadioGroupInput";
import TextDimensionInput from "./helpers/inputs/TextDimensionInput";
import TextInput from "./helpers/inputs/TextInput";
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel";
import { uploadFile } from "../../../../store/fileUploadSlice";
import type { RootState } from "../../../../store/store";

type ImageSidebarPanelProps = {
  data: ImageProps;
  setData: (v: ImageProps) => void;
};

export default function ImageSidebarPanel({
  data,
  setData,
}: ImageSidebarPanelProps) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.fileUpload);
  const [, setErrors] = useState<Zod.ZodError | null>(null);

  const updateData = (d: unknown) => {
    const res = ImagePropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const publicUrl = await dispatch(uploadFile(file) as any).unwrap();

      updateData({
        ...data,
        props: {
          ...data.props,
          url: publicUrl, // ✅ AUTO-SET SOURCE URL
        },
      });

      toast.success("Image uploaded successfully");
    } catch (err: any) {
      toast.error(err || "Image upload failed");
    }
  };

  return (
    <BaseSidebarPanel title="Image block">
      {/* 🔥 UPLOAD BUTTON */}
      <Button
        variant="outlined"
        component="label"
        startIcon={<UploadOutlined />}
        disabled={loading}
      >
        Upload Image
        <input
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
      </Button>

      {loading && <CircularProgress size={14} />}

      {/* 🔒 READ-ONLY IMAGE URL */}
      {data.props?.url && (
        <TextField
          label="Image URL"
          value={data.props.url}
          fullWidth
          size="small"
          InputProps={{
            readOnly: true,
          }}
        />
      )}

      <TextInput
        label="Alt text"
        defaultValue={data.props?.alt ?? ""}
        onChange={(alt) =>
          updateData({ ...data, props: { ...data.props, alt } })
        }
      />

      <TextInput
        label="Click through URL"
        defaultValue={data.props?.linkHref ?? ""}
        onChange={(v) =>
          updateData({
            ...data,
            props: { ...data.props, linkHref: v || null },
          })
        }
      />

      <Stack direction="row" spacing={2}>
        <TextDimensionInput
          label="Width"
          defaultValue={data.props?.width}
          onChange={(width) =>
            updateData({ ...data, props: { ...data.props, width } })
          }
        />
        <TextDimensionInput
          label="Height"
          defaultValue={data.props?.height}
          onChange={(height) =>
            updateData({ ...data, props: { ...data.props, height } })
          }
        />
      </Stack>

      <RadioGroupInput
        label="Alignment"
        defaultValue={data.props?.contentAlignment ?? "middle"}
        onChange={(contentAlignment) =>
          updateData({
            ...data,
            props: { ...data.props, contentAlignment },
          })
        }
      >
        <ToggleButton value="top">
          <VerticalAlignTopOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="middle">
          <VerticalAlignCenterOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="bottom">
          <VerticalAlignBottomOutlined fontSize="small" />
        </ToggleButton>
      </RadioGroupInput>

      <MultiStylePropertyPanel
        names={["backgroundColor", "textAlign", "padding"]}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
