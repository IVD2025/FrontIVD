import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Container,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Ver detalles
import DownloadIcon from '@mui/icons-material/Download'; // Descargar
import { useAuth } from '../Autenticacion/AuthContext'; // Ajusta la ruta
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink, Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const ConvocatoriasAtleta = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [convocatorias, setConvocatorias] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const [inscribiendo, setInscribiendo] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState(null);
  const [yaInscritos, setYaInscritos] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirige si no está autenticado
    } else {
      fetchConvocatorias();
      fetchLogo();
      fetchInscripciones();
    }
  }, [user, navigate]);

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const fetchConvocatorias = async () => {
    try {
      setLoading(true);
      // Calcular edad y género del atleta
      const edad = calcularEdad(user.fechaNacimiento);
      const genero = (user.sexo || '').toLowerCase();
      if (edad === null || isNaN(edad) || !genero) {
        setErrorMessage('No se puede determinar tu edad o género. Verifica tu perfil.');
        setConvocatorias([]);
        setLoading(false);
        return;
      }
      const response = await axios.get(`http://localhost:5000/api/eventos/convocatorias-para-atleta?edad=${edad}&genero=${genero}`);
      setConvocatorias(response.data);
      setErrorMessage('');
    } catch (error) {
      console.error('Error al obtener convocatorias:', error);
      setErrorMessage('Error al cargar las convocatorias. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogo = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/perfilEmpresa');
      setLogoUrl(response.data.logo || '');
    } catch (error) {
      setLogoUrl('');
    }
  };

  const fetchInscripciones = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/inscripciones?atletaId=${user.id}`);
      setYaInscritos(response.data.map(i => i.eventoId));
    } catch (error) {
      setYaInscritos([]);
    }
  };

  const handleInscribirse = (convocatoria) => {
    setConvocatoriaSeleccionada(convocatoria);
    setModalOpen(true);
  };

  const handleConfirmarInscripcion = async () => {
    setInscribiendo(true);
    try {
      await axios.post('http://localhost:5000/api/inscripciones', {
        eventoId: convocatoriaSeleccionada._id,
        atletaId: user.id,
        datosAtleta: {
          nombre: user.nombre,
          apellidopa: user.apellidopa,
          apellidoma: user.apellidoma,
          curp: user.curp,
          club: user.clubId || 'Independiente',
          sexo: user.sexo,
          fechaNacimiento: user.fechaNacimiento,
        },
      });
      setModalOpen(false);
      setInscribiendo(false);
      fetchInscripciones();
      fetchConvocatorias();
      setErrorMessage('Inscripción exitosa.');
    } catch (error) {
      setInscribiendo(false);
      setErrorMessage(error.response?.data?.message || 'Error al inscribirse.');
    }
  };

  // PDF styles
  const pdfStyles = StyleSheet.create({
    page: { padding: 32, fontFamily: 'Helvetica' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    logo: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#800020', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#333', marginBottom: 4 },
    section: { marginBottom: 12 },
    label: { fontWeight: 'bold', color: '#7A4069' },
    value: { color: '#333' },
  });

  const ConvocatoriaPDF = ({ convocatoria, logoUrl }) => (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          {logoUrl && <Image src={logoUrl} style={pdfStyles.logo} />}
          <View>
            <Text style={pdfStyles.title}>Convocatoria Oficial</Text>
            <Text style={pdfStyles.subtitle}>Instituto Veracruzano del Deporte</Text>
          </View>
        </View>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.label}>Evento: <Text style={pdfStyles.value}>{convocatoria.titulo}</Text></Text>
        </View>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.label}>Disciplina: <Text style={pdfStyles.value}>{convocatoria.disciplina}</Text></Text>
        </View>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.label}>Categoría: <Text style={pdfStyles.value}>{convocatoria.categoria}</Text></Text>
        </View>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.label}>Género: <Text style={pdfStyles.value}>{convocatoria.genero}</Text></Text>
        </View>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.label}>Rango de Edad: <Text style={pdfStyles.value}>{convocatoria.edadMin} - {convocatoria.edadMax} años</Text></Text>
        </View>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.label}>Lugar: <Text style={pdfStyles.value}>{convocatoria.lugar}</Text></Text>
        </View>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.label}>Fecha del Evento: <Text style={pdfStyles.value}>{convocatoria.fecha ? new Date(convocatoria.fecha).toLocaleDateString('es-ES') : ''}</Text></Text>
        </View>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.label}>Fecha de Cierre de Convocatoria: <Text style={pdfStyles.value}>{convocatoria.fechaCierre ? new Date(convocatoria.fechaCierre).toLocaleDateString('es-ES') : ''}</Text></Text>
        </View>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.label}>Descripción:</Text>
          <Text style={pdfStyles.value}>{convocatoria.descripcion || 'Sin descripción'}</Text>
        </View>
      </Page>
    </Document>
  );

  const handleViewDetails = (id) => {
    navigate(`/atleta/convocatorias/${id}`); // Navega a detalles
  };

  const handleDownload = (url) => {
    window.open(url, '_blank'); // Abre el enlace de descarga en una nueva pestaña
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh', fontFamily: "'Arial', 'Helvetica', sans-serif" }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#800020', fontWeight: 'bold' }}>
        Convocatorias Disponibles
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      {!loading && (
        <Paper elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
          <Table sx={{ minWidth: 650 }} aria-label="convocatorias atleta table">
            <TableHead>
              <TableRow>
                {['Título', 'Fecha', 'Descripción', 'Acciones'].map((head) => (
                  <TableCell
                    key={head}
                    sx={{ fontWeight: 'bold', color: '#800020', fontSize: '1rem', padding: '16px' }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {convocatorias.map((convocatoria) => (
                <TableRow
                  key={convocatoria.id}
                  sx={{ '&:hover': { backgroundColor: '#FAFAFF' }, transition: 'background-color 0.3s' }}
                >
                  <TableCell sx={{ color: '#333333' }}>{convocatoria.titulo || 'Sin título'}</TableCell>
                  <TableCell sx={{ color: '#333333' }}>
                    {convocatoria.fecha ? new Date(convocatoria.fecha).toLocaleDateString('es-ES') : 'Sin fecha'}
                  </TableCell>
                  <TableCell sx={{ color: '#333333' }}>{convocatoria.descripcion || 'Sin descripción'}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDetails(convocatoria.id)}
                      sx={{ mr: 1, '&:hover': { backgroundColor: 'rgba(128, 0, 32, 0.1)' } }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <PDFDownloadLink
                      document={<ConvocatoriaPDF convocatoria={convocatoria} logoUrl={logoUrl} />}
                      fileName={`Convocatoria_${convocatoria.titulo || 'evento'}.pdf`}
                      style={{ textDecoration: 'none' }}
                    >
                      {({ loading: pdfLoading }) => (
                        <IconButton
                          color="success"
                          sx={{ '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' } }}
                          disabled={pdfLoading}
                        >
                          <DownloadIcon />
                        </IconButton>
                      )}
                    </PDFDownloadLink>
                    {/* Botón Inscribirse */}
                    {new Date(convocatoria.fechaCierre) > new Date() && !yaInscritos.includes(convocatoria._id) && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ ml: 1, background: '#800020', fontWeight: 'bold' }}
                        onClick={() => handleInscribirse(convocatoria)}
                        disabled={inscribiendo}
                      >
                        Inscribirse
                      </Button>
                    )}
                    {yaInscritos.includes(convocatoria._id) && (
                      <Typography variant="caption" sx={{ color: '#7A4069', ml: 1 }}>
                        Ya inscrito
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {convocatorias.length === 0 && !loading && !errorMessage && (
        <Typography variant="body1" align="center" sx={{ mt: 2, color: '#7A4069' }}>
          No hay convocatorias disponibles.
        </Typography>
      )}

      {/* Modal de confirmación de inscripción */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Confirmar Inscripción</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Deseas inscribirte en la convocatoria <b>{convocatoriaSeleccionada?.titulo}</b>?
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <b>Nombre:</b> {user.nombre} {user.apellidopa} {user.apellidoma}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <b>CURP:</b> {user.curp}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <b>Club:</b> {user.clubId ? user.clubId : 'Independiente'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <b>Sexo:</b> {user.sexo}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <b>Fecha de Nacimiento:</b> {user.fechaNacimiento}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} color="secondary">Cancelar</Button>
          <Button onClick={handleConfirmarInscripcion} color="primary" variant="contained" disabled={inscribiendo}>
            {inscribiendo ? 'Inscribiendo...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConvocatoriasAtleta;