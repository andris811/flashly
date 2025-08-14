// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   Stack,
//   MenuItem,
//   Typography,
// } from "@mui/material";
// import { useState } from "react";
// import type { FlashcardData } from "../types/Flashcard";

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   existingDecks: string[];
//   card: FlashcardData | null;
//   onSave: (deckName: string, card: FlashcardData) => void;
// };

// const SaveToListModal = ({
//   open,
//   onClose,
//   existingDecks,
//   card,
//   onSave,
// }: Props) => {
//   const [selectedDeck, setSelectedDeck] = useState("");
//   const [customDeck, setCustomDeck] = useState("");

//   const handleSave = () => {
//     const targetDeck = customDeck.trim() || selectedDeck;
//     if (card && targetDeck) {
//       onSave(targetDeck, card);
//       onClose();
//       setSelectedDeck("");
//       setCustomDeck("");
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle>Add card to your list</DialogTitle>
//       <DialogContent>
//         <Stack spacing={2} mt={1}>
//           <Typography variant="body2">Select an existing deck:</Typography>
//           <TextField
//             select
//             fullWidth
//             value={selectedDeck}
//             onChange={(e) => setSelectedDeck(e.target.value)}
//           >
//             {existingDecks.map((name) => (
//               <MenuItem key={name} value={name}>
//                 {name}
//               </MenuItem>
//             ))}
//           </TextField>

//           <Typography variant="body2">Or create a new deck:</Typography>
//           <TextField
//             label="New deck name"
//             fullWidth
//             value={customDeck}
//             onChange={(e) => setCustomDeck(e.target.value)}
//           />
//         </Stack>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose}>Cancel</Button>
//         <Button
//           onClick={handleSave}
//           disabled={!card || (!selectedDeck && !customDeck.trim())}
//         >
//           Save
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default SaveToListModal;

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
import type { FlashcardData } from "../types/Flashcard";
import { getDecks, createDeck, addCard } from "../services/deckService";

type Props = {
  open: boolean;
  onClose: () => void;
  existingDecks: string[];
  card: FlashcardData | null;
  onSave: (deckName: string, card: FlashcardData) => void;
};

type Deck = { _id: string; name: string };

const SaveToListModal = ({
  open,
  onClose,
  existingDecks,
  card,
  onSave,
}: Props) => {
  const [selectedDeck, setSelectedDeck] = useState("");
  const [customDeck, setCustomDeck] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const resolveDeckId = async (name: string): Promise<string> => {
    // 1) Try to find existing deck by name
    const { data } = await getDecks(); // Deck[]
    const found = (data as Deck[]).find((d) => d.name === name);
    if (found?._id) return found._id;

    // 2) Otherwise create it
    const created = await createDeck(name); // Deck
    return (created.data as Deck)._id;
  };

  const handleSave = async () => {
    const targetDeckName = customDeck.trim() || selectedDeck;
    if (!card || !targetDeckName) return;

    setSubmitting(true);
    setErrMsg(null);

    // Try backend first; regardless of outcome, keep your local onSave behavior.
    try {
      const deckId = await resolveDeckId(targetDeckName);
      await addCard(deckId, card);
    } catch (err) {
      console.error("Backend save failed:", err);
      // Non-fatal: still save locally, but inform the user
      setErrMsg("Saved locally. Couldn’t sync to server right now.");
    } finally {
      // Keep existing behavior
      onSave(targetDeckName, card);
      onClose();
      setSelectedDeck("");
      setCustomDeck("");
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Save to deck</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography variant="body2">Select an existing deck:</Typography>
          <TextField
            select
            fullWidth
            value={selectedDeck}
            onChange={(e) => setSelectedDeck(e.target.value)}
            disabled={submitting}
          >
            {existingDecks.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>

          <Typography
            variant="body2"
            sx={{ opacity: 0.7, textAlign: "center" }}
          >
            — or —
          </Typography>

          <TextField
            label="Create new deck"
            placeholder="Enter new deck name"
            fullWidth
            value={customDeck}
            onChange={(e) => setCustomDeck(e.target.value)}
            disabled={submitting}
          />

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
          onClick={handleSave}
          disabled={
            submitting || !card || (!selectedDeck && !customDeck.trim())
          }
        >
          {submitting ? "Saving…" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveToListModal;
