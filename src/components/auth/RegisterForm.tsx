import { useState, useMemo } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import HomeIcon from "@mui/icons-material/Home";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Footer from "../Footer";

type RegisterResponse = { token: string };

const isValidEmail = (s: string) => /\S+@\S+\.\S+/.test(s);
const MIN_PW = 6;

export default function RegisterForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const emailError = email.length > 0 && !isValidEmail(email);
  const pwError = password.length > 0 && password.length < MIN_PW;
  const canSubmit = isValidEmail(email) && password.length >= MIN_PW && !loading;

  const pwHelper = useMemo(() => {
    if (password.length === 0) return "At least 6 characters";
    if (password.length < MIN_PW) return `Too short (${password.length}/6)`;
    return "Looks good ✓";
  }, [password]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;
    setLoading(true);
    try {
      const { data } = await API.post<RegisterResponse>("/auth/register", {
        email,
        password,
      });
      await login(data.token);
      navigate("/me", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Register failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-pink-100 p-4 flex flex-col items-center">
      <Box mx="auto" maxWidth={480} width="100%">
        {/* Top action */}
        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}>
          <Button
            startIcon={<HomeIcon />}
            variant="text"
            onClick={() => navigate("/")}
          >
            Back to Study
          </Button>
        </Box>

        {/* Header */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mt: 2,
            mb: 1,
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
            mb: 3,
            color: "#64748b",
            fontWeight: 400,
            fontSize: { xs: "0.9rem", sm: "1.1rem" },
            textAlign: "center",
          }}
        >
          Study smarter, not harder — one card at a time!
        </Typography>

        {/* Card */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 480,
            mx: "auto",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(6px)",
            border: "1px solid #e2e8f0",
          }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Create your account
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
                error={emailError}
                helperText={emailError ? "Enter a valid email address" : " "}
              />
              <TextField
                label="Password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
                fullWidth
                error={pwError}
                helperText={pwHelper}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPw((v) => !v)}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button
                type="submit"
                variant="contained"
                disabled={!canSubmit}
                fullWidth
                size="large"
              >
                {loading ? "Signing up…" : "Sign up"}
              </Button>

              <Typography variant="body2" textAlign="center">
                Already have an account?{" "}
                <Link component={RouterLink} to="/login" underline="hover">
                  Log in
                </Link>
              </Typography>
            </Stack>
          </form>
        </Paper>
      </Box>

      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
}