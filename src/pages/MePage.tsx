import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  ListItemButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getDecks,
  createDeck,
  deleteDeck,
  getCards,
} from "../services/deckService";
import Footer from "../components/Footer";
import ConfirmDeleteDeckDialog from "../components/ConfirmDeleteDeckDialog";

// Minimal local types
type Deck = { _id: string; name: string; userId: string };
type Card = {
  _id: string;
  deckId: string;
  question: unknown;
  answer: string | string[];
};

export default function MePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // create deck
  const [newDeckName, setNewDeckName] = useState("");

  // details panel
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [cardsErr, setCardsErr] = useState<string | null>(null);

  // Bridge keys used by the Study page
  const LS_DECK = (name: string) => `deck::${name}`;
  const LS_DECK_ID = (name: string) => `serverDeckId::${name}`;

  const loadDecks = async () => {
    setErrMsg(null);
    setLoadingDecks(true);
    try {
      const { data } = await getDecks();
      setDecks(data as Deck[]);
    } catch (err) {
      console.error("Load decks failed:", err);
      setErrMsg("Couldn’t load decks. Try again.");
    } finally {
      setLoadingDecks(false);
    }
  };

  const [deleteReq, setDeleteReq] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadDecks();
  }, []);

  const handleCreateDeck = async () => {
    const name = newDeckName.trim();
    if (!name) return;
    try {
      await createDeck(name);
      setNewDeckName("");
      await loadDecks();

      // find the created deck so we can mirror its id
      const created = (await getDecks()).data.find(
        (d: Deck) => d.name === name
      ) as Deck | undefined;
      if (created) {
        // create an empty local deck so Study sees it immediately
        if (!localStorage.getItem(LS_DECK(name))) {
          localStorage.setItem(LS_DECK(name), JSON.stringify([]));
        }
        localStorage.setItem(LS_DECK_ID(name), created._id);
      }
    } catch (err) {
      console.error("Create deck failed:", err);
      setErrMsg("Couldn’t create deck right now.");
    }
  };

  // ✅ Unified delete handler (used by the dialog)
  const handleDeleteDeck = async (deckId: string, deckName?: string) => {
    try {
      await deleteDeck(deckId);

      // mirror localStorage cleanup so Study page updates
      if (deckName) {
        localStorage.removeItem(LS_DECK(deckName));
        localStorage.removeItem(LS_DECK_ID(deckName));
      }

      if (selectedDeck?._id === deckId) {
        setSelectedDeck(null);
        setCards([]);
      }

      await loadDecks();
    } catch (err) {
      console.error("Delete deck failed:", err);
      setErrMsg("Couldn’t delete deck.");
    } finally {
      setDeleteReq(null); // close dialog
    }
  };

  const openDeck = async (deck: Deck) => {
    setSelectedDeck(deck);
    setCards([]);
    setCardsErr(null);
    setLoadingCards(true);
    try {
      const { data } = await getCards(deck._id);
      setCards(data as Card[]);
    } catch (err) {
      console.error("Load cards failed:", err);
      setCardsErr("Couldn’t load cards for this deck.");
    } finally {
      setLoadingCards(false);
    }
  };

  const goStudyDeck = (deckName: string, deckId?: string) => {
    localStorage.setItem("lastCategory", deckName);
    if (deckId) localStorage.setItem(LS_DECK_ID(deckName), deckId);
    navigate("/");
  };

  const closeDeck = () => {
    setSelectedDeck(null);
    setCards([]);
    setCardsErr(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-pink-100 p-4 flex flex-col items-center">
      <Box mx="auto" maxWidth={900} width="100%">
        {/* Top bar: back to study + logout */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            mt: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(6px)",
            border: "1px solid #e2e8f0",
          }}
          elevation={3}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              startIcon={<HomeIcon />}
              variant="text"
              onClick={() => navigate("/")}
            >
              Back to Study
            </Button>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              {user?.email}
            </Typography>
            <Button variant="outlined" onClick={logout}>
              Logout
            </Button>
          </Stack>
        </Paper>

        {/* Decks list panel */}
        {!selectedDeck ? (
          <Paper
            sx={{
              p: 3,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(6px)",
              border: "1px solid #e2e8f0",
            }}
            elevation={3}
          >
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                My Decks
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  label="New deck name"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleCreateDeck}
                  disabled={!newDeckName.trim()}
                >
                  Create
                </Button>
              </Stack>

              {errMsg && <Alert severity="error">{errMsg}</Alert>}

              <Divider />

              {loadingDecks ? (
                <Stack alignItems="center" py={4}>
                  <CircularProgress />
                </Stack>
              ) : decks.length === 0 ? (
                <Typography color="text.secondary">No decks yet.</Typography>
              ) : (
                <List>
                  {decks.map((d) => (
                    <ListItem
                      key={d._id}
                      divider
                      secondaryAction={
                        <Stack direction="row" spacing={1}>
                          {/* Show details (with deck id there) */}
                          <IconButton
                            aria-label="view"
                            onClick={() => openDeck(d)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          {/* Delete */}
                          <IconButton
                            aria-label="delete"
                            onClick={() => setDeleteReq({ id: d._id, name: d.name })}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      }
                    >
                      {/* Click row to start studying this deck */}
                      <ListItemButton onClick={() => goStudyDeck(d.name, d._id)}>
                        <ListItemText primary={d.name} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Stack>
          </Paper>
        ) : (
          // Deck details (id visible here)
          <Paper
            sx={{
              p: 3,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(6px)",
              border: "1px solid #e2e8f0",
            }}
            elevation={3}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <IconButton onClick={closeDeck}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={700}>
                {selectedDeck.name} — Cards
              </Typography>
              <Button
                sx={{ ml: "auto" }}
                variant="contained"
                onClick={() => goStudyDeck(selectedDeck.name, selectedDeck._id)}
              >
                Study this deck
              </Button>
            </Stack>

            {/* Deck id only in details */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 2, display: "block" }}
            >
              Deck ID: {selectedDeck._id}
            </Typography>

            {cardsErr && <Alert severity="error">{cardsErr}</Alert>}

            {loadingCards ? (
              <Stack alignItems="center" py={4}>
                <CircularProgress />
              </Stack>
            ) : cards.length === 0 ? (
              <Typography color="text.secondary">No cards yet.</Typography>
            ) : (
              <List>
                {cards.map((c) => (
                  <ListItem key={c._id} divider>
                    <ListItemText
                      primary={
                        Array.isArray(c.answer)
                          ? c.answer.join(" | ")
                          : String(c.answer)
                      }
                      secondary={
                        typeof c.question === "string"
                          ? c.question
                          : JSON.stringify(c.question)
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )}

        {/* Shared, styled delete dialog */}
        <ConfirmDeleteDeckDialog
          open={!!deleteReq}
          deckName={deleteReq?.name}
          onCancel={() => setDeleteReq(null)}
          onConfirm={() => {
            if (deleteReq) handleDeleteDeck(deleteReq.id, deleteReq.name);
          }}
        />
      </Box>

      {/* Footer (same as study page) */}
      <div className="hidden sm:block w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
}