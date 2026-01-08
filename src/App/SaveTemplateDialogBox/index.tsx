import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    subject: string;
    fromEmailUsername: string;
  }) => void;
  isEditMode?: boolean;
  currentTemplate?: any;
  isDuplicateMode?: boolean;
};

export default function SaveTemplateDialog({
  open,
  onClose,
  onSave,
  isEditMode = false,
  currentTemplate = null,
  isDuplicateMode = false,
}: Props) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [fromEmailUsername, setFromEmailUsername] = useState("");

  // Populate fields with current template data when in edit or duplicate mode
  useEffect(() => {
    if (open && (isEditMode || isDuplicateMode) && currentTemplate) {
      if (isDuplicateMode) {
        // For duplicate, add "Copy" suffix to name
        setName(`${currentTemplate.name} - Copy` || "");
      } else {
        setName(currentTemplate.name || "");
      }
      setSubject(currentTemplate.subject || "");
      setFromEmailUsername(currentTemplate.fromEmailUsername || "");
    } else if (open) {
      setName("");
      setSubject("");
      setFromEmailUsername("");
    }
  }, [open, isEditMode, isDuplicateMode, currentTemplate]);

  const handleSubmit = () => {
    onSave({ name, subject, fromEmailUsername });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isDuplicateMode
          ? "Duplicate Template"
          : isEditMode
            ? "Update Template"
            : "Create Template"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Template Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Email Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="From Email Username"
            value={fromEmailUsername}
            onChange={(e) => setFromEmailUsername(e.target.value)}
            placeholder="e.g. EmailMaster Team"
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isDuplicateMode ? "Duplicate" : isEditMode ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
