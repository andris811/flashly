import { useEffect, useState } from "react";
import Flashcard from "./components/Flashcard";
import BottomControls from "./components/BottomControls";
import AddCardModal from "./components/AddCardModal";
import SaveToListModal from "./components/SaveToListModal";

import { hskDecks } from "./data/hskDecks";
import type { HSKLevel } from "./data/hskDecks";

import {
  IconButton,
  Button,
  Stack,
  LinearProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

// Define the card structure
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

function App() {
  const [category, setCategory] = useState<string>("hsk1");
  const [deck, setDeck] = useState<FlashcardData[]>(getDeckData("hsk1"));
  const [index, setIndex] = useState(0);
  const [userDecks, setUserDecks] = useState<string[]>([]);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTraditional, setShowTraditional] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [cardToSave, setCardToSave] = useState<FlashcardData | null>(null);

  function getDeckData(name: string): FlashcardData[] {
    if (Object.prototype.hasOwnProperty.call(hskDecks, name)) {
      return hskDecks[name as HSKLevel];
    }
    const stored = localStorage.getItem(`deck::${name}`);
    return stored ? (JSON.parse(stored) as FlashcardData[]) : [];
  }

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
    setCategory(newCategory);
    setDeck(getDeckData(newCategory));
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

  useEffect(() => {
    refreshUserDecks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-pink-100 p-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-800 text-center">Flashly</h1>

      <div className="mb-4 w-full">
        <Flashcard
          question={currentCard?.question}
          answer={currentCard?.answer}
          showPinyin={showPinyin}
          showTraditional={showTraditional}
          onSaveToList={handleSaveToList}
        />
      </div>

      <LinearProgress
        variant="determinate"
        value={((index + 1) / deck.length) * 100}
        className="w-full max-w-xs sm:max-w-sm mb-4 rounded"
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
    </div>
  );
}

export default App;
