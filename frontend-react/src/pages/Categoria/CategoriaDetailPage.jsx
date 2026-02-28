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
import { deleteEvent } from "../../services/eventsApi";
import {
  deleteCategory,
  getCategory,
} from "../../services/categories/categoriesApi";

export function CategoriaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getCategory(id);
        setCategory(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleDelete = async () => {
    if (!category) return;
    const confirmed = window.confirm(`Excluir a Categoria "${category.name}"?`);
    if (!confirmed) return;

    try {
      await deleteCategory(category.id);
      navigate("/categorias");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TeamMeet Planner - Categoria
          </Typography>
          <Button color="inherit" component={RouterLink} to="/categorias">
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

                {category && (
                  <>
                    <Typography variant="h5">{category.name}</Typography>

                    <Divider />

                    <Stack direction="row" justifyContent="flex-end" gap={1}>
                      <Button
                        component={RouterLink}
                        to={`/categorias/${category.id}/edit`}
                      >
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
