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
import * as XLSX from "xlsx";

type Props = {
  open: boolean;
  onClose: () => void;
  templateId: string;
};

export default function SendEmailDialog({ open, onClose, templateId }: Props) {
  const dispatch = useDispatch<any>();
  const { loading } = useSelector(
    (state: RootState) => state.fileUpload
  );

  const [parsedEmails, setParsedEmails] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const { currentTemplate } = useSelector(
    (state: RootState) => state.templates
  );

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<any>(sheet);
        if (rows.length === 0) {
          toast.error("Empty file");
          return;
        }

        const headers = Object.keys(rows[0]);
        const normalizedHeaders = headers.map((h) => h?.toString().toLowerCase().trim());
        
        const hasOnlyExpectedHeaders =
          normalizedHeaders.length === 2 &&
          normalizedHeaders.includes("name") &&
          normalizedHeaders.includes("email");

        if (!hasOnlyExpectedHeaders) {
          toast.error("The file must contain ONLY 'name' and 'email' columns.");
          return;
        }

        const emailKey = headers.find(h => h.toString().toLowerCase().trim() === "email");
        if (!emailKey) {
          toast.error("Could not find email column");
          return;
        }

        const extractedEmails = rows.map((row) => row[emailKey]).filter((em) => typeof em === "string" && em.trim() !== "");
        setParsedEmails(extractedEmails);
        toast.success(`Parsed ${extractedEmails.length} emails from file`);
      } catch (error) {
        toast.error("Error parsing the file");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSend = () => {
    const allEmails = [...parsedEmails];
    if (email) {
      allEmails.push(email);
    }

    if (allEmails.length === 0) {
      toast.error("Upload XLSX or enter an email");
      return;
    }

    if (!currentTemplate?.subject || !currentTemplate?.htmlBody) {
      toast.error("Template subject and html content are required");
      return;
    }

    dispatch(
      sendEmail({
        emails: allEmails,
        subject: currentTemplate.subject,
        html: currentTemplate.htmlBody,
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
