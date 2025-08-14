import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  deckName?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteDeckDialog({
  open,
  deckName,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
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
      <DialogTitle sx={{ fontWeight: 800, color: "#0f172a", px: 3, pt: 3, pb: 1 }}>
        Delete this deck?
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 0.5 }}>
        <Typography sx={{ color: "#334155" }}>
          {deckName ? (
            <>
              You’re about to delete <b>{deckName}</b> and all of its cards. This
              action <b>cannot</b> be undone.
            </>
          ) : (
            <>You’re about to delete this deck and all of its cards. This action cannot be undone.</>
          )}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onCancel} sx={{ color: "#334155" }}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          sx={{ boxShadow: "0 6px 14px rgba(239,68,68,0.25)" }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}