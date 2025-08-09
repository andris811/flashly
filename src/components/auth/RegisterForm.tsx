import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Paper, TextField, Button, Typography, Alert, Stack, Link } from "@mui/material";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

type RegisterResponse = { token: string };

export default function RegisterForm() {
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
      const { data } = await API.post<RegisterResponse>("/auth/register", { email, password });
      await login(data.token);
      navigate("/me");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Register failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Create your account
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.currentTarget.value)} required fullWidth autoFocus />
            <TextField label="Password" type="password" value={password}
              onChange={(e) => setPassword(e.currentTarget.value)} required fullWidth />
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" disabled={loading} fullWidth size="large">
              {loading ? "Signing up…" : "Sign up"}
            </Button>
            <Typography variant="body2" textAlign="center">
              Already have an account?{" "}
              <Link component={RouterLink} to="/login">Log in</Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}