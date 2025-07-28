import { useEffect, useState } from "react";
import Flashcard from "./components/Flashcard";
import BottomControls from "./components/BottomControls";
import AddCardModal from "./components/AddCardModal";
import SaveToListModal from "./components/SaveToListModal";
import Footer from "./components/Footer";
import type { FlashcardData } from "../src/types/Flashcard";

import { hskDecks } from "./data/hskDecks";
import type { HSKLevel } from "./data/hskDecks";

import {
  IconButton,
  Button,
  Stack,
  LinearProgress,
  Typography,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

function App() {
  const initialCategory = localStorage.getItem("lastCategory") || "hsk1";
  const initialDeck = getDeckData(initialCategory);
  const savedIndex = parseInt(
    localStorage.getItem(`progress::${initialCategory}`) || "0",
    10
  );
  const safeIndex = Math.min(savedIndex, initialDeck.length - 1);

  const [category, setCategory] = useState<string>(initialCategory);
  const [deck, setDeck] = useState<FlashcardData[]>(initialDeck);
  const [index, setIndex] = useState<number>(safeIndex);
  const [userDecks, setUserDecks] = useState<string[]>([]);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTraditional, setShowTraditional] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [cardToSave, setCardToSave] = useState<FlashcardData | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const setIndexWithSave = (newIndex: number) => {
    setIndex(newIndex);
    localStorage.setItem(`progress::${category}`, String(newIndex));
  };

  function getDeckData(name: string): FlashcardData[] {
  const rawDeck = localStorage.getItem(`deck::${name}`);
  const rawOrder = localStorage.getItem(`deckOrder::${name}`);

  // HSK decks – return directly
  if (Object.prototype.hasOwnProperty.call(hskDecks, name)) {
    return hskDecks[name as HSKLevel];
  }

  if (!rawDeck) return [];

  const fullDeck = JSON.parse(rawDeck) as FlashcardData[];

  if (rawOrder) {
    const shuffledDeck = JSON.parse(rawOrder) as FlashcardData[];

    // Merge: add any new cards from fullDeck that aren't in shuffledDeck
    const missingCards = fullDeck.filter(
      (card) =>
        !shuffledDeck.some((c) => JSON.stringify(c) === JSON.stringify(card))
    );

    return [...shuffledDeck, ...missingCards];
  }

  return fullDeck;
}

  const currentCard = deck[index];

  const goToCard = (newIndex: number) => {
    setFlipped(false);
    setTimeout(() => {
      setIndexWithSave(newIndex);
    }, 300);
  };

  const goPrev = () => {
    if (index > 0) goToCard(index - 1);
  };

  const goNext = () => {
    if (index < deck.length - 1) goToCard(index + 1);
  };

  const reset = () => {
    localStorage.removeItem(`progress::${category}`);
    localStorage.removeItem(`deckOrder::${category}`);
    const original = getDeckData(category);
    setDeck(original);
    setIndex(0);
  };

  const shuffleDeck = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    localStorage.setItem(`deckOrder::${category}`, JSON.stringify(shuffled));
    setIndexWithSave(0);
  };

  const changeCategory = (newCategory: string) => {
    const newDeck = getDeckData(newCategory);
    const savedIndex = parseInt(
      localStorage.getItem(`progress::${newCategory}`) || "0",
      10
    );
    const safeIndex = Math.min(savedIndex, newDeck.length - 1);

    localStorage.setItem("lastCategory", newCategory);
    setCategory(newCategory);
    setDeck(newDeck);
    setIndex(safeIndex);
  };

  const refreshUserDecks = () => {
    const keys = Object.keys(localStorage)
      .filter((key) => key.startsWith("deck::"))
      .map((key) => key.replace("deck::", ""));
    setUserDecks(keys);
  };

  const handleDeleteDeck = (deckName: string) => {
    localStorage.removeItem(`deck::${deckName}`);
    refreshUserDecks();
    if (category === deckName) {
      changeCategory("hsk1");
    }
  };

  const handleSaveToList = (card: FlashcardData) => {
    setCardToSave(card);
    setSaveModalOpen(true);
  };

  const handleSaveToDeck = (deckName: string, card: FlashcardData) => {
    const existing = localStorage.getItem(`deck::${deckName}`);
    const parsed: FlashcardData[] = existing ? JSON.parse(existing) : [];
    parsed.push(card);
    localStorage.setItem(`deck::${deckName}`, JSON.stringify(parsed));
    refreshUserDecks();
  };

  const isCustomDeck = !Object.prototype.hasOwnProperty.call(
    hskDecks,
    category
  );

  const deleteCurrentCard = () => {
    if (!isCustomDeck || deck.length === 0) return;

    const updatedDeck = [...deck];
    updatedDeck.splice(index, 1);

    localStorage.setItem(`deck::${category}`, JSON.stringify(updatedDeck));
    setDeck(updatedDeck);

    if (updatedDeck.length === 0) {
      setIndexWithSave(0);
    } else if (index >= updatedDeck.length) {
      setIndexWithSave(updatedDeck.length - 1);
    }
  };

  const jumpToDeckAndCard = (deckName: string, targetCard: FlashcardData) => {
  const newDeck = getDeckData(deckName);
  const newIndex = newDeck.findIndex((card) =>
    JSON.stringify(card) === JSON.stringify(targetCard)
  );

  if (newIndex === -1) {
    alert("Could not find card in selected deck.");
    return;
  }

  setCategory(deckName);
  setDeck(newDeck);
  goToCard(newIndex);
};

  useEffect(() => {
    refreshUserDecks();
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" && index < deck.length - 1) goToCard(index + 1);
    else if (e.key === "ArrowLeft" && index > 0) goToCard(index - 1);
    else if (e.key === "ArrowUp" || e.key === "ArrowDown")
      setFlipped((f) => !f);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, deck.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-pink-100 p-4 flex flex-col items-center">
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          mt: 4,
          mb: 2,
          textAlign: "center",
          color: "#1e293b",
          textShadow: "0 2px 3px rgba(0,0,0,0.15)",
          letterSpacing: "0.05em",
        }}
      >
        Flashly
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          mb: 4,
          color: "#64748b",
          fontWeight: 400,
          fontSize: { xs: "0.9rem", sm: "1.1rem" },
          textAlign: "center",
        }}
      >
        Study smarter, not harder — one card at a time!
      </Typography>

      <Box
        sx={{
          width: "100%",
          pb: { xs: 12, sm: 0 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box mb={4}>
          <Paper
            elevation={3}
            sx={{
              px: 2.5,
              py: 1.5,
              borderRadius: 2,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(6px)",
              border: "1px solid #e2e8f0",
              display: "inline-block",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "#334155", fontWeight: 400 }}
            >
              Studying{" "}
              <Typography
                component="span"
                sx={{ fontWeight: 600, color: "#0f172a" }}
              >
                {category.toUpperCase()}
              </Typography>{" "}
              · Card {index + 1} / {deck.length}
            </Typography>
          </Paper>
        </Box>

        <Box
          sx={{
            width: "100%",
            mb: { xs: 2, sm: 2 },
            mt: { xs: 0, sm: 0 },
            px: { xs: 0, sm: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // flexGrow: { xs: 0, sm: 1 },
            flexGrow: 1,
            minHeight: { xs: "300px", sm: "350px", md: "420px" },
            maxHeight: { xs: "400px", sm: "500px", md: "600px" },
          }}
        >
          {deck.length > 0 ? (
            <Flashcard
              question={currentCard?.question}
              answer={currentCard?.answer}
              showPinyin={showPinyin}
              showTraditional={showTraditional}
              onSaveToList={handleSaveToList}
              flipped={flipped}
              setFlipped={setFlipped}
              onDeleteCard={deleteCurrentCard}
              isDeletable={isCustomDeck}
            />
          ) : (
            <Typography
              variant="h6"
              color="text.secondary"
              align="center"
              sx={{ mt: 6 }}
            >
              No cards left in this deck.
            </Typography>
          )}
        </Box>

        <LinearProgress
          variant="determinate"
          value={((index + 1) / deck.length) * 100}
          className="w-full max-w-xs sm:max-w-sm mb-4 rounded"
          sx={{ mt: 2 }}
        />

        <div className="flex items-center justify-center gap-6 sm:gap-8 mb-4 text-gray-700">
          <IconButton onClick={goPrev} disabled={index === 0}>
            <ArrowBackIcon />
          </IconButton>
          <span className="text-sm font-medium">
            {index + 1} / {deck.length}
          </span>
          <IconButton onClick={goNext} disabled={index === deck.length - 1}>
            <ArrowForwardIcon />
          </IconButton>
        </div>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={() => setShowResetConfirm(true)}
            fullWidth
          >
            Reset
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ShuffleIcon />}
            onClick={shuffleDeck}
            fullWidth
          >
            Shuffle
          </Button>
        </Stack>
      </Box>
      <Dialog
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
      >
        <DialogTitle>Reset deck progress and order?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setShowResetConfirm(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              reset();
              setShowResetConfirm(false);
            }}
          >
            Reset
          </Button>
        </DialogActions>
      </Dialog>
      <BottomControls
        category={category}
        onChangeCategory={changeCategory}
        hskCategories={Object.keys(hskDecks) as HSKLevel[]}
        userCategories={userDecks}
        showPinyin={showPinyin}
        showTraditional={showTraditional}
        togglePinyin={() => setShowPinyin((prev) => !prev)}
        toggleTraditional={() => setShowTraditional((prev) => !prev)}
        onAddCard={() => setIsModalOpen(true)}
        onDeleteDeck={handleDeleteDeck}
        onJumpToDeckAndCard={jumpToDeckAndCard}
        hskDeckData={hskDecks}
      />
      <AddCardModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCardAdded={() => {
          refreshUserDecks();
          const updated = getDeckData(category);
          setDeck(updated);
        }}
        existingDecks={userDecks}
      />
      <SaveToListModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        existingDecks={userDecks}
        card={cardToSave}
        onSave={handleSaveToDeck}
      />
      <div className="hidden sm:block w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default App;
