import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { listCategories } from "../../categories/api/categoriesApi";
import { connectGoogle, disconnectGoogle, getGoogleStatus } from "../../google/api/googleApi";
import { deleteEvent, listEvents } from "../api/eventsApi";
import { EventDetailsDialog } from "../components/EventDetailsDialog";
import { EventFormDialog } from "../components/EventFormDialog";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
}

export function EventsPage() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("startDate");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleStatus, setGoogleStatus] = useState({ connected: false });
  const [googleNotice, setGoogleNotice] = useState("");

  const [formState, setFormState] = useState({
    open: false,
    mode: "create",
    eventId: null,
  });
  const [detailsEventId, setDetailsEventId] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / size)),
    [total, size],
  );

  useEffect(() => {
    let isActive = true;

    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const result = await listEvents({
          page: page + 1,
          size,
          search,
          categoryId: categoryId ? Number(categoryId) : undefined,
          sortBy,
          sortDirection,
        });

        if (!isActive) return;
        setEvents(result.items || []);
        setTotal(result.total || 0);
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || "Erro ao carregar lista de eventos.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isActive = false;
    };
  }, [page, size, search, categoryId, sortBy, sortDirection, reloadToken]);

  useEffect(() => {
    let isActive = true;

    async function loadCategories() {
      try {
        const items = await listCategories();
        if (isActive) {
          setCategories(items || []);
        }
      } catch {
        if (isActive) {
          setCategories([]);
        }
      }
    }

    loadCategories();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadGoogle() {
      try {
        const status = await getGoogleStatus();
        if (isActive) {
          setGoogleStatus(status || { connected: false });
        }
      } catch {
        if (isActive) {
          setGoogleStatus({ connected: false });
        }
      }
    }

    const params = new URLSearchParams(window.location.search);
    const googleParam = params.get("google");
    if (googleParam === "connected") {
      setGoogleNotice("Conectado ao Google Calendar.");
    } else if (googleParam === "error") {
      setGoogleNotice("Falha ao conectar no Google.");
    }

    if (googleParam) {
      params.delete("google");
      window.history.replaceState({}, "", window.location.pathname);
    }

    loadGoogle();

    return () => {
      isActive = false;
    };
  }, []);

  function refreshList() {
    setReloadToken((current) => current + 1);
  }

  function handleOpenCreate() {
    setFormState({ open: true, mode: "create", eventId: null });
  }

  function handleOpenEdit(eventId) {
    setFormState({ open: true, mode: "edit", eventId });
  }

  function handleCloseForm() {
    setFormState((current) => ({ ...current, open: false }));
  }

  function handleSaved() {
    handleCloseForm();
    refreshList();
  }

  async function handleDeleteFromList(eventId) {
    const confirmed = window.confirm("Deseja realmente excluir este evento?");
    if (!confirmed) return;

    try {
      await deleteEvent(eventId);
      refreshList();
    } catch (deleteError) {
      setError(deleteError.message || "Erro ao excluir evento.");
    }
  }

  return (
    <Box>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TeamMeet Planner - Eventos
          </Typography>
          {googleStatus.connected ? (
            <Typography variant="body2" sx={{ mr: 2 }}>
              Google conectado
              {googleStatus.email ? `: ${googleStatus.email}` : ""}
            </Typography>
          ) : null}
          <Button
            component={RouterLink}
            to="/categories"
            variant="outlined"
            color="inherit"
            sx={{ mr: 1 }}
          >
            Categorias
          </Button>
          <Button
            component={RouterLink}
            to="/reports"
            variant="outlined"
            color="inherit"
            sx={{ mr: 1 }}
          >
            Relatorio
          </Button>
          {googleStatus.connected ? (
            <Button
              variant="outlined"
              color="inherit"
              sx={{ mr: 1 }}
              onClick={async () => {
                try {
                  await disconnectGoogle();
                  setGoogleStatus({ connected: false });
                  setGoogleNotice("Desconectado do Google.");
                } catch (logoutError) {
                  setGoogleNotice(
                    logoutError.message || "Falha ao desconectar do Google.",
                  );
                }
              }}
            >
              Desconectar Google
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="inherit"
              sx={{ mr: 1 }}
              onClick={connectGoogle}
            >
              Conectar ao Google
            </Button>
          )}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenCreate}
          >
            Novo Evento
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <TextField
                label="Buscar por titulo"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                size="small"
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={() => {
                  setPage(0);
                  setSearch(searchInput.trim());
                }}
              >
                Buscar
              </Button>
              <Button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPage(0);
                }}
              >
                Limpar
              </Button>
            </Stack>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <FormControl size="small" sx={{ minWidth: 260 }}>
                <InputLabel id="category-filter-label">Categoria</InputLabel>
                <Select
                  labelId="category-filter-label"
                  label="Categoria"
                  value={categoryId}
                  onChange={(event) => {
                    setCategoryId(event.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Todas as categorias</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="sort-by-label">Ordenar por</InputLabel>
                <Select
                  labelId="sort-by-label"
                  label="Ordenar por"
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="startDate">Data de inicio</MenuItem>
                  <MenuItem value="createdAt">Data de criacao</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="sort-direction-label">Direcao</InputLabel>
                <Select
                  labelId="sort-direction-label"
                  label="Direcao"
                  value={sortDirection}
                  onChange={(event) => {
                    setSortDirection(event.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="asc">Ascendente</MenuItem>
                  <MenuItem value="desc">Descendente</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {googleStatus.connected ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                Conectado ao Google Calendar
                {googleStatus.email ? `: ${googleStatus.email}` : ""}
              </Alert>
            ) : null}

            {googleNotice ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {googleNotice}
              </Alert>
            ) : null}

            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Titulo</TableCell>
                  <TableCell>Inicio</TableCell>
                  <TableCell>Termino</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Organizador</TableCell>
                  <TableCell align="right">Acoes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum evento encontrado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}

                {events.map((eventItem) => (
                  <TableRow key={eventItem.id} hover>
                    <TableCell>{eventItem.title}</TableCell>
                    <TableCell>{formatDate(eventItem.startDate)}</TableCell>
                    <TableCell>{formatDate(eventItem.endDate)}</TableCell>
                    <TableCell>{eventItem.status}</TableCell>
                    <TableCell>
                      {eventItem.category?.name || "Sem categoria"}
                    </TableCell>
                    <TableCell>{eventItem.organizer?.name || "-"}</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                      >
                        <Button
                          size="small"
                          onClick={() => setDetailsEventId(eventItem.id)}
                        >
                          Detalhes
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleOpenEdit(eventItem.id)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteFromList(eventItem.id)}
                        >
                          Excluir
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={total}
              page={Math.min(page, totalPages - 1)}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={size}
              onRowsPerPageChange={(event) => {
                setSize(Number(event.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 20, 50]}
            />
          </CardContent>
        </Card>
      </Container>

      <EventFormDialog
        open={formState.open}
        mode={formState.mode}
        eventId={formState.eventId}
        onClose={handleCloseForm}
        onSaved={handleSaved}
      />

      <EventDetailsDialog
        open={Boolean(detailsEventId)}
        eventId={detailsEventId}
        onClose={() => setDetailsEventId(null)}
        onEdit={(eventId) => {
          setDetailsEventId(null);
          handleOpenEdit(eventId);
        }}
        onDeleted={() => {
          setDetailsEventId(null);
          refreshList();
        }}
      />
    </Box>
  );
}
