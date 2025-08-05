import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../Autenticacion/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink, Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const EventosAtleta = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [modalEventoOpen, setModalEventoOpen] = useState(false);
  const [modalPDFOpen, setModalPDFOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar eventos al montar el componente
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchEventos();
      fetchLogo();
      fetchInscripciones();
    }
  }, [user, navigate]);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      const response = await axios.get('http://localhost:5000/api/eventos/atleta');
      setEventos(response.data || []);
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      setErrorMessage('Error al cargar los eventos. Intente de nuevo.');
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
      const response = await axios.get(`http://localhost:5000/api/eventos/inscripciones?atletaId=${user.id}`);
      setInscripciones(response.data || []);
    } catch (error) {
      console.error('Error al obtener inscripciones:', error);
    }
  };

  const handleVerEvento = (evento) => {
    setEventoSeleccionado(evento);
    setModalEventoOpen(true);
  };

  const handleCloseModalEvento = () => {
    setModalEventoOpen(false);
    setTimeout(() => {
      setEventoSeleccionado(null);
    }, 100);
  };

  const handleVerPDF = (evento) => {
    setEventoSeleccionado(evento);
    setModalPDFOpen(true);
  };

  const handleInscribirse = async (evento) => {
    try {
      setInscribiendo(true);
      
      const inscripcionData = {
        eventoId: evento._id,
        atletaId: user.id,
        datosAtleta: {
          nombre: user.nombre,
          apellidoPaterno: user.apellidopa,
          apellidoMaterno: user.apellidoma,
          curp: user.curp,
          fechaNacimiento: user.fechaNacimiento,
          sexo: user.sexo
        }
      };

      const response = await axios.post('http://localhost:5000/api/eventos/inscripciones', inscripcionData);
      
      setSnackbar({
        open: true,
        message: '¡Inscripción exitosa! Ya estás registrado para participar.',
        severity: 'success'
      });

      // Actualizar la lista de inscripciones
      await fetchInscripciones();
      
    } catch (error) {
      console.error('Error al inscribirse:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al inscribirse. Intente de nuevo.',
        severity: 'error'
      });
    } finally {
      setInscribiendo(false);
    }
  };

  const isInscrito = (eventoId) => {
    return inscripciones.some(inscripcion => inscripcion.eventoId === eventoId);
  };

  const isConvocatoriaCerrada = (evento) => {
    const fechaActual = new Date();
    const fechaCierre = new Date(evento.fechaCierre);
    return fechaActual > fechaCierre;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // PDF styles
  const pdfStyles = StyleSheet.create({
    page: { 
      padding: 40, 
      fontFamily: 'Helvetica',
      backgroundColor: '#ffffff'
    },
    header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 30,
      borderBottom: '2px solid #800020',
      paddingBottom: 20
    },
    logo: { 
      width: 80, 
      height: 80, 
      marginRight: 20 
    },
    headerText: {
      flex: 1
    },
    institutionTitle: { 
      fontSize: 18, 
      fontWeight: 'bold', 
      color: '#800020', 
      marginBottom: 4,
      textAlign: 'center'
    },
    institutionSubtitle: { 
      fontSize: 12, 
      color: '#666', 
      marginBottom: 8,
      textAlign: 'center'
    },
    documentTitle: { 
      fontSize: 16, 
      fontWeight: 'bold', 
      color: '#800020', 
      textAlign: 'center',
      textTransform: 'uppercase'
    },
    dateSection: {
      marginBottom: 20,
      textAlign: 'right'
    },
    dateText: {
      fontSize: 12,
      color: '#666'
    },
    saludoSection: {
      marginBottom: 20
    },
    saludoText: {
      fontSize: 12,
      lineHeight: 1.5,
      textAlign: 'justify'
    },
    mainSection: {
      marginBottom: 25,
      textAlign: 'center'
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#800020',
      textTransform: 'uppercase'
    },
    detailsSection: {
      marginBottom: 20
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#800020',
      marginBottom: 10,
      textTransform: 'uppercase'
    },
    detailRow: {
      flexDirection: 'row',
      marginBottom: 8,
      alignItems: 'flex-start'
    },
    detailLabel: {
      fontSize: 11,
      fontWeight: 'bold',
      width: 120,
      color: '#333'
    },
    detailValue: {
      fontSize: 11,
      flex: 1,
      color: '#666'
    },
    descriptionSection: {
      marginBottom: 20
    },
    descriptionText: {
      fontSize: 11,
      lineHeight: 1.4,
      textAlign: 'justify',
      color: '#666'
    },
    instructionsSection: {
      marginBottom: 20
    },
    instructionText: {
      fontSize: 10,
      lineHeight: 1.3,
      marginBottom: 5,
      color: '#666'
    },
    footer: {
      marginTop: 30,
      paddingTop: 20,
      borderTop: '1px solid #ddd',
      textAlign: 'center'
    },
    footerText: {
      fontSize: 9,
      color: '#999',
      marginBottom: 5
    }
  });

  const EventoPDF = ({ evento, logoUrl }) => {
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const fechaEvento = evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '';
    
    const fechaCierre = evento.fechaCierre ? new Date(evento.fechaCierre).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '';

    return (
      <Document>
        <Page size="A4" style={pdfStyles.page}>
          {/* Encabezado con logo y datos institucionales */}
          <View style={pdfStyles.header}>
            {logoUrl && <Image src={logoUrl} style={pdfStyles.logo} />}
            <View style={pdfStyles.headerText}>
              <Text style={pdfStyles.institutionTitle}>INSTITUTO VERACRUZANO DEL DEPORTE</Text>
              <Text style={pdfStyles.institutionSubtitle}>Gobierno del Estado de Veracruz</Text>
              <Text style={pdfStyles.documentTitle}>CONVOCATORIA OFICIAL</Text>
            </View>
          </View>

          {/* Fecha del documento */}
          <View style={pdfStyles.dateSection}>
            <Text style={pdfStyles.dateText}>Veracruz, Ver. a {fechaActual}</Text>
          </View>

          {/* Saludo y presentación */}
          <View style={pdfStyles.saludoSection}>
            <Text style={pdfStyles.saludoText}>
              El Instituto Veracruzano del Deporte, a través de la presente convocatoria, invita a todos los atletas interesados a participar en el siguiente evento deportivo:
            </Text>
          </View>

          {/* Información principal del evento */}
          <View style={pdfStyles.mainSection}>
            <Text style={pdfStyles.eventTitle}>{evento.titulo}</Text>
          </View>

          {/* Detalles del evento */}
          <View style={pdfStyles.detailsSection}>
            <Text style={pdfStyles.sectionTitle}>INFORMACIÓN DEL EVENTO:</Text>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Disciplina:</Text>
              <Text style={pdfStyles.detailValue}>{evento.disciplina}</Text>
            </View>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Categoría:</Text>
              <Text style={pdfStyles.detailValue}>{evento.categoria}</Text>
            </View>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Género:</Text>
              <Text style={pdfStyles.detailValue}>{evento.genero === 'mixto' ? 'Mixto (Masculino y Femenino)' : evento.genero === 'masculino' ? 'Masculino' : 'Femenino'}</Text>
            </View>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Rango de Edad:</Text>
              <Text style={pdfStyles.detailValue}>De {evento.edadMin} a {evento.edadMax} años</Text>
            </View>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Lugar:</Text>
              <Text style={pdfStyles.detailValue}>{evento.lugar}</Text>
            </View>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Fecha del Evento:</Text>
              <Text style={pdfStyles.detailValue}>{fechaEvento}</Text>
            </View>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Hora:</Text>
              <Text style={pdfStyles.detailValue}>{evento.hora}</Text>
            </View>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Fecha Límite de Inscripción:</Text>
              <Text style={pdfStyles.detailValue}>{fechaCierre}</Text>
            </View>
          </View>

          {/* Descripción adicional */}
          {evento.descripcion && (
            <View style={pdfStyles.descriptionSection}>
              <Text style={pdfStyles.sectionTitle}>INFORMACIÓN ADICIONAL:</Text>
              <Text style={pdfStyles.descriptionText}>{evento.descripcion}</Text>
            </View>
          )}

          {/* Instrucciones */}
          <View style={pdfStyles.instructionsSection}>
            <Text style={pdfStyles.sectionTitle}>INSTRUCCIONES:</Text>
            <Text style={pdfStyles.instructionText}>
              • Los interesados deberán registrarse a través de la plataforma oficial del Instituto Veracruzano del Deporte.
            </Text>
            <Text style={pdfStyles.instructionText}>
              • Es obligatorio presentar la convocatoria oficial el día del evento.
            </Text>
            <Text style={pdfStyles.instructionText}>
              • Se recomienda llegar con 30 minutos de anticipación.
            </Text>
            <Text style={pdfStyles.instructionText}>
              • Para mayor información, consultar la página web oficial o contactar a la dirección de deportes.
            </Text>
          </View>

          {/* Pie de página */}
          <View style={pdfStyles.footer}>
            <Text style={pdfStyles.footerText}>
              Esta convocatoria es oficial y ha sido emitida por el Instituto Veracruzano del Deporte.
            </Text>
            <Text style={pdfStyles.footerText}>
              Documento generado el {fechaActual}
            </Text>
          </View>
        </Page>
      </Document>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#800020' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh', fontFamily: "'Arial', 'Helvetica', sans-serif" }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#800020', fontWeight: 'bold' }}>
        Próximos Eventos
      </Typography>

      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      <Paper elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
        <Table sx={{ minWidth: 650 }} aria-label="eventos atleta table">
          <TableHead>
            <TableRow>
              {['Fecha', 'Título', 'Disciplina', 'Horario', 'Lugar', 'Estado', 'Acciones'].map((head) => (
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
            {eventos.map((evento) => {
              const inscrito = isInscrito(evento._id);
              const convocatoriaCerrada = isConvocatoriaCerrada(evento);
              
              return (
                <TableRow
                  key={evento._id || evento.id}
                  sx={{ '&:hover': { backgroundColor: '#FAFAFF' }, transition: 'background-color 0.3s' }}
                >
                  <TableCell sx={{ color: '#333333' }}>
                    {evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-ES') : 'Sin fecha'}
                  </TableCell>
                  <TableCell sx={{ color: '#333333', fontWeight: 'bold' }}>{evento.titulo || 'Sin título'}</TableCell>
                  <TableCell sx={{ color: '#333333' }}>{evento.disciplina || 'Sin disciplina'}</TableCell>
                  <TableCell sx={{ color: '#333333' }}>{evento.hora || 'Sin horario'}</TableCell>
                  <TableCell sx={{ color: '#333333' }}>{evento.lugar || 'Sin lugar'}</TableCell>
                  <TableCell>
                    {inscrito ? (
                      <Chip 
                        icon={<CheckCircleIcon />}
                        label="Inscrito" 
                        color="success" 
                        size="small"
                      />
                    ) : convocatoriaCerrada ? (
                      <Chip 
                        label="Cerrada" 
                        color="error" 
                        size="small"
                      />
                    ) : (
                      <Chip 
                        label="Abierta" 
                        color="primary" 
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleVerEvento(evento)}
                        sx={{ '&:hover': { backgroundColor: 'rgba(128, 0, 32, 0.1)' } }}
                        title="Ver detalles"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleVerPDF(evento)}
                        sx={{ '&:hover': { backgroundColor: 'rgba(128, 0, 32, 0.1)' } }}
                        title="Descargar PDF"
                      >
                        <PictureAsPdfIcon />
                      </IconButton>
                      {!inscrito && !convocatoriaCerrada && (
                        <IconButton
                          color="success"
                          onClick={() => handleInscribirse(evento)}
                          disabled={inscribiendo}
                          sx={{ '&:hover': { backgroundColor: 'rgba(128, 0, 32, 0.1)' } }}
                          title="Inscribirse"
                        >
                          {inscribiendo ? <CircularProgress size={20} /> : <PersonAddIcon />}
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {eventos.length === 0 && !errorMessage && (
        <Typography variant="body1" align="center" sx={{ mt: 2, color: '#7A4069' }}>
          No hay eventos disponibles.
        </Typography>
      )}

      {/* Modal de Detalles del Evento */}
      <Dialog 
        open={modalEventoOpen} 
        onClose={handleCloseModalEvento} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
            📋 Detalles del Evento
          </Typography>
        </DialogTitle>
        <DialogContent>
          {eventoSeleccionado ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom sx={{ color: '#800020' }}>
                    {eventoSeleccionado.titulo}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderColor: '#800020' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: '#800020' }}>📅 Información General</Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Fecha:</strong> {formatearFecha(eventoSeleccionado.fecha || eventoSeleccionado.createdAt)}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Hora:</strong> {eventoSeleccionado.hora}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Lugar:</strong> {eventoSeleccionado.lugar}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Estado:</strong> 
                        <Chip 
                          label="Activo" 
                          color="success"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderColor: '#800020' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: '#800020' }}>🏃 Información Deportiva</Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Disciplina:</strong> {eventoSeleccionado.disciplina}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Categoría:</strong> {eventoSeleccionado.categoria}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Rango de Edad:</strong> {eventoSeleccionado.edadMin} - {eventoSeleccionado.edadMax} años
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Género:</strong> {eventoSeleccionado.genero}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {eventoSeleccionado.descripcion && (
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ borderColor: '#800020' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#800020' }}>📝 Descripción</Typography>
                        <Typography variant="body2">
                          {eventoSeleccionado.descripcion}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ borderColor: '#800020' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: '#800020' }}>📊 Información Técnica</Typography>
                      <Typography variant="body2" paragraph>
                        <strong>ID del Evento:</strong> {eventoSeleccionado._id}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Fecha de Creación:</strong> {formatearFecha(eventoSeleccionado.createdAt)}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Fecha de Cierre:</strong> {formatearFecha(eventoSeleccionado.fechaCierre)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Botón de inscripción en el modal */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    {isInscrito(eventoSeleccionado._id) ? (
                      <Chip 
                        icon={<CheckCircleIcon />}
                        label="Ya estás inscrito en este evento" 
                        color="success" 
                        size="large"
                      />
                    ) : isConvocatoriaCerrada(eventoSeleccionado) ? (
                      <Chip 
                        label="La convocatoria ya está cerrada" 
                        color="error" 
                        size="large"
                      />
                    ) : (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<PersonAddIcon />}
                        onClick={() => handleInscribirse(eventoSeleccionado)}
                        disabled={inscribiendo}
                        sx={{
                          backgroundColor: '#800020',
                          '&:hover': { backgroundColor: '#7A4069' },
                          px: 4,
                          py: 1.5
                        }}
                      >
                        {inscribiendo ? 'Inscribiendo...' : 'Inscribirse al Evento'}
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Cargando detalles...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModalEvento} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal PDF del Evento */}
      <Dialog 
        open={modalPDFOpen} 
        onClose={() => setModalPDFOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
            📄 Convocatoria Oficial en PDF - {eventoSeleccionado?.titulo}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {eventoSeleccionado ? (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Haz clic en el botón para descargar la convocatoria oficial en formato PDF
              </Typography>
              <PDFDownloadLink
                document={<EventoPDF evento={eventoSeleccionado} logoUrl={logoUrl} />}
                fileName={`Convocatoria_${eventoSeleccionado.titulo.replace(/\s+/g, '_')}.pdf`}
                style={{
                  textDecoration: 'none',
                  padding: '12px 24px',
                  backgroundColor: '#800020',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  margin: '8px'
                }}
              >
                {({ blob, url, loading, error }) => {
                  if (error) {
                    return (
                      <Box sx={{ color: 'red', mb: 2 }}>
                        Error al generar PDF: {error.message}
                      </Box>
                    );
                  }
                  return loading ? 'Generando Convocatoria...' : '📥 Descargar Convocatoria Oficial';
                }}
              </PDFDownloadLink>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  La convocatoria incluye toda la información oficial del evento con el logo del instituto y redacción profesional
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Cargando convocatoria...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalPDFOpen(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EventosAtleta;