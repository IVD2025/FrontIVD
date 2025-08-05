import React, { useState } from 'react';
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
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { useAuth } from '../Autenticacion/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink, Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const ConvocatoriasAtleta = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [convocatorias, setConvocatorias] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [inscribiendo, setInscribiendo] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState(null);
  const [yaInscritos, setYaInscritos] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [modalVistaPreviaOpen, setModalVistaPreviaOpen] = useState(false);

  // Función para calcular edad
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) {
      console.log('❌ No hay fecha de nacimiento');
      return null;
    }
    
    try {
      const hoy = new Date();
      let nacimiento;
      
      if (typeof fechaNacimiento === 'string') {
        nacimiento = new Date(fechaNacimiento);
      } else if (fechaNacimiento instanceof Date) {
        nacimiento = fechaNacimiento;
      } else {
        console.log('❌ Formato de fecha no reconocido:', fechaNacimiento);
        return null;
      }
      
      if (isNaN(nacimiento.getTime())) {
        console.log('❌ Fecha de nacimiento inválida:', fechaNacimiento);
        return null;
      }
      
      if (nacimiento > hoy) {
        console.log('❌ Fecha de nacimiento es futura:', fechaNacimiento);
        return null;
      }
      
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const m = hoy.getMonth() - nacimiento.getMonth();
      
      if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      
      console.log('📅 Edad calculada:', edad, 'para fecha:', fechaNacimiento);
      return edad;
    } catch (error) {
      console.error('❌ Error al calcular edad:', error);
      return null;
    }
  };

  // Función para cargar convocatorias
  const fetchConvocatorias = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      console.log('👤 Datos del usuario:', user);
      
      const edad = calcularEdad(user.fechaNacimiento);
      const genero = (user.sexo || '').toLowerCase();
      
      console.log('📊 Datos calculados:', { edad, genero, fechaNacimiento: user.fechaNacimiento, sexo: user.sexo });
      
      if (edad === null || edad === undefined) {
        setErrorMessage('No se puede determinar tu edad. Verifica que tu fecha de nacimiento esté correcta en tu perfil.');
        setConvocatorias([]);
        return;
      }
      
      if (!genero || genero === '') {
        setErrorMessage('No se puede determinar tu género. Verifica que tu sexo esté registrado en tu perfil.');
        setConvocatorias([]);
        return;
      }
      
      if (edad < 0 || edad > 100) {
        setErrorMessage(`La edad calculada (${edad} años) no es válida. Verifica tu fecha de nacimiento.`);
        setConvocatorias([]);
        return;
      }
      
      console.log('🔍 Buscando convocatorias para:', { edad, genero });
      
      const response = await axios.get(`http://localhost:5000/api/eventos/convocatorias-para-atleta?edad=${edad}&genero=${genero}`);
      
      console.log('📋 Convocatorias encontradas:', response.data);
      
      setConvocatorias(response.data);
      
      if (response.data.length === 0) {
        setErrorMessage(`No hay convocatorias disponibles para tu edad (${edad} años) y género (${genero}).`);
      }
      
    } catch (error) {
      console.error('❌ Error al obtener convocatorias:', error);
      if (error.response?.status === 400) {
        setErrorMessage(error.response.data.message || 'Error en los datos enviados.');
      } else {
        setErrorMessage('Error al cargar las convocatorias. Intente de nuevo.');
      }
      setConvocatorias([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar logo
  const fetchLogo = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/perfilEmpresa');
      setLogoUrl(response.data.logo || '');
    } catch (error) {
      setLogoUrl('');
    }
  };

  // Función para cargar inscripciones
  const fetchInscripciones = async () => {
    try {
      if (!user?.id) return;
      const response = await axios.get(`http://localhost:5000/api/eventos/inscripciones?atletaId=${user.id}`);
      setYaInscritos(response.data.map(i => i.eventoId));
    } catch (error) {
      setYaInscritos([]);
    }
  };

  // Función para cargar todos los datos
  const cargarDatos = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await fetchConvocatorias();
      await fetchLogo();
      await fetchInscripciones();
      setDataLoaded(true);
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
    }
  };

  // Función de debugging para verificar datos del usuario
  const debugUserData = async () => {
    try {
      console.log('🔍 Debugging datos del usuario...');
      console.log('👤 User object completo:', user);
      console.log('🆔 User ID:', user.id);
      console.log('📅 Fecha de nacimiento:', user.fechaNacimiento);
      console.log('👥 Sexo:', user.sexo);
      
      const response = await axios.get(`http://localhost:5000/api/eventos/debug-atleta/${user.id}`);
      console.log('📊 Datos del atleta desde backend:', response.data);
      
      const edadFrontend = calcularEdad(user.fechaNacimiento);
      const edadBackend = response.data.calculos.edadCalculada;
      
      console.log('🔍 Comparación de edades:');
      console.log('  Frontend:', edadFrontend);
      console.log('  Backend:', edadBackend);
      console.log('  ¿Coinciden?', edadFrontend === edadBackend);
      
    } catch (error) {
      console.error('❌ Error en debug:', error);
      console.error('❌ Error details:', error.response?.data);
    }
  };

  // Función de debugging para verificar eventos
  const debugEventos = async () => {
    try {
      console.log('🔍 Debugging eventos...');
      const response = await axios.get('http://localhost:5000/api/eventos/debug-eventos');
      console.log('📊 Datos de eventos desde backend:', response.data);
    } catch (error) {
      console.error('❌ Error en debug eventos:', error);
      console.error('❌ Error details:', error.response?.data);
    }
  };

  // Función para probar filtrado manual
  const probarFiltrado = async () => {
    try {
      const edad = calcularEdad(user.fechaNacimiento);
      const genero = (user.sexo || '').toLowerCase();
      
      console.log('🧪 Probando filtrado manual...');
      console.log('📊 Datos de prueba:', { edad, genero });
      
      if (edad === null || !genero) {
        console.log('❌ Datos insuficientes para prueba');
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/api/eventos/convocatorias-para-atleta?edad=${edad}&genero=${genero}`);
      console.log('✅ Resultado del filtrado:', response.data);
      console.log('📋 Número de convocatorias encontradas:', response.data.length);
      
    } catch (error) {
      console.error('❌ Error en prueba de filtrado:', error);
      console.error('❌ Error details:', error.response?.data);
    }
  };

  // Función para corregir fecha de cierre del evento
  const corregirFechaCierre = async () => {
    try {
      console.log('🔧 Corrigiendo fecha de cierre del evento...');
      
      const response = await axios.get('http://localhost:5000/api/eventos/debug-eventos');
      const eventos = response.data.todosEventos;
      
      if (eventos.length === 0) {
        console.log('❌ No hay eventos para corregir');
        return;
      }
      
      const evento = eventos[0];
      console.log('📋 Evento a corregir:', evento);
      
      const fechaActual = new Date();
      const nuevaFechaCierre = new Date(fechaActual.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      console.log('📅 Nueva fecha de cierre:', nuevaFechaCierre);
      
      const updateResponse = await axios.put(`http://localhost:5000/api/eventos/${evento.id}/actualizar-fecha-cierre`, {
        fechaCierre: nuevaFechaCierre.toISOString()
      });
      
      console.log('✅ Fecha de cierre actualizada:', updateResponse.data);
      
      await fetchConvocatorias();
      
    } catch (error) {
      console.error('❌ Error al corregir fecha de cierre:', error);
      console.error('❌ Error details:', error.response?.data);
    }
  };

  const handleInscribirse = (convocatoria) => {
    setConvocatoriaSeleccionada(convocatoria);
    setModalOpen(true);
  };

  const handleConfirmarInscripcion = async () => {
    setInscribiendo(true);
    try {
      const response = await axios.post('http://localhost:5000/api/eventos/inscripciones', {
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
      await fetchInscripciones();
      await fetchConvocatorias();
      
      const validaciones = response.data.validaciones;
      setErrorMessage(`✅ Inscripción exitosa! 
        Edad validada: ${validaciones.edad} años
        Género: ${validaciones.genero}
        Categoría: ${validaciones.categoria}`);
    } catch (error) {
      setInscribiendo(false);
      setErrorMessage(error.response?.data?.message || 'Error al inscribirse.');
    }
  };

  // Funciones para manejar vista previa
  const handleVerVistaPrevia = (convocatoria) => {
    setConvocatoriaSeleccionada(convocatoria);
    setModalVistaPreviaOpen(true);
  };

  // Función para formatear fechas
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

  // PDF styles profesional (igual al administrador)
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
      color: '#666',
      fontStyle: 'italic'
    },
    saludoSection: {
      marginBottom: 25
    },
    saludoText: {
      fontSize: 12,
      color: '#333',
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
      textTransform: 'uppercase',
      textAlign: 'center'
    },
    detailsSection: {
      marginBottom: 20
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#800020',
      marginBottom: 12,
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
      color: '#333',
      width: 120,
      marginRight: 10
    },
    detailValue: {
      fontSize: 11,
      color: '#333',
      flex: 1
    },
    descriptionSection: {
      marginBottom: 20
    },
    descriptionText: {
      fontSize: 11,
      color: '#333',
      lineHeight: 1.4,
      textAlign: 'justify'
    },
    instructionsSection: {
      marginBottom: 25
    },
    instructionText: {
      fontSize: 10,
      color: '#333',
      marginBottom: 6,
      lineHeight: 1.3
    },
    footer: {
      marginTop: 30,
      paddingTop: 20,
      borderTop: '1px solid #ccc',
      textAlign: 'center'
    },
    footerText: {
      fontSize: 9,
      color: '#666',
      marginBottom: 4
    }
  });

  // Componente PDF profesional (igual al administrador)
  const ConvocatoriaPDF = ({ convocatoria, logoUrl }) => {
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const fechaEvento = convocatoria.fecha ? new Date(convocatoria.fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '';
    
    const fechaCierre = convocatoria.fechaCierre ? new Date(convocatoria.fechaCierre).toLocaleDateString('es-ES', {
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
            <Text style={pdfStyles.eventTitle}>{convocatoria.titulo}</Text>
          </View>

          {/* Detalles del evento */}
          <View style={pdfStyles.detailsSection}>
            <Text style={pdfStyles.sectionTitle}>INFORMACIÓN DEL EVENTO:</Text>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Disciplina:</Text>
              <Text style={pdfStyles.detailValue}>{convocatoria.disciplina}</Text>
            </View>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Categoría:</Text>
              <Text style={pdfStyles.detailValue}>{convocatoria.categoria}</Text>
            </View>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Género:</Text>
              <Text style={pdfStyles.detailValue}>{convocatoria.genero === 'mixto' ? 'Mixto (Masculino y Femenino)' : convocatoria.genero === 'masculino' ? 'Masculino' : 'Femenino'}</Text>
            </View>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Rango de Edad:</Text>
              <Text style={pdfStyles.detailValue}>De {convocatoria.edadMin} a {convocatoria.edadMax} años</Text>
            </View>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Lugar:</Text>
              <Text style={pdfStyles.detailValue}>{convocatoria.lugar}</Text>
            </View>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Fecha del Evento:</Text>
              <Text style={pdfStyles.detailValue}>{fechaEvento}</Text>
            </View>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Hora:</Text>
              <Text style={pdfStyles.detailValue}>{convocatoria.hora}</Text>
            </View>
            
            <View style={pdfStyles.detailRow}>
              <Text style={pdfStyles.detailLabel}>• Fecha Límite de Inscripción:</Text>
              <Text style={pdfStyles.detailValue}>{fechaCierre}</Text>
            </View>
          </View>

          {/* Descripción adicional */}
          {convocatoria.descripcion && (
            <View style={pdfStyles.descriptionSection}>
              <Text style={pdfStyles.sectionTitle}>INFORMACIÓN ADICIONAL:</Text>
              <Text style={pdfStyles.descriptionText}>{convocatoria.descripcion}</Text>
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

  const handleViewDetails = (id) => {
    navigate(`/atleta/convocatorias/${id}`);
  };

  const handleDownload = (url) => {
    window.open(url, '_blank');
  };

  // Verificar si el usuario está autenticado
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh', fontFamily: "'Arial', 'Helvetica', sans-serif" }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#800020', fontWeight: 'bold' }}>
        Convocatorias Disponibles
      </Typography>
      
      {/* Botón para cargar datos */}
      {!dataLoaded && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Button 
            variant="contained" 
            onClick={cargarDatos}
            sx={{ background: '#800020', fontWeight: 'bold' }}
          >
            📋 Cargar Convocatorias
          </Button>
        </Box>
      )}
      
      {/* Botones de debugging temporal */}
      <Box sx={{ textAlign: 'center', mb: 2, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button 
          variant="outlined" 
          onClick={debugUserData}
          sx={{ color: '#800020', borderColor: '#800020' }}
        >
          🔍 Debug Usuario
        </Button>
        <Button 
          variant="outlined" 
          onClick={debugEventos}
          sx={{ color: '#800020', borderColor: '#800020' }}
        >
          📋 Debug Eventos
        </Button>
        <Button 
          variant="outlined" 
          onClick={probarFiltrado}
          sx={{ color: '#800020', borderColor: '#800020' }}
        >
          🧪 Probar Filtrado
        </Button>
        <Button 
          variant="outlined" 
          onClick={corregirFechaCierre}
          sx={{ color: '#800020', borderColor: '#800020' }}
        >
          🔧 Corregir Fecha
        </Button>
      </Box>

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

      {!loading && dataLoaded && (
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
                  key={convocatoria._id || convocatoria.id}
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
                      onClick={() => handleVerVistaPrevia(convocatoria)}
                      sx={{ mr: 1, '&:hover': { backgroundColor: 'rgba(128, 0, 32, 0.1)' } }}
                      title="Ver Vista Previa"
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
                          color="primary"
                          sx={{ '&:hover': { backgroundColor: 'rgba(128, 0, 32, 0.1)' } }}
                          disabled={pdfLoading}
                          title="Descargar PDF"
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

      {convocatorias.length === 0 && !loading && dataLoaded && !errorMessage && (
        <Typography variant="body1" align="center" sx={{ mt: 2, color: '#7A4069' }}>
          No hay convocatorias disponibles.
        </Typography>
      )}

      {/* Modal de vista previa simplificado */}
      <Dialog 
        open={modalVistaPreviaOpen} 
        onClose={() => setModalVistaPreviaOpen(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
            📋 Vista Previa - {convocatoriaSeleccionada?.titulo}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {convocatoriaSeleccionada && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom sx={{ color: '#800020' }}>
                    {convocatoriaSeleccionada.titulo}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderColor: '#800020' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: '#800020' }}>📅 Información General</Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Fecha:</strong> {formatearFecha(convocatoriaSeleccionada.fecha || convocatoriaSeleccionada.createdAt)}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Hora:</strong> {convocatoriaSeleccionada.hora}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Lugar:</strong> {convocatoriaSeleccionada.lugar}
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
                        <strong>Disciplina:</strong> {convocatoriaSeleccionada.disciplina}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Categoría:</strong> {convocatoriaSeleccionada.categoria}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Rango de Edad:</strong> {convocatoriaSeleccionada.edadMin} - {convocatoriaSeleccionada.edadMax} años
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Género:</strong> {convocatoriaSeleccionada.genero}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {convocatoriaSeleccionada.descripcion && (
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ borderColor: '#800020' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#800020' }}>📝 Descripción</Typography>
                        <Typography variant="body2">
                          {convocatoriaSeleccionada.descripcion}
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
                        <strong>ID del Evento:</strong> {convocatoriaSeleccionada._id}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Fecha de Creación:</strong> {formatearFecha(convocatoriaSeleccionada.createdAt)}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Fecha de Cierre:</strong> {formatearFecha(convocatoriaSeleccionada.fechaCierre)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalVistaPreviaOpen(false)} sx={{ color: '#800020' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

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