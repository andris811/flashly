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

type AddCardModalProps = {
  open: boolean;
  onClose: () => void;
  onCardAdded: () => void;
  existingDecks: string[]; // include custom + built-in deck names
};

const AddCardModal = ({ open, onClose, onCardAdded, existingDecks }: AddCardModalProps) => {
  const [deck, setDeck] = useState("mydeck");
  const [customDeck, setCustomDeck] = useState("");
  const [front, setFront] = useState([""]);
  const [back, setBack] = useState([""]);

  const addFrontField = () => setFront([...front, ""]);
  const addBackField = () => setBack([...back, ""]);

  const updateFront = (index: number, value: string) => {
    const updated = [...front];
    updated[index] = value;
    setFront(updated);
  };

  const updateBack = (index: number, value: string) => {
    const updated = [...back];
    updated[index] = value;
    setBack(updated);
  };

  const reset = () => {
    setDeck("mydeck");
    setCustomDeck("");
    setFront([""]);
    setBack([""]);
  };

  const getFinalDeckName = () => customDeck.trim() || deck;

  const handleSubmit = () => {
    const questionFields = front.filter((f) => f.trim() !== "");
    const answerFields = back.filter((b) => b.trim() !== "");
    if (questionFields.length === 0 || answerFields.length === 0) return;

    const newCard = {
      question: questionFields.join(" | "),
      answer: answerFields.join(" | "),
    };

    const targetDeck = getFinalDeckName();
    const existing = localStorage.getItem(`deck::${targetDeck}`);
    const parsed = existing ? JSON.parse(existing) : [];
    parsed.push(newCard);
    localStorage.setItem(`deck::${targetDeck}`, JSON.stringify(parsed));
    onCardAdded();
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Flashcard</DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={1}>
          {/* Deck Selection */}
          <div>
            <Typography variant="subtitle2" mb={1}>
              Choose existing deck or create new
            </Typography>
            <TextField
              select
              label="Deck"
              value={deck}
              onChange={(e) => setDeck(e.target.value)}
              fullWidth
            >
              {existingDecks.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Or create new deck"
              value={customDeck}
              onChange={(e) => setCustomDeck(e.target.value)}
              fullWidth
              margin="dense"
              placeholder="e.g. Spanish, Math, Quotes..."
            />
          </div>

          {/* Front Fields */}
          <div>
            <Typography variant="subtitle2">Card Front (at least one)</Typography>
            {front.map((value, i) => (
              <TextField
                key={i}
                label={`Front ${i + 1}`}
                value={value}
                onChange={(e) => updateFront(i, e.target.value)}
                fullWidth
                margin="dense"
              />
            ))}
            <Button onClick={addFrontField} size="small">
              + Add Field
            </Button>
          </div>

          {/* Back Fields */}
          <div>
            <Typography variant="subtitle2">Card Back (at least one)</Typography>
            {back.map((value, i) => (
              <TextField
                key={i}
                label={`Back ${i + 1}`}
                value={value}
                onChange={(e) => updateBack(i, e.target.value)}
                fullWidth
                margin="dense"
              />
            ))}
            <Button onClick={addBackField} size="small">
              + Add Field
            </Button>
          </div>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={
            front.every((f) => f.trim() === "") || back.every((b) => b.trim() === "")
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCardModal;
