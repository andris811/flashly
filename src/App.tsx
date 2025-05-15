import { useState, useEffect } from "react";
import Flashcard from "./components/Flashcard";
import { hskDecks } from "./data/hskDecks";
import BottomControls from "./components/BottomControls";
import AddCardModal from "./components/AddCardModal";
import { IconButton, Button, Stack, LinearProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export type HSKLevel = keyof typeof hskDecks;

function App() {
  const [category, setCategory] = useState<HSKLevel>("hsk1");
  const getDeckData = (name: string) => {
    if (hskDecks[name as HSKLevel]) {
      return hskDecks[name as HSKLevel];
    }
    const stored = localStorage.getItem(`deck::${name}`);
    return stored ? JSON.parse(stored) : [];
  };

  const [deck, setDeck] = useState(hskDecks[category]);
  const [index, setIndex] = useState(0);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTraditional, setShowTraditional] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userDecks, setUserDecks] = useState<string[]>([]);

  const currentCard = deck[index];

  const goPrev = () => index > 0 && setIndex(index - 1);
  const goNext = () => index < deck.length - 1 && setIndex(index + 1);
  const reset = () => setIndex(0);

  const shuffleDeck = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIndex(0);
  };

  const changeCategory = (newCategory: string) => {
    setCategory(newCategory as HSKLevel);
    const newDeck = getDeckData(newCategory);
    setDeck(newDeck);
    setIndex(0);
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
    setCategory("hsk1");
    setDeck(hskDecks["hsk1"]);
    setIndex(0);
  }
};


  useEffect(() => {
    refreshUserDecks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-pink-100 p-4 flex flex-col items-center">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-4 text-gray-800 text-center">
        Flashly
      </h1>

      {/* Flashcard */}
      <div className="mb-4 w-full">
        <Flashcard
          question={currentCard.question}
          answer={currentCard.answer}
          showPinyin={showPinyin}
          showTraditional={showTraditional}
        />
      </div>

      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={((index + 1) / deck.length) * 100}
        className="w-full max-w-xs sm:max-w-sm mb-4 rounded"
      />

      {/* Navigation */}
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

      {/* Reset & Shuffle */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={reset}
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
      />

      <AddCardModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCardAdded={() => {
          refreshUserDecks();
          if (category.startsWith("deck::") || userDecks.includes(category)) {
            const updated = getDeckData(category);
            setDeck(updated);
          }
        }}
        existingDecks={userDecks}
      />
    </div>
  );
}

export default App;
