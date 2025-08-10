import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../Componentes/Autenticacion/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Badge
} from '@mui/material';
import {
  Person as PersonIcon,
  Sports as SportsIcon,
  Event as EventIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  EmojiEvents as TrophyIcon,
  School as SchoolIcon,
  DirectionsRun as RunIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,

} from '@mui/icons-material';

const PaginaPrincipalAtleta = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [atletaData, setAtletaData] = useState(null);
  const [clubesDisponibles, setClubesDisponibles] = useState([]);
  const [eventosProximos, setEventosProximos] = useState([]);
  const [eventosParticipacion, setEventosParticipacion] = useState([]);

  const [estadisticas, setEstadisticas] = useState({
    totalEventos: 0,
    eventosGanados: 0,
    sesionesCompletadas: 0,
    clubActual: null
  });

  useEffect(() => {
    if (user) {
      cargarDatosAtleta();
    }
  }, [user]);

  // Recalcular estadísticas cuando cambien los datos
  useEffect(() => {
    if (atletaData) {
      calcularEstadisticas(atletaData, eventosParticipacion);
    }
  }, [atletaData, eventosParticipacion]);

  const cargarDatosAtleta = async () => {
    try {
      setLoading(true);
      setError('');
      const userId = user._id || user.id;

      console.log('Cargando datos para atleta:', userId);

      // Cargar datos del atleta
      const atletaResponse = await axios.get(`http://localhost:5000/api/registros/atleta/${userId}`);
      console.log('Datos del atleta:', atletaResponse.data);
      setAtletaData(atletaResponse.data);

      // Cargar clubes disponibles
      try {
        const clubesResponse = await axios.get('http://localhost:5000/api/registros/clubes');
        console.log('Clubes cargados:', clubesResponse.data.length);
        setClubesDisponibles(clubesResponse.data.slice(0, 6));
      } catch (error) {
        console.log('Error al cargar clubes:', error.message);
        setClubesDisponibles([]);
      }

      // Cargar eventos próximos (convocatorias para el atleta)
      try {
        const edad = calcularEdad(atletaResponse.data.fechaNacimiento);
        const genero = atletaResponse.data.sexo?.toLowerCase();
        
        console.log('Edad y género del atleta:', { edad, genero });
        
        if (edad && genero) {
          const eventosResponse = await axios.get(`http://localhost:5000/api/eventos/convocatorias-para-atleta?edad=${edad}&genero=${genero}`);
          console.log('Eventos próximos cargados:', eventosResponse.data.length);
          setEventosProximos(eventosResponse.data.slice(0, 4));
        } else {
          console.log('No se pudo calcular edad o género');
          setEventosProximos([]);
        }
      } catch (error) {
        console.log('Error al cargar eventos próximos:', error.message);
        setEventosProximos([]);
      }

      // Cargar eventos en los que participa
      try {
        const participacionResponse = await axios.get(`http://localhost:5000/api/eventos/inscripciones?atletaId=${userId}`);
        console.log('Participaciones cargadas:', participacionResponse.data.length);
        setEventosParticipacion(participacionResponse.data.slice(0, 3));
      } catch (error) {
        console.log('Error al cargar participaciones:', error.message);
        setEventosParticipacion([]);
      }



      // Las estadísticas se calcularán automáticamente con useEffect

    } catch (error) {
      console.error('Error al cargar datos:', error);
      console.error('Error response:', error.response?.data);
      setError(`Error al cargar los datos del atleta: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const fechaNac = new Date(fechaNacimiento);
    const fechaActual = new Date();
    let edad = fechaActual.getFullYear() - fechaNac.getFullYear();
    const mes = fechaActual.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && fechaActual.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  };

  const calcularEstadisticas = (atleta, participaciones = []) => {
    const stats = {
      totalEventos: participaciones.length,
      eventosGanados: participaciones.filter(p => p.resultado === 'ganador').length,
      sesionesCompletadas: 0, // Ya no se manejan sesiones
      clubActual: atleta.clubId ? 'Club Asignado' : 'Sin Club'
    };
    setEstadisticas(stats);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'activo': return 'success';
      case 'pendiente': return 'warning';
      case 'completada': return 'info';
      default: return 'default';
    }
  };

  const handleInscribirseEvento = async (evento) => {
    try {
      const userId = user._id || user.id;
      await axios.post('http://localhost:5000/api/eventos/inscripciones', {
        eventoId: evento._id,
        atletaId: userId,
        datosAtleta: {
          nombreCompleto: `${atletaData.nombre} ${atletaData.apellidopa} ${atletaData.apellidoma}`,
          edad: calcularEdad(atletaData.fechaNacimiento),
          genero: atletaData.sexo
        }
      });

      Swal.fire({
        icon: 'success',
        title: '¡Inscripción Exitosa!',
        text: `Te has inscrito al evento "${evento.titulo}"`,
        confirmButtonColor: '#800020'
      });

      // Recargar datos
      cargarDatosAtleta();

    } catch (error) {
      console.error('Error al inscribirse:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al inscribirse al evento',
        confirmButtonColor: '#800020'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} sx={{ color: '#800020' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Box display="flex" justifyContent="center">
          <Button
            variant="contained"
            onClick={cargarDatosAtleta}
            sx={{ 
              bgcolor: '#800020',
              '&:hover': { bgcolor: '#600018' }
            }}
          >
            🔄 Intentar de Nuevo
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <style>
        {`
          body {
            margin: 0;
            padding: 0;
          }
        `}
      </style>
      <Container maxWidth="xl" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh' }}>
        
        {/* Header con información del atleta */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#800020' }}>
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h4" sx={{ color: '#800020', fontWeight: 'bold', mb: 1 }}>
            ¡Bienvenido, {atletaData?.nombre}!
          </Typography>
          <Typography variant="h6" sx={{ color: '#7A4069', mb: 3 }}>
            Tu centro de control deportivo personal
          </Typography>
          
          {/* Botón de prueba para verificar conexión */}
          <Button 
            variant="outlined" 
            onClick={async () => {
              try {
                const userId = user._id || user.id;
                const response = await axios.get(`http://localhost:5000/api/registros/atleta/${userId}`);
                console.log('Test de conexión exitoso:', response.data);
                Swal.fire({
                  icon: 'info',
                  title: 'Test de Conexión',
                  text: 'Conexión exitosa al servidor',
                  html: `
                    <p><strong>Usuario ID:</strong> ${userId}</p>
                    <p><strong>Nombre:</strong> ${response.data?.nombre || 'N/A'}</p>
                    <p><strong>Rol:</strong> ${response.data?.rol || 'N/A'}</p>
                    <p><strong>Club Asignado:</strong> ${response.data?.clubId ? 'Sí' : 'No'}</p>
                  `
                });
              } catch (error) {
                console.error('Error en test:', error);
                Swal.fire({
                  icon: 'error',
                  title: 'Error de Conexión',
                  text: error.response?.data?.error || error.message
                });
              }
            }}
            sx={{ mb: 2 }}
          >
            🔧 Test de Conexión
          </Button>
        </Box>

        {/* Estadísticas rápidas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#800020', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {estadisticas.totalEventos}
                </Typography>
                <Typography variant="body2">
                  Eventos Participados
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#7A4069', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrophyIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {estadisticas.eventosGanados}
                </Typography>
                <Typography variant="body2">
                  Victorias
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#2E7D32', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <RunIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {estadisticas.sesionesCompletadas}
                </Typography>
                <Typography variant="body2">
                  Sesiones Completadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#1976D2', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <GroupIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {estadisticas.clubActual}
                </Typography>
                <Typography variant="body2">
                  Estado Club
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Clubes Disponibles */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <GroupIcon sx={{ fontSize: 30, color: '#800020', mr: 2 }} />
                  <Typography variant="h5" sx={{ color: '#800020', fontWeight: 'bold' }}>
                    Clubes Disponibles
                  </Typography>
                </Box>
                
                {clubesDisponibles.length === 0 ? (
                  <Typography variant="body2" sx={{ textAlign: 'center', color: '#7A4069' }}>
                    No hay clubes disponibles en este momento.
                  </Typography>
                ) : (
                  <List>
                    {clubesDisponibles.map((club, index) => (
                      <React.Fragment key={club._id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#7A4069' }}>
                              <SchoolIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#800020' }}>
                                {club.nombre}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" sx={{ color: '#7A4069' }}>
                                  📍 {club.estadoNacimiento}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#7A4069' }}>
                                  📞 {club.telefono}
                                </Typography>
                                {club.descripcion && (
                                  <Typography variant="body2" sx={{ color: '#7A4069', mt: 1 }}>
                                    {club.descripcion.substring(0, 100)}...
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            sx={{ 
                              borderColor: '#800020', 
                              color: '#800020',
                              '&:hover': { borderColor: '#600018', backgroundColor: '#F5E8C7' }
                            }}
                          >
                            Ver
                          </Button>
                        </ListItem>
                        {index < clubesDisponibles.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Próximos Eventos */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <CalendarIcon sx={{ fontSize: 30, color: '#800020', mr: 2 }} />
                  <Typography variant="h5" sx={{ color: '#800020', fontWeight: 'bold' }}>
                    Próximos Eventos
                  </Typography>
                </Box>
                
                {eventosProximos.length === 0 ? (
                  <Typography variant="body2" sx={{ textAlign: 'center', color: '#7A4069' }}>
                    No hay eventos próximos disponibles para tu categoría.
                  </Typography>
                ) : (
                  <List>
                    {eventosProximos.map((evento, index) => (
                      <React.Fragment key={evento._id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#7A4069' }}>
                              <EventIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#800020' }}>
                                {evento.titulo}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" sx={{ color: '#7A4069' }}>
                                  📅 {formatearFecha(evento.fecha)}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#7A4069' }}>
                                  📍 {evento.lugar}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#7A4069' }}>
                                  🏃 {evento.disciplina} - {evento.categoria}
                                </Typography>
                                <Chip 
                                  label={evento.estado ? 'Abierto' : 'Cerrado'} 
                                  color={evento.estado ? 'success' : 'error'}
                                  size="small"
                                  sx={{ mt: 1 }}
                                />
                              </Box>
                            }
                          />
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleInscribirseEvento(evento)}
                            disabled={!evento.estado}
                            sx={{ 
                              bgcolor: '#800020',
                              '&:hover': { bgcolor: '#600018' }
                            }}
                          >
                            Inscribirse
                          </Button>
                        </ListItem>
                        {index < eventosProximos.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Eventos de Participación */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <CheckIcon sx={{ fontSize: 30, color: '#800020', mr: 2 }} />
                  <Typography variant="h5" sx={{ color: '#800020', fontWeight: 'bold' }}>
                    Mis Participaciones
                  </Typography>
                </Box>
                
                {eventosParticipacion.length === 0 ? (
                  <Typography variant="body2" sx={{ textAlign: 'center', color: '#7A4069' }}>
                    No estás participando en ningún evento actualmente.
                  </Typography>
                ) : (
                  <List>
                    {eventosParticipacion.map((participacion, index) => (
                      <React.Fragment key={participacion._id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#2E7D32' }}>
                              <TrophyIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#800020' }}>
                                {participacion.evento?.titulo || 'Evento'}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" sx={{ color: '#7A4069' }}>
                                  📅 {formatearFecha(participacion.fechaInscripcion)}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#7A4069' }}>
                                  🏃 {participacion.evento?.disciplina || 'N/A'}
                                </Typography>
                                <Chip 
                                  label={participacion.validado ? 'Validado' : 'Pendiente'} 
                                  color={participacion.validado ? 'success' : 'warning'}
                                  size="small"
                                  sx={{ mt: 1 }}
                                />
                              </Box>
                            }
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            sx={{ 
                              borderColor: '#2E7D32', 
                              color: '#2E7D32',
                              '&:hover': { borderColor: '#1B5E20', backgroundColor: '#F5E8C7' }
                            }}
                          >
                            Ver
                          </Button>
                        </ListItem>
                        {index < eventosParticipacion.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>


        </Grid>

        {/* Acciones Rápidas */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ color: '#800020', fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
            🚀 Acciones Rápidas
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                variant="contained"
                startIcon={<EventIcon />}
                sx={{ 
                  bgcolor: '#800020',
                  '&:hover': { bgcolor: '#600018' }
                }}
              >
                Ver Todos los Eventos
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<GroupIcon />}
                sx={{ 
                  bgcolor: '#7A4069',
                  '&:hover': { bgcolor: '#5A3049' }
                }}
              >
                Explorar Clubes
              </Button>
            </Grid>

            <Grid item>
              <Button
                variant="contained"
                startIcon={<TrendingUpIcon />}
                sx={{ 
                  bgcolor: '#1976D2',
                  '&:hover': { bgcolor: '#1565C0' }
                }}
              >
                Ver Estadísticas
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default PaginaPrincipalAtleta;