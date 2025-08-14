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
import { getDecks, createDeck, addCard } from "../services/deckService"; // backend sync

type AddCardModalProps = {
  open: boolean;
  onClose: () => void;
  onCardAdded: () => void;
  existingDecks: string[]; // include custom + built-in deck names
};

type Deck = { _id: string; name: string }; // minimal local type

const AddCardModal = ({
  open,
  onClose,
  onCardAdded,
  existingDecks,
}: AddCardModalProps) => {
  const [deck, setDeck] = useState("mydeck");
  const [customDeck, setCustomDeck] = useState("");
  const [front, setFront] = useState([""]);
  const [back, setBack] = useState([""]);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

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
    setErrMsg(null);
    setSubmitting(false);
  };

  const getFinalDeckName = () => customDeck.trim() || deck;

  // Find deck by name, or create it, and return its _id
  const resolveDeckId = async (name: string): Promise<string> => {
    const { data } = await getDecks(); // Axios style in your project
    const found = (data as Deck[]).find((d) => d.name === name);
    if (found?._id) return found._id;

    const created = await createDeck(name);
    return (created.data as Deck)._id;
  };

  const handleSubmit = async () => {
    const questionFields = front.filter((f) => f.trim() !== "");
    const answerFields = back.filter((b) => b.trim() !== "");
    if (questionFields.length === 0 || answerFields.length === 0) return;

    const newCard = {
      question: questionFields.join(" | "),
      answer: answerFields.join(" | "),
    };

    const targetDeck = getFinalDeckName();
    setSubmitting(true);
    setErrMsg(null);

    // Try backend sync first (non-blocking for local save)
    try {
      const deckId = await resolveDeckId(targetDeck);
      await addCard(deckId, newCard);
    } catch (err) {
      console.error("AddCardModal backend save failed:", err);
      setErrMsg("Saved locally. Couldn’t sync to server right now.");
    } finally {
      // Always keep your existing local behavior:
      const existing = localStorage.getItem(`deck::${targetDeck}`);
      const parsed = existing ? JSON.parse(existing) : [];
      parsed.push(newCard);
      localStorage.setItem(`deck::${targetDeck}`, JSON.stringify(parsed));

      onCardAdded();
      reset();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
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
              disabled={submitting}
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
              disabled={submitting}
            />
          </div>

          {/* Front Fields */}
          <div>
            <Typography variant="subtitle2">
              Card Front (at least one)
            </Typography>
            {front.map((value, i) => (
              <TextField
                key={i}
                label={`Front ${i + 1}`}
                value={value}
                onChange={(e) => updateFront(i, e.target.value)}
                fullWidth
                margin="dense"
                disabled={submitting}
              />
            ))}
            {front.length < 3 && (
              <Button
                onClick={addFrontField}
                size="small"
                disabled={submitting}
              >
                + Add Field
              </Button>
            )}
          </div>

          {/* Back Fields */}
          <div>
            <Typography variant="subtitle2">
              Card Back (at least one)
            </Typography>
            {back.map((value, i) => (
              <TextField
                key={i}
                label={`Back ${i + 1}`}
                value={value}
                onChange={(e) => updateBack(i, e.target.value)}
                fullWidth
                margin="dense"
                disabled={submitting}
              />
            ))}
            {back.length < 3 && (
              <Button onClick={addBackField} size="small" disabled={submitting}>
                + Add Field
              </Button>
            )}
          </div>

          {errMsg && (
            <Typography color="error" variant="body2">
              {errMsg}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            submitting ||
            front.every((f) => f.trim() === "") ||
            back.every((b) => b.trim() === "")
          }
        >
          {submitting ? "Saving…" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCardModal;
