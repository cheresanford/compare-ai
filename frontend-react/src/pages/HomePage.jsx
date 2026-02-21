import { useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const SAYINGS = [
  "Se der certo de primeira, desconfie.",
  "Nada é tão permanente quanto uma gambiarra temporária.",
  "Hoje vai. Amanhã também.",
  "Deploy na sexta? Coragem.",
  "Funciona na minha máquina.",
];

export function HomePage() {
  const saying = useMemo(() => {
    const index = Math.floor(Math.random() * SAYINGS.length);
    return SAYINGS[index];
  }, []);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const testApi = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const traceId = globalThis.crypto?.randomUUID?.();
      const res = await fetch(
        `${apiUrl}/health`,
        traceId ? { headers: { "x-trace-id": traceId } } : undefined,
      );

      const data = await res.json();
      setResponse({ ok: res.ok, status: res.status, data });
    } catch (error) {
      setResponse({ ok: false, status: 0, data: { message: error?.message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Compare AI — React
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card elevation={6}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Página inicial
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {saying}
            </Typography>

            <Button
              variant="contained"
              onClick={testApi}
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={18} color="inherit" /> : null
              }
            >
              {loading ? "Chamando /health..." : "Testar /health do backend"}
            </Button>

            {response && (
              <Alert
                sx={{ mt: 3, wordBreak: "break-word" }}
                severity={response.ok ? "success" : "error"}
              >
                {JSON.stringify(response)}
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              API: {apiUrl}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
