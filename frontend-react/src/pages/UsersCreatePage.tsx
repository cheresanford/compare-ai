import { useState } from "react";
import {
  Alert,
  Button,
  Container,
  FormControlLabel,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { createUser } from "../api/usersApi";

export function UsersCreatePage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createUser({
        email,
        name,
        is_active: isActive,
        nickname: nickname.trim() ? nickname.trim() : undefined,
      });

      setSuccessOpen(true);
      // limpa o form
      setEmail("");
      setName("");
      setNickname("");
      setIsActive(true);
    } catch (err: any) {
      setError(err?.message ?? "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = email.trim().length > 0 && name.trim().length > 0 && !loading;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Criar usuário</Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <TextField
              label="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              fullWidth
              required
            />

            <TextField
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              fullWidth
              required
            />

            <TextField
              label="Nickname (opcional)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              }
              label="Ativo"
            />

            <Button
              type="submit"
              variant="contained"
              disabled={!canSubmit}
            >
              {loading ? "Salvando..." : "Criar"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Snackbar
        open={successOpen}
        autoHideDuration={2500}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          Usuário criado com sucesso ✅
        </Alert>
      </Snackbar>
    </Container>
  );
}
