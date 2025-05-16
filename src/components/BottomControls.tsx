import { useState } from "react";
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
  DialogTitle,
  DialogActions,
  Button,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FolderIcon from "@mui/icons-material/Folder";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";
import type { HSKLevel } from "../data/hskDecks";

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
}: Props) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [anchorHSK, setAnchorHSK] = useState<null | HTMLElement>(null);
  const [anchorUser, setAnchorUser] = useState<null | HTMLElement>(null);
  const [anchorOptions, setAnchorOptions] = useState<null | HTMLElement>(null);
  const [confirmDeleteDeck, setConfirmDeleteDeck] = useState<string | null>(
    null
  );

  const layoutStyles: SxProps<Theme> = isMobile
    ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-around",
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

  return (
    <Box sx={layoutStyles}>
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
    </Box>
  );
};

export default BottomControls;
