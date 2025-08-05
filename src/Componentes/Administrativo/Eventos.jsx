// components/AgregarEvento.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { PDFDownloadLink, Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { 
  CircularProgress, 
  Typography, 
  Button, 
  Box, 
  Card, 
  CardContent, 
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

const MySwal = withReactContent(Swal);

// Disciplinas extraídas del documento (puedes ajustar según necesidad)
const disciplinas = [
  '75 m. Planos', '150 m. Planos', '300 m. Planos', '600 m. Planos', '2000 m. Planos', '5000 m. Planos', '10000 m. Planos',
  '80 m. con Vallas', '100 m. con Vallas', '110 m. con Vallas', '300 m. con Vallas', '400 m. con Vallas', '2000 m. con obstáculos',
  '3000 m. con obstáculos', '5000 m. Marcha', '3000 m. Marcha', '10000 m. Caminata', 'Salto de Altura', 'Salto de Longitud',
  'Salto Triple', 'Salto con Garrocha', 'Lanzamiento de Disco', 'Lanzamiento de Bala', 'Lanzamiento de Pelota', 'Lanzamiento de Martillo',
  'Lanzamiento de Jabalina', 'Tetratlón', 'Heptatlón', 'Decatlón'
];

// Listas fijas de categorías y sus rangos de edad
const categorias = [
  { nombre: 'Sub-14', min: 12, max: 13 },
  { nombre: 'Sub-16', min: 14, max: 15 },
  { nombre: 'Sub-18', min: 16, max: 17 },
  { nombre: 'Sub-20', min: 18, max: 19 },
  { nombre: 'Sub-23', min: 20, max: 22 },
  { nombre: 'Libre', min: 23, max: 35 }, // Puedes ajustar si hay otra categoría
];
const generos = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'mixto', label: 'Mixto' },
];

const AgregarEvento = () => {
  const [evento, setEvento] = useState({
    titulo: '',
    fecha: '',
    hora: '',
    lugar: '',
    descripcion: '',
    disciplina: '',
    categoria: '',
    edadMin: '',
    edadMax: '',
    genero: 'mixto',
  });
  const [loading, setLoading] = useState(false);
  const [modalParticipantesOpen, setModalParticipantesOpen] = useState(false);
  const [modalEventoOpen, setModalEventoOpen] = useState(false);
  const [participantes, setParticipantes] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [modalPDFOpen, setModalPDFOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  // Cargar eventos al montar el componente
  useEffect(() => {
    cargarEventos();
    fetchLogo();
  }, []);

  const cargarEventos = async () => {
    try {
      setLoadingEventos(true);
      const response = await axios.get('http://localhost:5000/api/eventos');
      setEventos(response.data || []);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      setEventos([]);
      // No mostrar error si es la primera carga
      if (eventos.length > 0) {
        MySwal.fire({
          title: 'Error!',
          text: 'Error al cargar los eventos',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } finally {
      setLoadingEventos(false);
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

  const handleCategoriaChange = (e) => {
    const cat = categorias.find(c => c.nombre === e.target.value);
    setEvento({
      ...evento,
      categoria: cat.nombre,
      edadMin: cat.min,
      edadMax: cat.max,
    });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvento({ ...evento, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validación frontend
    const camposRequeridos = ['titulo', 'fecha', 'hora', 'lugar', 'disciplina', 'categoria', 'genero', 'edadMin', 'edadMax'];
    for (const campo of camposRequeridos) {
      if (!evento[campo] || evento[campo] === '') {
        MySwal.fire({
          title: 'Error!',
          text: 'Todos los campos son requeridos excepto descripción',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return;
      }
    }
    if (isNaN(Number(evento.edadMin)) || isNaN(Number(evento.edadMax))) {
      MySwal.fire({
        title: 'Error!',
        text: 'La edad mínima y máxima deben ser números válidos.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/eventos', evento);
      if (response.status === 201) {
        MySwal.fire({
          title: 'Éxito!',
          text: 'El evento ha sido creado correctamente.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        setEvento({
          titulo: '',
          fecha: '',
          hora: '',
          lugar: '',
          descripcion: '',
          disciplina: '',
          categoria: '',
          edadMin: '',
          edadMax: '',
          genero: 'mixto',
        });
        // Recargar eventos después de crear uno nuevo
        await cargarEventos();
      }
    } catch (error) {
      console.error('Error al crear evento:', error);
      MySwal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Error al crear el evento',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerParticipantes = async (evento) => {
    setEventoSeleccionado(evento);
    setModalParticipantesOpen(true);
    setLoadingParticipantes(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/eventos/inscripciones?eventoId=${evento._id}`);
      setParticipantes(response.data);
    } catch (error) {
      setParticipantes([]);
    } finally {
      setLoadingParticipantes(false);
    }
  };

  const handleVerEvento = (evento) => {
    setEventoSeleccionado(evento);
    setModalEventoOpen(true);
  };

  const handleVerPDF = (evento) => {
    try {
      setPdfLoading(true);
      setEventoSeleccionado(evento);
      setModalPDFOpen(true);
    } catch (error) {
      console.error('Error al abrir modal PDF:', error);
      MySwal.fire({
        title: 'Error!',
        text: 'Error al abrir la convocatoria en PDF',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCerrarPDF = () => {
    try {
      setModalPDFOpen(false);
      // Limpiar el estado después de un pequeño delay para evitar errores
      setTimeout(() => {
        setEventoSeleccionado(null);
      }, 100);
    } catch (error) {
      console.error('Error al cerrar modal PDF:', error);
      setModalPDFOpen(false);
      setEventoSeleccionado(null);
    }
  };

  const obtenerColorEstado = (estado) => {
    return estado ? 'success' : 'error';
  };

  const obtenerTextoEstado = (estado) => {
    return estado ? 'Activo' : 'Cancelado';
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
              • Es obligatorio presentar la convocatoria  oficial el día del evento.
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

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gestión de Eventos</h2>
      
      {/* Formulario para crear evento */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#800020', fontWeight: 'bold' }}>
          📝 Crear Nuevo Evento
        </Typography>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Título</label>
            <input
              type="text"
              name="titulo"
              value={evento.titulo}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Ej. Torneo Nacional Sub-18 2026"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha</label>
            <input
              type="date"
              name="fecha"
              value={evento.fecha}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Hora</label>
            <input
              type="time"
              name="hora"
              value={evento.hora}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Lugar</label>
            <input
              type="text"
              name="lugar"
              value={evento.lugar}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Ej. Estadio Central"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Descripción</label>
            <textarea
              name="descripcion"
              value={evento.descripcion}
              onChange={handleChange}
              style={{ ...styles.input, height: '100px', resize: 'vertical' }}
              placeholder="Detalles del evento (opcional)"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Disciplina</label>
            <select
              name="disciplina"
              value={evento.disciplina}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">Seleccione una disciplina</option>
              {disciplinas.map((disc, index) => (
                <option key={index} value={disc}>{disc}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Categoría</label>
            <select
              name="categoria"
              value={evento.categoria}
              onChange={handleCategoriaChange}
              required
              style={styles.input}
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat, index) => (
                <option key={index} value={cat.nombre}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Edad mínima</label>
            <input
              type="number"
              name="edadMin"
              value={evento.edadMin}
              onChange={handleChange}
              min={12}
              max={35}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Edad máxima</label>
            <input
              type="number"
              name="edadMax"
              value={evento.edadMax}
              onChange={handleChange}
              min={evento.edadMin || 12}
              max={35}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Género</label>
            <select
              name="genero"
              value={evento.genero}
              onChange={handleChange}
              required
              style={styles.input}
            >
              {generos.map((g, index) => (
                <option key={index} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Guardando...' : 'Crear Evento'}
          </button>
        </form>
      </Paper>

      {/* Lista de eventos creados */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#800020', fontWeight: 'bold' }}>
          📋 Eventos Creados
        </Typography>
        
        {loadingEventos ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : eventos.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
            No hay eventos creados aún.
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Evento</strong></TableCell>
                <TableCell><strong>Fecha</strong></TableCell>
                <TableCell><strong>Lugar</strong></TableCell>
                <TableCell><strong>Disciplina</strong></TableCell>
                <TableCell><strong>Categoría</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventos.map((evento) => (
                <TableRow key={evento._id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {evento.titulo}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatearFecha(evento.fecha || evento.createdAt)}</TableCell>
                  <TableCell>{evento.lugar}</TableCell>
                  <TableCell>{evento.disciplina}</TableCell>
                  <TableCell>{evento.categoria}</TableCell>
                  <TableCell>
                    <Chip 
                      label={obtenerTextoEstado(evento.estado)} 
                      color={obtenerColorEstado(evento.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleVerEvento(evento)}
                        color="primary"
                        title="Ver detalles del evento"
                      >
                        <VisibilityIcon />
                      </IconButton>
                            <IconButton 
        size="small" 
        onClick={() => handleVerPDF(evento)}
        color="success"
        title="Ver completo en PDF"
        disabled={pdfLoading}
      >
        {pdfLoading ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleVerParticipantes(evento)}
                        color="secondary"
                        title="Ver participantes"
                      >
                        <PeopleIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Modal de Participantes */}
      <Dialog open={modalParticipantesOpen} onClose={() => setModalParticipantesOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Participantes de "{eventoSeleccionado?.titulo}"</DialogTitle>
        <DialogContent>
          {loadingParticipantes ? (
            <CircularProgress />
          ) : participantes.length === 0 ? (
            <Typography variant="body2" sx={{ textAlign: 'center', p: 2, color: 'text.secondary' }}>
              No hay participantes inscritos en este evento.
            </Typography>
          ) : (
            <List>
              {participantes.map((p, idx) => (
                <ListItem key={idx} divider>
                  <ListItemText
                    primary={p.datosAtleta?.nombreCompleto || 'Nombre no disponible'}
                    secondary={
                      <>
                        <b>Edad:</b> {p.datosAtleta?.edad || 'N/A'} años <br />
                        <b>Género:</b> {p.datosAtleta?.genero || 'N/A'} <br />
                        <b>Fecha de Inscripción:</b> {formatearFecha(p.fechaInscripcion)} <br />
                        <b>Estado:</b> {p.validado ? 'Validado' : 'Pendiente'}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalParticipantesOpen(false)} color="secondary">Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Detalles del Evento */}
      <Dialog open={modalEventoOpen} onClose={() => setModalEventoOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold' }}>
            📋 Detalles del Evento
          </Typography>
        </DialogTitle>
        <DialogContent>
          {eventoSeleccionado && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom sx={{ color: '#800020' }}>
                    {eventoSeleccionado.titulo}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>📅 Información General</Typography>
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
                          label={obtenerTextoEstado(eventoSeleccionado.estado)} 
                          color={obtenerColorEstado(eventoSeleccionado.estado)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>🏃 Información Deportiva</Typography>
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
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>📝 Descripción</Typography>
                        <Typography variant="body2">
                          {eventoSeleccionado.descripcion}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>📊 Información Técnica</Typography>
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
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalEventoOpen(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal PDF del Evento */}
      <Dialog 
        open={modalPDFOpen} 
        onClose={handleCerrarPDF} 
        maxWidth="md" 
        fullWidth
        TransitionProps={{
          onExited: () => {
            // Limpiar el estado cuando el modal se cierre completamente
            try {
              setEventoSeleccionado(null);
            } catch (error) {
              console.error('Error al limpiar estado del modal:', error);
            }
          }
        }}
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
          <Button onClick={handleCerrarPDF} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '20px auto',
    padding: '20px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#800020',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: '500',
    marginBottom: '5px',
    color: '#555',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#800020',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontWeight: 'bold',
  },
  'button:disabled': {
    backgroundColor: '#a0a0a0',
    cursor: 'not-allowed',
  },
};

export default AgregarEvento;