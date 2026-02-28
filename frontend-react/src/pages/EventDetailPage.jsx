import { useEffect, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { deleteEvent, getEvent } from "../services/eventsApi";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getEvent(id);
        setEvent(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleDelete = async () => {
    if (!event) return;
    const confirmed = window.confirm(`Excluir o evento "${event.title}"?`);
    if (!confirmed) return;

    try {
      await deleteEvent(event.id);
      navigate("/eventos");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TeamMeet Planner
          </Typography>
          <Button color="inherit" component={RouterLink} to="/eventos">
            Voltar para lista
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack gap={2}>
                {error && <Alert severity="error">{error}</Alert>}

                {event && (
                  <>
                    <Typography variant="h5">{event.title}</Typography>
                    <Typography color="text.secondary">{event.location}</Typography>
                    <Divider />

                    <Typography>
                      <strong>Início:</strong> {formatDate(event.startDate)}
                    </Typography>
                    <Typography>
                      <strong>Término:</strong> {formatDate(event.endDate)}
                    </Typography>
                    <Typography>
                      <strong>Status:</strong> {event.status}
                    </Typography>
                    <Typography>
                      <strong>Organizador:</strong> {event.organizerName || "-"}
                    </Typography>
                    <Typography>
                      <strong>E-mail:</strong> {event.organizerEmail}
                    </Typography>
                    <Typography>
                      <strong>Categoria:</strong> {event.category?.name || "Sem categoria"}
                    </Typography>

                    <Stack direction="row" justifyContent="flex-end" gap={1}>
                      <Button component={RouterLink} to={`/eventos/${event.id}/edit`}>
                        Editar
                      </Button>
                      <Button color="error" onClick={handleDelete}>
                        Excluir
                      </Button>
                    </Stack>
                  </>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
