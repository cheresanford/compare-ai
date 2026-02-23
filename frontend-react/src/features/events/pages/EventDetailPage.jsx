import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useEventsApi } from "../providers/EventsApiProvider";
import { toDisplayDateTime } from "../utils/date";

function Row({ label, value }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
      <Typography fontWeight={600} minWidth={180}>{label}:</Typography>
      <Typography>{value}</Typography>
    </Stack>
  );
}

export function EventDetailPage() {
  const api = useEventsApi();
  const navigate = useNavigate();
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.findById(id);
        setEvent(response);
      } catch (err) {
        setError(err.message || "Falha ao carregar detalhes");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [api, id]);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await api.remove(id);
      navigate("/events");
    } catch (err) {
      setError(err.message || "Falha ao excluir evento");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Detalhes do evento</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate(`/events/${id}/edit`)}>
            Editar
          </Button>
          <Button color="error" variant="contained" onClick={() => setConfirmOpen(true)}>
            Excluir
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {event && (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Row label="Título" value={event.title} />
            <Row label="Data de início" value={toDisplayDateTime(event.startDate)} />
            <Row label="Data de término" value={toDisplayDateTime(event.endDate)} />
            <Row label="Local" value={event.location} />
            <Row label="Status" value={event.status?.name || "-"} />
            <Row label="E-mail organizador" value={event.user?.email || "-"} />
            <Row label="Nome organizador" value={event.user?.name || "-"} />
            <Row label="Categoria" value={event.category?.name || "Sem categoria"} />
            <Row label="Criado em" value={toDisplayDateTime(event.createdAt)} />
          </Stack>
        </Paper>
      )}

      <Button variant="text" onClick={() => navigate("/events")}>Voltar para lista</Button>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Excluir o evento "{event?.title}" permanentemente?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>Cancelar</Button>
          <Button color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

