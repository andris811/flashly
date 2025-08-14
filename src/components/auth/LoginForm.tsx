import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
} from "@mui/material";
import API from "../../services/api";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

type LoginResponse = {
  token: string;
  message?: string;
};

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, status } = await API.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      if (status !== 200 || !data.token) {
        throw new Error(data.message ?? `HTTP ${status}`);
      }

      await login(data.token);

      navigate("/me");
    } catch (err: unknown) {
      let msg = "Login failed";
      if (axios.isAxiosError(err)) {
        const serverMsg =
          (err.response?.data as { message?: string } | undefined)?.message;
        msg = serverMsg ?? `HTTP ${err.response?.status ?? "Error"}`;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Log in to Flashly
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              fullWidth
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? "Logging in…" : "Login"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}