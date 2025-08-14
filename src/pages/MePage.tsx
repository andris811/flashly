import { useEffect, useState } from "react";
import { Box, Paper, Typography, Button, List, ListItem, ListItemText } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

type Deck = { _id: string; name: string; userId: string };

export default function MePage() {
  const { user, logout } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get<Deck[]>("/decks");
        setDecks(data);
      } catch {
        // ignore for now
      }
    };
    load();
  }, []);

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", p: 2 }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Your Account</Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>Email: {user?.email}</Typography>
        <Button variant="outlined" color="error" onClick={logout} sx={{ mt: 2 }}>
          Log out
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>My Decks</Typography>
        {decks.length === 0 ? (
          <Typography color="text.secondary">No decks yet.</Typography>
        ) : (
          <List>
            {decks.map((d) => (
              <ListItem key={d._id} disableGutters divider>
                <ListItemText primary={d.name} secondary={`id: ${d._id}`} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}