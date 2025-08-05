import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Alert,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../Autenticacion/AuthContext';
import { useNavigate } from 'react-router-dom';

const PerfilAtleta = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [clubes, setClubes] = useState([]);
  const [solicitud, setSolicitud] = useState(null);
  const [solicitudClubId, setSolicitudClubId] = useState('');
  const [solicitudIndependiente, setSolicitudIndependiente] = useState(false);
  const [clubSeleccionado, setClubSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!user || !user.id) {
      navigate('/login');
      return;
    }
    fetchPerfil();
    fetchClubes();
    fetchSolicitud();
    // eslint-disable-next-line
  }, [user]);

  const fetchPerfil = async () => {
    try {
      if (!user?.id) return;
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/registros/atleta/${user.id}`);
      setPerfil(response.data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Error al cargar el perfil. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/registros/clubes');
      setClubes(response.data);
    } catch {
      setClubes([]);
    }
  };

  const fetchSolicitud = async () => {
    try {
      if (!user?.id) return;
      const response = await axios.get(`http://localhost:5000/api/registros/solicitudes-club?atletaId=${user.id}`);
      // Solo mostrar la última pendiente
      const pendientes = response.data.filter(s => s.estado === 'pendiente');
      setSolicitud(pendientes.length > 0 ? pendientes[0] : null);
    } catch {
      setSolicitud(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (perfil) {
      setPerfil({ ...perfil, [name]: value });
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      if (!perfil) {
        setErrorMessage('No hay datos de perfil para guardar.');
        return;
      }
      const perfilToSave = {
        ...perfil,
        sexo: perfil.sexo === 'Hombre' ? 'masculino' : (perfil.sexo === 'Mujer' ? 'femenino' : perfil.sexo),
      };
      await axios.put(`http://localhost:5000/api/registros/atleta/${user.id}`, perfilToSave);
      setEditMode(false);
      setErrorMessage('Perfil actualizado exitosamente.');
      fetchPerfil();
    } catch (error) {
      setErrorMessage('Error al actualizar el perfil. Intente de nuevo.');
    }
  };

  const handleSolicitud = async () => {
    try {
      if (!user?.id) return;
      if (solicitudIndependiente) {
        await axios.post('http://localhost:5000/api/registros/solicitudes-club', {
          atletaId: user.id,
          tipo: 'independiente',
        });
      } else if (solicitudClubId) {
        await axios.post('http://localhost:5000/api/registros/solicitudes-club', {
          atletaId: user.id,
          clubId: solicitudClubId,
          tipo: 'asociar',
        });
      }
      setErrorMessage('Solicitud enviada correctamente. Espera la respuesta del club.');
      setSolicitudIndependiente(false);
      setSolicitudClubId('');
      fetchSolicitud();
    } catch (error) {
      setErrorMessage('Error al enviar la solicitud. Intente de nuevo.');
    }
  };

  const handleEnviarSolicitud = async () => {
    try {
      if (!user?.id) return;
      await axios.post('http://localhost:5000/api/registros/solicitudes-club', {
        atletaId: user.id,
        clubId: clubSeleccionado,
        tipo: 'asociar',
      });
      setMensaje('Solicitud enviada correctamente. Espera la respuesta del club.');
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al enviar solicitud');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading || !perfil) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh', fontFamily: "'Arial', 'Helvetica', sans-serif" }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: '#800020', fontWeight: 'bold' }}>
        Perfil del Atleta
      </Typography>

      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity={errorMessage.includes('exitosamente') || errorMessage.includes('enviada') ? 'success' : 'error'} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold', mb: 2 }}>
            Información Personal
          </Typography>
          <TextField
            label="Nombre"
            name="nombre"
            value={perfil?.nombre || ''}
            onChange={handleInputChange}
            fullWidth
            disabled={!editMode}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Apellido Paterno"
            name="apellidopa"
            value={perfil?.apellidopa || ''}
            onChange={handleInputChange}
            fullWidth
            disabled={!editMode}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Apellido Materno"
            name="apellidoma"
            value={perfil?.apellidoma || ''}
            onChange={handleInputChange}
            fullWidth
            disabled={!editMode}
            sx={{ mb: 2 }}
          />
          <TextField
            label="CURP"
            name="curp"
            value={perfil?.curp || ''}
            fullWidth
            disabled
            sx={{ mb: 2 }}
            helperText="Verifica que tu CURP sea correcto. No podrás modificarlo después del registro."
          />
          <TextField
            label="Fecha de Nacimiento"
            name="fechaNacimiento"
            type="date"
            value={perfil?.fechaNacimiento ? perfil.fechaNacimiento.slice(0, 10) : ''}
            onChange={handleInputChange}
            fullWidth
            disabled={!editMode}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Teléfono"
            name="telefono"
            value={perfil?.telefono || ''}
            onChange={handleInputChange}
            fullWidth
            disabled={!editMode}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Correo Electrónico"
            name="gmail"
            value={perfil?.gmail || ''}
            onChange={handleInputChange}
            fullWidth
            disabled={!editMode}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Sexo"
            name="sexo"
            value={perfil?.sexo || ''}
            onChange={handleInputChange}
            fullWidth
            disabled={!editMode}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Estado de Nacimiento"
            name="estadoNacimiento"
            value={perfil?.estadoNacimiento || ''}
            onChange={handleInputChange}
            fullWidth
            disabled={!editMode}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Club Actual"
            name="club"
            value={perfil && perfil.clubId ? (clubes.find(c => c._id === perfil.clubId)?.nombre || 'Club desconocido') : 'Independiente'}
            fullWidth
            disabled
            sx={{ mb: 2 }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#800020', fontWeight: 'bold', mb: 2 }}>
            Solicitud de Cambio de Club / Independiente
          </Typography>
          {perfil && perfil.clubId ? (
            <Box>
              <Alert severity="info">Actualmente perteneces a un club. Si deseas dejar el club, haz clic en el botón.</Alert>
              <Button
                variant="contained"
                onClick={async () => {
                  try {
                    if (!user?.id) return;
                    await axios.post('http://localhost:5000/api/registros/solicitudes-club', {
                      atletaId: user.id,
                      tipo: 'independiente',
                    });
                    setErrorMessage('Solicitud para dejar el club enviada. Espera la respuesta.');
                    fetchSolicitud();
                    fetchPerfil();
                  } catch (error) {
                    setErrorMessage(error.response?.data?.error || 'Error al enviar solicitud');
                  }
                }}
                sx={{ background: '#800020', fontWeight: 'bold', mt: 2 }}
                disabled={!!solicitud && solicitud.estado === 'pendiente'}
              >
                Solicitar ser Independiente
              </Button>
            </Box>
          ) : (solicitud && solicitud.estado === 'pendiente') ? (
            <Alert severity="info">Tienes una solicitud pendiente. Estado: {solicitud.estado}</Alert>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Solicitar Club</InputLabel>
                <Select
                  value={clubSeleccionado}
                  onChange={e => setClubSeleccionado(e.target.value)}
                  label="Solicitar Club"
                >
                  <MenuItem value="">Selecciona un club</MenuItem>
                  {clubes.map(club => (
                    <MenuItem key={club._id} value={club._id}>{club.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={async () => {
                  try {
                    if (!user?.id) return;
                    await axios.post('http://localhost:5000/api/registros/solicitudes-club', {
                      atletaId: user.id,
                      clubId: clubSeleccionado,
                      tipo: 'asociar',
                    });
                    setErrorMessage('Solicitud enviada correctamente. Espera la respuesta del club.');
                    fetchSolicitud();
                  } catch (error) {
                    setErrorMessage(error.response?.data?.error || 'Error al enviar solicitud');
                  }
                }}
                disabled={!clubSeleccionado}
                sx={{ background: '#800020', fontWeight: 'bold' }}
              >
                Enviar Solicitud
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          {editMode ? (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{ background: '#800020', fontWeight: 'bold' }}
            >
              Guardar
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ background: '#800020', fontWeight: 'bold' }}
            >
              Editar
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{ background: '#D32F2F', fontWeight: 'bold' }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PerfilAtleta;