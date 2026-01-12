import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { uploadFile } from "../../store/fileUploadSlice";
import { sendEmail } from "../../store/emailSlice";
import { RootState } from "../../store/store";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  templateId: string;
};

export default function SendEmailDialog({ open, onClose, templateId }: Props) {
  const dispatch = useDispatch<any>();
  const { uploadedFileUrl, loading } = useSelector(
    (state: RootState) => state.fileUpload
  );

  const [email, setEmail] = useState("");

  const handleFileUpload = (file: File) => {
    dispatch(uploadFile(file))
      .unwrap()
      .then(() => toast.success("File uploaded"))
      .catch(() => toast.error("Upload failed"));
  };

  const handleSend = () => {
    if (!uploadedFileUrl && !email) {
      toast.error("Upload XLSX or enter an email");
      return;
    }

    dispatch(
      sendEmail({
        templateId,
        fileUrl: uploadedFileUrl || undefined,
        emails: email ? [{ email }] : undefined,
      })
    )
      .unwrap()
      .then((res) => {
        toast.success(`Sent: ${res.sent}, Failed: ${res.failed}`);
        onClose();
      })
      .catch((err) => toast.error(err));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Send Email</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography fontSize={13} color="text.secondary">
            Option 1: Upload XLSX (Name, Email)
          </Typography>

          <Button component="label" variant="outlined">
            Upload XLSX
            <input
              hidden
              type="file"
              accept=".xlsx"
              onChange={(e) =>
                e.target.files && handleFileUpload(e.target.files[0])
              }
            />
          </Button>

          <Typography fontSize={13} color="text.secondary">
            Option 2: Send to single email
          </Typography>

          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSend} disabled={loading}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}
