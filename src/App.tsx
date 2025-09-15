import { useEffect, useState, useRef } from "react";
import Flashcard from "./components/Flashcard";
import BottomControls from "./components/BottomControls";
import AddCardModal from "./components/AddCardModal";
import SaveToListModal from "./components/SaveToListModal";
import Footer from "./components/Footer";
import type { FlashcardData } from "../src/types/Flashcard";
import { hskDecks } from "./data/hskDecks";
import type { HSKLevel } from "./data/hskDecks";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

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
  DialogContent,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { getCards } from "./services/deckService";

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

  const [slideshowOn, setSlideshowOn] = useState(false);
  const [slideshowDialogOpen, setSlideshowDialogOpen] = useState(false);
  const [intervalMs, setIntervalMs] = useState<number>(
    Number(localStorage.getItem("slideshow::intervalMs") || 60000)
  );
  // keep a stable timer id that isn't tied to re-renders
  const timerRef = useRef<number | null>(null);
  const frontTimerRef = useRef<number | null>(null); // waits on front
  const backTimerRef = useRef<number | null>(null); // shows back briefly
  const BACK_VIEW_MS = 3000; // how long to show the back (tweak as you like)

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

  const LS_DECK = (name: string) => `deck::${name}`;
  const LS_DECK_ID = (name: string) => `serverDeckId::${name}`;

  const startSlideshow = () => {
    if (slideshowOn || deck.length === 0) return;
    setFlipped(false);
    setSlideshowOn(true);
  };

  const stopSlideshow = () => {
    setSlideshowOn(false);
  };

  const clearTimers = () => {
    if (frontTimerRef.current) {
      window.clearTimeout(frontTimerRef.current);
      frontTimerRef.current = null;
    }
    if (backTimerRef.current) {
      window.clearTimeout(backTimerRef.current);
      backTimerRef.current = null;
    }
  };

  const scheduleNext = () => {
    clearTimers();

    // Wait on the front for the main interval
    frontTimerRef.current = window.setTimeout(() => {
      // Flip to back
      setFlipped(true);

      // After brief back-view, advance to next front
      backTimerRef.current = window.setTimeout(() => {
        if (deck.length === 0) return;
        const nextIndex = index < deck.length - 1 ? index + 1 : 0;
        // goToCard will unflip and then change index after 300ms — perfect
        goToCard(nextIndex);
      }, BACK_VIEW_MS);
    }, intervalMs);
  };

  type ServerCardLike = {
    question: unknown; // we don't assume server shape here
    answer: string | string[]; // matches what FlashcardData expects
  };

  // Map backend Card-ish → FlashcardData (typing only; runtime unchanged)
  function normalizeCards(data: ServerCardLike[]): FlashcardData[] {
    return data.map((c) => ({
      // assert to the UI shape you already render
      question: c.question as FlashcardData["question"],
      answer: c.answer,
    }));
  }

  async function loadDeckFromAnySource(name: string): Promise<FlashcardData[]> {
    // HSK decks live locally
    if (Object.prototype.hasOwnProperty.call(hskDecks, name)) {
      return hskDecks[name as HSKLevel];
    }

    // Try localStorage first
    const raw = localStorage.getItem(LS_DECK(name));
    if (raw) {
      try {
        return JSON.parse(raw) as FlashcardData[];
      } catch {
        // fall through to server fetch
      }
    }

    // Try server by remembered deck id
    const deckId = localStorage.getItem(LS_DECK_ID(name));
    if (deckId) {
      try {
        const { data } = await getCards(deckId);
        const mapped = normalizeCards(data);
        localStorage.setItem(LS_DECK(name), JSON.stringify(mapped));
        return mapped;
      } catch (e) {
        console.error("Failed to fetch server deck:", e);
      }
    }

    // Nothing found
    return [];
  }

  const changeCategory = (newCategory: string) => {
    (async () => {
      const newDeck = await loadDeckFromAnySource(newCategory);

      const savedIndex = parseInt(
        localStorage.getItem(`progress::${newCategory}`) || "0",
        10
      );
      const safeIdx = Math.min(savedIndex, Math.max(newDeck.length - 1, 0));

      localStorage.setItem("lastCategory", newCategory);
      setCategory(newCategory);
      setDeck(newDeck);
      setIndex(safeIdx);
    })();
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

  const navigate = useNavigate();

  const jumpToDeckAndCard = (deckName: string, targetCard: FlashcardData) => {
    const newDeck = getDeckData(deckName);
    const newIndex = newDeck.findIndex(
      (card) => JSON.stringify(card) === JSON.stringify(targetCard)
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

  // If initial category is a server deck and not in localStorage yet, fetch once.
  useEffect(() => {
    (async () => {
      const isHSK = Object.prototype.hasOwnProperty.call(hskDecks, category);
      const hasLocal = !!localStorage.getItem(LS_DECK(category));
      const serverId = localStorage.getItem(LS_DECK_ID(category));

      if (!isHSK && !hasLocal && serverId) {
        try {
          const { data } = await getCards(serverId);
          const mapped = normalizeCards(data);
          localStorage.setItem(LS_DECK(category), JSON.stringify(mapped));
          setDeck(mapped);
          setIndex(0);
        } catch (e) {
          console.error("Initial server deck fetch failed:", e);
        }
      }
    })();
    // run only once for the initial category
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const { user } = useAuth();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [dontShowChecked, setDontShowChecked] = useState(false);

  const DONT_SHOW_KEY = "signupPrompt::dontShow";
  const LAST_SHOWN_KEY = "signupPrompt::lastShown";

  // Store "YYYY-MM-DD" so "once/day" is clean and timezone-safe enough for client UI.
  const todayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    // Only for logged-out users
    if (user) return;

    const dontShow = localStorage.getItem(DONT_SHOW_KEY) === "1";
    if (dontShow) return;

    const lastShown = localStorage.getItem(LAST_SHOWN_KEY);
    const today = todayStr();

    // Show if never shown, or last shown date is not today
    if (lastShown !== today) {
      setShowSignupPrompt(true);
      // record immediately so we don't re-open multiple times in same day
      localStorage.setItem(LAST_SHOWN_KEY, today);
    }
  }, [user]);

  // manage slideshow timers
  useEffect(() => {
    if (slideshowOn && deck.length > 0) {
      scheduleNext();
    }
    return clearTimers;
  }, [slideshowOn, index, deck.length, intervalMs]);

  // pause when tab hidden; resume when visible
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        clearTimers();
      } else if (slideshowOn) {
        scheduleNext();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [slideshowOn, intervalMs, deck.length, index]);

  // pause when tab is hidden; resume when visible
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      } else if (slideshowOn) {
        scheduleNext();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [slideshowOn, intervalMs]);

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
            // enlarge in slideshow
            minHeight: slideshowOn
              ? { xs: "420px", sm: "520px", md: "620px" }
              : { xs: "300px", sm: "350px", md: "420px" },
            maxHeight: slideshowOn
              ? { xs: "600px", sm: "700px", md: "800px" }
              : { xs: "400px", sm: "500px", md: "600px" },
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
          value={deck.length ? ((index + 1) / deck.length) * 100 : 0}
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

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 1 }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={() => setShowResetConfirm(true)}
            fullWidth
            disabled={slideshowOn}
          >
            Reset
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<ShuffleIcon />}
            onClick={shuffleDeck}
            fullWidth
            disabled={slideshowOn}
          >
            Shuffle
          </Button>

          {/* Slideshow play/pause */}
          {!slideshowOn ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<PlayCircleOutlineIcon />}
              onClick={startSlideshow}
              fullWidth
              sx={{
                bgcolor: "#0ea5e9",
                "&:hover": { bgcolor: "#0284c7" },
                boxShadow: "0 6px 14px rgba(2,132,199,0.25)",
              }}
            >
              Slideshow
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              color="warning"
              startIcon={<PauseCircleOutlineIcon />}
              onClick={stopSlideshow}
              fullWidth
              sx={{ boxShadow: "0 6px 14px rgba(251,191,36,0.25)" }}
            >
              Pause
            </Button>
          )}

          {/* Timer settings */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<AccessTimeIcon />}
            onClick={() => setSlideshowDialogOpen(true)}
            fullWidth
          >
            {Math.round(intervalMs / 1000)}s
          </Button>
        </Stack>
      </Box>
      <Dialog
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255)",
              backdropFilter: "blur(8px)",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              maxWidth: 500,
              mx: 2,
            },
          },
          backdrop: {
            sx: { backgroundColor: "rgba(17,24,39,0.3)" },
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 800, color: "#0f172a", px: 3, pt: 3, pb: 1 }}
        >
          Reset deck progress and order?
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 0.5 }}>
          <Typography sx={{ color: "#334155" }}>
            This will clear your saved progress for the current deck and remove
            any custom shuffle order. You can’t undo this action.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setShowResetConfirm(false)}
            sx={{ color: "#334155" }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              reset();
              setShowResetConfirm(false);
            }}
            sx={{
              boxShadow: "0 6px 14px rgba(239,68,68,0.25)",
            }}
          >
            Reset
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255)",
              backdropFilter: "blur(8px)",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              maxWidth: 500,
              mx: 2,
            },
          },
          backdrop: {
            sx: { backgroundColor: "rgba(17,24,39,0.3)" },
          },
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, pt: 3 }}
        >
          <PersonAddAlt1Icon sx={{ color: "#0f172a" }} />
          <DialogTitle sx={{ p: 0, m: 0, fontWeight: 800, color: "#0f172a" }}>
            Save your progress across devices
          </DialogTitle>
        </Box>

        <DialogContent sx={{ px: 3, pt: 1.5 }}>
          <Typography sx={{ color: "#334155" }}>
            Create a free account so your decks and progress sync anywhere you
            study.
          </Typography>

          <FormControlLabel
            sx={{
              mt: 2,
              px: 1,
              borderRadius: 1.5,
              backgroundColor: "rgba(255,255,255,0.6)",
            }}
            control={
              <Checkbox
                checked={dontShowChecked}
                onChange={(e) => setDontShowChecked(e.target.checked)}
                size="small"
              />
            }
            label="Don’t show again"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => {
              if (dontShowChecked) localStorage.setItem(DONT_SHOW_KEY, "1");
              setShowSignupPrompt(false);
            }}
            sx={{ color: "#334155" }}
          >
            Maybe later
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (dontShowChecked) localStorage.setItem(DONT_SHOW_KEY, "1");
              setShowSignupPrompt(false);
              navigate("/register");
            }}
            sx={{
              bgcolor: "#0ea5e9",
              "&:hover": { bgcolor: "#0284c7" },
              boxShadow: "0 6px 14px rgba(2,132,199,0.25)",
            }}
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={slideshowDialogOpen}
        onClose={() => setSlideshowDialogOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255)",
              backdropFilter: "blur(8px)",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              maxWidth: 460,
              mx: 2,
            },
          },
          backdrop: {
            sx: { backgroundColor: "rgba(17,24,39,0.3)" },
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 800, color: "#0f172a", px: 3, pt: 3, pb: 1 }}
        >
          Slideshow timing
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 0.5 }}>
          <Stack spacing={1.5}>
            <Button
              variant={intervalMs === 15000 ? "contained" : "outlined"}
              onClick={() => setIntervalMs(15000)}
            >
              Every 15 seconds
            </Button>
            <Button
              variant={intervalMs === 30000 ? "contained" : "outlined"}
              onClick={() => setIntervalMs(30000)}
            >
              Every 30 seconds
            </Button>
            <Button
              variant={intervalMs === 60000 ? "contained" : "outlined"}
              onClick={() => setIntervalMs(60000)}
            >
              Every 1 minute
            </Button>
            <Button
              variant={intervalMs === 120000 ? "contained" : "outlined"}
              onClick={() => setIntervalMs(120000)}
            >
              Every 2 minutes
            </Button>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setSlideshowDialogOpen(false)}
            sx={{ color: "#334155" }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              localStorage.setItem("slideshow::intervalMs", String(intervalMs));
              setSlideshowDialogOpen(false);
              if (slideshowOn) {
                // reschedule immediately with new interval
                if (timerRef.current) {
                  window.clearTimeout(timerRef.current);
                  timerRef.current = null;
                }
                scheduleNext();
              }
            }}
            sx={{
              bgcolor: "#0ea5e9",
              "&:hover": { bgcolor: "#0284c7" },
              boxShadow: "0 6px 14px rgba(2,132,199,0.25)",
            }}
          >
            Save
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
