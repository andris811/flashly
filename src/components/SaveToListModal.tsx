import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  MenuItem,
  Typography,
} from "@mui/material";
import { useState } from "react";

type FlashcardData = {
  question:
    | {
        simplified: string;
        traditional?: string;
        pinyin?: string;
      }
    | string;
  answer: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  existingDecks: string[];
  card: FlashcardData | null;
  onSave: (deckName: string, card: FlashcardData) => void;
};

const SaveToListModal = ({
  open,
  onClose,
  existingDecks,
  card,
  onSave,
}: Props) => {
  const [selectedDeck, setSelectedDeck] = useState("");
  const [customDeck, setCustomDeck] = useState("");

  const handleSave = () => {
    const targetDeck = customDeck.trim() || selectedDeck;
    if (card && targetDeck) {
      onSave(targetDeck, card);
      onClose();
      setSelectedDeck("");
      setCustomDeck("");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add card to your list</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography variant="body2">Select an existing deck:</Typography>
          <TextField
            select
            fullWidth
            value={selectedDeck}
            onChange={(e) => setSelectedDeck(e.target.value)}
          >
            {existingDecks.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>

          <Typography variant="body2">Or create a new deck:</Typography>
          <TextField
            label="New deck name"
            fullWidth
            value={customDeck}
            onChange={(e) => setCustomDeck(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={!card || (!selectedDeck && !customDeck.trim())}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveToListModal;
