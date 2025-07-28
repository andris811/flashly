import { useState, useEffect } from "react";
import {
  Box,
  FormControlLabel,
  Switch,
  IconButton,
  Fab,
  Menu,
  MenuItem,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FolderIcon from "@mui/icons-material/Folder";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";
import type { HSKLevel } from "../data/hskDecks";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import SearchIcon from "@mui/icons-material/Search";

type Flashcard = {
  question:
    | string
    | string[]
    | {
        simplified: string;
        traditional?: string;
        pinyin?: string;
      };
  answer: string | string[];
};

type SearchResult = {
  deck: string;
  card: Flashcard;
};

type Props = {
  category: string;
  onChangeCategory: (cat: string) => void;
  hskCategories: HSKLevel[];
  userCategories: string[];
  showPinyin: boolean;
  showTraditional: boolean;
  togglePinyin: () => void;
  toggleTraditional: () => void;
  onAddCard: () => void;
  onDeleteDeck: (deckName: string) => void;
  onJumpToDeckAndCard: (deck: string, card: Flashcard) => void;
  hskDeckData: Record<string, Flashcard[]>;
};

const BottomControls = ({
  category,
  onChangeCategory,
  hskCategories,
  userCategories,
  showPinyin,
  showTraditional,
  togglePinyin,
  toggleTraditional,
  onAddCard,
  onDeleteDeck,
  onJumpToDeckAndCard,
  hskDeckData,
}: Props) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [anchorHSK, setAnchorHSK] = useState<null | HTMLElement>(null);
  const [anchorUser, setAnchorUser] = useState<null | HTMLElement>(null);
  const [anchorOptions, setAnchorOptions] = useState<null | HTMLElement>(null);
  const [confirmDeleteDeck, setConfirmDeleteDeck] = useState<string | null>(
    null
  );
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const layoutStyles: SxProps<Theme> = isMobile
    ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.95)",
        borderTop: "1px solid #ccc",
        padding: "0.5rem 1rem",
      }
    : {
        marginTop: "2rem",
        padding: "0.5rem 2rem",
        borderRadius: "1rem",
        backgroundColor: "rgba(255,255,255,0.85)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        display: "flex",
        gap: "2rem",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      };

  const year = new Date().getFullYear();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const matches: SearchResult[] = [];
    const term = searchTerm.toLowerCase();

    // Custom decks (localStorage)
    const allKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith("deck::")
    );

    for (const key of allKeys) {
      const deckName = key.replace("deck::", "");
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const cards: Flashcard[] = JSON.parse(raw);
        cards.forEach((card) => {
          const q =
            typeof card.question === "string"
              ? card.question
              : Array.isArray(card.question)
              ? card.question.join(" ")
              : card.question?.simplified || "";

          const a = Array.isArray(card.answer)
            ? card.answer.join(" ")
            : String(card.answer);

          const regex = new RegExp(`\\b${term}\\b`, "i");

          if (regex.test(q) || regex.test(a)) {
            matches.push({ deck: deckName, card });
          }
        });
      } catch (err) {
        console.warn(`Skipping malformed deck "${deckName}":`, err);
      }
    }

    // HSK decks
    Object.entries(hskDeckData).forEach(([deckName, cards]) => {
      cards.forEach((card) => {
        const q =
          typeof card.question === "string"
            ? card.question
            : Array.isArray(card.question)
            ? card.question.join(" ")
            : card.question?.simplified || "";

        const a = Array.isArray(card.answer)
          ? card.answer.join(" ")
          : String(card.answer);

        const regex = new RegExp(`\\b${term}\\b`, "i");

        if (regex.test(q) || regex.test(a)) {
          matches.push({ deck: deckName, card });
        }
      });
    });

    setSearchResults(matches);
  }, [searchTerm, hskDeckData]);

  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;

    const allKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith("deck::")
    );

    for (const key of allKeys) {
      const deckName = key.replace("deck::", "");
      const deckData = localStorage.getItem(key);
      if (!deckData) continue;

      let cards: Flashcard[] = [];

      try {
        const parsed = JSON.parse(deckData);
        if (!Array.isArray(parsed)) continue;

        // Validate and cast entries
        cards = parsed.filter(
          (item): item is Flashcard =>
            item &&
            typeof item === "object" &&
            ("question" in item || "answer" in item)
        );
      } catch (err) {
        console.warn(`Error parsing deck ${deckName}:`, err);
        continue;
      }

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        const questionText = Array.isArray(card.question)
          ? card.question.join(" ").toLowerCase()
          : typeof card.question === "string"
          ? card.question.toLowerCase()
          : "";

        const answerText = Array.isArray(card.answer)
          ? card.answer.join(" ").toLowerCase()
          : typeof card.answer === "string"
          ? card.answer.toLowerCase()
          : "";

        const pattern = new RegExp(`\\b${term}\\b`, "i");
        if (pattern.test(questionText) || pattern.test(answerText)) {
          onJumpToDeckAndCard(deckName, card);
          setSearchDialogOpen(false);
          return;
        }
        // console.log("TERM:", term, "Q:", questionText, "A:", answerText);
      }
    }

    // Check HSK decks
    for (const [deckName, cards] of Object.entries(hskDeckData)) {
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        let q = "";

        if (typeof card.question === "string") {
          q = card.question.toLowerCase();
        } else if (Array.isArray(card.question)) {
          q = card.question.join(" ").toLowerCase();
        } else if (
          typeof card.question === "object" &&
          card.question !== null
        ) {
          const {
            simplified = "",
            traditional = "",
            pinyin = "",
          } = card.question;
          q = `${simplified} ${traditional} ${pinyin}`.toLowerCase();
        }

        const a = Array.isArray(card.answer)
          ? card.answer.join(" ").toLowerCase()
          : card.answer.toLowerCase();

        if (q.includes(term) || a.includes(term)) {
          onJumpToDeckAndCard(deckName, card);
          setSearchDialogOpen(false);
          return;
        }
      }
    }

    alert("No matching flashcard found.");
  };

  return (
    <Box sx={layoutStyles}>
      {/* buttons row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          width: "100%",
          gap: "1rem",
        }}
      >
        {/* HSK Decks */}
        <IconButton
          onClick={(e) => setAnchorHSK(e.currentTarget)}
          aria-label="HSK Decks"
        >
          <MenuBookIcon />
        </IconButton>
        <Menu
          anchorEl={anchorHSK}
          open={Boolean(anchorHSK)}
          onClose={() => setAnchorHSK(null)}
        >
          {hskCategories.map((cat) => {
            const label = cat === "hsk79" ? "HSK 7–9" : cat.toUpperCase();
            return (
              <MenuItem
                key={cat}
                selected={cat === category}
                onClick={() => {
                  onChangeCategory(cat);
                  setAnchorHSK(null);
                }}
              >
                {label}
              </MenuItem>
            );
          })}
        </Menu>

        {/* User Decks */}
        <IconButton
          onClick={(e) => setAnchorUser(e.currentTarget)}
          aria-label="User Decks"
        >
          <FolderIcon />
        </IconButton>
        <Menu
          anchorEl={anchorUser}
          open={Boolean(anchorUser)}
          onClose={() => setAnchorUser(null)}
        >
          {userCategories.length === 0 ? (
            <MenuItem disabled>No custom decks yet</MenuItem>
          ) : (
            userCategories.map((cat) => (
              <MenuItem
                key={cat}
                selected={cat === category}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ flexGrow: 1, cursor: "pointer" }}
                  onClick={() => {
                    onChangeCategory(cat);
                    setAnchorUser(null);
                  }}
                >
                  {cat}
                </span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAnchorUser(null);
                    setConfirmDeleteDeck(cat);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </MenuItem>
            ))
          )}
        </Menu>

        {/* Search cards */}
        <IconButton
          onClick={() => setSearchDialogOpen(true)}
          aria-label="Search Flashcards"
        >
          <SearchIcon />
        </IconButton>

        {/* Add Card */}
        <Fab
          color="primary"
          onClick={onAddCard}
          size="medium"
          aria-label="Add Card"
        >
          <AddIcon />
        </Fab>

        {/* Options */}
        <IconButton
          onClick={(e) => setAnchorOptions(e.currentTarget)}
          aria-label="Options"
        >
          <SettingsIcon />
        </IconButton>
        <Menu
          anchorEl={anchorOptions}
          open={Boolean(anchorOptions)}
          onClose={() => setAnchorOptions(null)}
        >
          <MenuItem>
            <FormControlLabel
              control={
                <Switch
                  checked={showPinyin}
                  onChange={togglePinyin}
                  size="small"
                />
              }
              label="Pinyin"
            />
          </MenuItem>
          <MenuItem>
            <FormControlLabel
              control={
                <Switch
                  checked={showTraditional}
                  onChange={toggleTraditional}
                  size="small"
                />
              }
              label="Traditional"
            />
          </MenuItem>
        </Menu>
      </Box>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={!!confirmDeleteDeck}
        onClose={() => setConfirmDeleteDeck(null)}
      >
        <DialogTitle>
          {`Delete deck "${confirmDeleteDeck}"? This cannot be undone.`}
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDeck(null)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              if (confirmDeleteDeck) {
                onDeleteDeck(confirmDeleteDeck);
                setConfirmDeleteDeck(null);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search Dialog */}
      <Dialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Search Flashcards</DialogTitle>
        <DialogContent>
          <TextField
            label="Search term"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
            Matches:
          </Typography>
          <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
            {searchResults.map(({ deck, card }, i) => (
              <Box
                key={i}
                onClick={() => {
                  onJumpToDeckAndCard(deck, card);
                  setSearchDialogOpen(false);
                }}
                sx={{
                  mb: 2,
                  p: 1,
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#f9fafb" },
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Deck: {deck}
                </Typography>
                <Typography variant="body1">
                  Q:{" "}
                  {typeof card.question === "string"
                    ? card.question
                    : Array.isArray(card.question)
                    ? card.question.join(" / ")
                    : card.question?.simplified}
                </Typography>
                <Typography variant="body2">
                  A:{" "}
                  {Array.isArray(card.answer)
                    ? card.answer.join(" / ")
                    : card.answer}
                </Typography>
              </Box>
            ))}

            {searchTerm && searchResults.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No matches found.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialogOpen(false)}>Close</Button>
          <Button onClick={handleSearch}>Search</Button>
        </DialogActions>
      </Dialog>

      {/* Mobile footer */}
      {isMobile && (
        <Box
          sx={{
            width: "100%",
            marginTop: "0.5rem",
            paddingTop: "0.25rem",
            borderTop: "1px solid #ddd",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            fontSize: "0.75rem",
            color: "#999",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#999", fontSize: "0.75rem" }}
          >
            © {year} Flashly |{" "}
            <Link
              href="https://andris811.github.io/avdev/"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: "#999" }}
            >
              AVDev
            </Link>
          </Typography>
          <Box>
            <IconButton
              href="https://github.com/andrasv89"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{ color: "#999" }}
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
            <IconButton
              href="https://linkedin.com/in/andrasv89"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{ color: "#999" }}
            >
              <LinkedInIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BottomControls;
