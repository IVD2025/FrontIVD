import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Fade,
  Slide,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import { People, Groups, BarChart, ArrowForward } from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#800020", // Granada/Vino para fondo y botones
    },
    secondary: {
      main: "#7A4069", // Morado medio para acentos
    },
    background: {
      default: "#FFFFFF", // Fondo blanco puro
      paper: "#F5E8C7", // Beige claro para cards
    },
    text: {
      primary: "#333333", // Gris oscuro para texto principal
      secondary: "#666666", // Gris medio para texto secundario
    },
  },
  typography: {
    fontFamily: "'Arial', 'Helvetica', sans-serif", // Fuente sencilla y profesional
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.3rem",
    },
    body2: {
      fontSize: "1rem",
    },
  },
});

const PaginaPrincipalAdministrativa = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "background.default",
          color: "text.primary",
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography variant="h1" gutterBottom>
                Panel Administrativo
              </Typography>
              <Typography variant="body2">
                Gestiona atletas, clubes y reportes desde un solo lugar.
              </Typography>
            </Box>
          </Fade>

          <Slide in timeout={1000} direction="up">
            <Grid container spacing={3}>
              {[
                { title: "Gestionar Atletas", icon: <People color="primary" /> },
                { title: "Gestionar Clubes", icon: <Groups color="primary" /> },
                { title: "Reportes", icon: <BarChart color="secondary" /> },
              ].map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card elevation={3} sx={{ textAlign: "center", py: 3, backgroundColor: "background.paper" }}>
                    <CardContent>
                      <Box sx={{ mb: 2 }}>{item.icon}</Box>
                      <Typography variant="h6" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Más acciones para administrar de manera sencilla.
                      </Typography>
                      <Button
                        variant="contained"
                        color={index === 2 ? "secondary" : "primary"}
                        endIcon={<ArrowForward />}
                        sx={{ mt: 2 }}
                      >
                        {item.title}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Slide>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default PaginaPrincipalAdministrativa;