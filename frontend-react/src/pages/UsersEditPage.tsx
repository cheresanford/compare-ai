import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  Snackbar,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { getUser, updateUser } from "../api/usersApi";

export function UsersEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const userId = useMemo(() => Number(id), [id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [isActive, setIsActive] = useState(true);

  async function load() {
    setError(null);
    setLoading(true);

    try {
      if (!Number.isFinite(userId)) throw new Error("ID inválido");
      const u = await getUser(userId);

      setEmail(u.email ?? "");
      setName(u.name ?? "");
      setNickname(u.nickname ?? "");
      setIsActive(Boolean(u.is_active));
    } catch (err: any) {
      setError(err?.message ?? "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await updateUser(userId, {
        email: email.trim(),
        name: name.trim(),
        nickname: nickname.trim() ? nickname.trim() : null,
        is_active: isActive,
      });

      setSuccessOpen(true);
      // opcional: volta pra lista após salvar
      // navigate("/users");
    } catch (err: any) {
      setError(err?.message ?? "Erro inesperado");
    } finally {
      setSaving(false);
    }
  }

  const canSave = !saving && email.trim() && name.trim();

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Editar usuário #{id}</Typography>
          <Button variant="outlined" onClick={() => navigate("/users")}>
            Voltar
          </Button>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && (
          <Stack component="form" spacing={2} onSubmit={handleSave}>
            <TextField
              label="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Nickname (opcional)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              }
              label="Ativo"
            />

            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" disabled={!canSave}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button type="button" variant="text" onClick={load} disabled={saving}>
                Recarregar
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>

      <Snackbar
        open={successOpen}
        autoHideDuration={2000}
        onClose={() => setSuccessOpen(false)}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          Usuário atualizado ✅
        </Alert>
      </Snackbar>
    </Paper>
  );
}
