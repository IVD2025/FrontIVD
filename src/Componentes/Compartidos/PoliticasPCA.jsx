import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Azul moderno
    },
    secondary: {
      main: "#4caf50", // Verde
    },
    background: {
      default: "#f5f5f5", // Fondo claro
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h6: {
      fontWeight: 600,
      color: "#1976d2",
    },
    body2: {
      color: "#757575",
    },
  },
});

// URL base del backend ajustada al puerto 5000
const API_BASE_URL = "http://localhost:5000";

function PoliticasPCA() {
  const [politicas, setPoliticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchPoliticas = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/politicas`);
        // Formatear las fechas para consistencia
        const formattedPoliticas = response.data.map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt).toLocaleDateString(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : null,
        }));
        setPoliticas(formattedPoliticas);
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener políticas:", err);
        setError("No se pudieron cargar las políticas. Intenta de nuevo más tarde.");
        setLoading(false);
      }
    };

    fetchPoliticas();
  }, []);

  if (loading) return <Typography align="center">Cargando políticas...</Typography>;
  if (error) return <Typography align="center" color="error">{error}</Typography>;

  return (
    <ThemeProvider theme={theme}>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: isMobile ? 2 : 4,
          backgroundColor: theme.palette.background.default,
          borderTop: "1px solid #e0e0e0",
          mt: "auto", // Empuja el footer al final de la página
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h6" align="center" gutterBottom>
            Políticas de la Empresa
          </Typography>
          <Divider sx={{ my: 2 }} />
          {politicas.length === 0 ? (
            <Typography align="center" color="text.secondary">
              No hay políticas disponibles.
            </Typography>
          ) : (
            <List>
              {politicas.map((politica) => (
                <React.Fragment key={politica._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={politica.titulo}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {politica.contenido}
                          </Typography>
                          {politica.createdAt && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 1 }}
                            >
                              Creado: {politica.createdAt} | Última actualización:{" "}
                              {politica.updatedAt || "N/A"}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default PoliticasPCA;