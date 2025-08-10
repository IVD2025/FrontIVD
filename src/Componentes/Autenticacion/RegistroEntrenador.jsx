import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  OutlinedInput
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Sports as SportsIcon,
  Work as WorkIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegistroEntrenador = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clubes, setClubes] = useState([]);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellidopa: '',
    apellidoma: '',
    curp: '',
    fechaNacimiento: '',
    telefono: '',
    gmail: '',
    password: '',
    confirmPassword: '',
    sexo: '',
    estadoNacimiento: '',
    certificaciones: [],
    especialidades: [],
    añosExperiencia: '',
    clubId: ''
  });

  const [errors, setErrors] = useState({});

  // Opciones para los campos
  const especialidades = [
    'Atletismo',
    'Carrera de velocidad',
    'Carrera de resistencia',
    'Salto de longitud',
    'Salto de altura',
    'Lanzamiento de jabalina',
    'Lanzamiento de disco',
    'Lanzamiento de peso',
    'Marcha atlética',
    'Relevos',
    'Cross country',
    'Maratón',
    'Triatlón',
    'Pentatlón',
    'Decatlón'
  ];

  const certificaciones = [
    'Federación Mexicana de Atletismo',
    'CONADE (Comisión Nacional del Deporte)',
    'Instituto del Deporte del Estado',
    'Escuela Nacional de Entrenadores Deportivos',
    'Federación Internacional de Atletismo',
    'Certificación de Entrenador Personal',
    'Licenciatura en Ciencias del Deporte',
    'Maestría en Entrenamiento Deportivo',
    'Certificación de Primeros Auxilios',
    'Certificación de Nutrición Deportiva'
  ];

  useEffect(() => {
    cargarClubes();
  }, []);

  const cargarClubes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/clubes');
      setClubes(response.data);
    } catch (error) {
      console.error('Error al cargar clubes:', error);
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
      case 'apellidopa':
      case 'apellidoma':
        return value.length >= 2 ? '' : 'Mínimo 2 caracteres';
      case 'curp':
        return /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/.test(value) ? '' : 'CURP inválida';
      case 'fechaNacimiento':
        if (!value) return 'Fecha de nacimiento es requerida';
        const fecha = new Date(value);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fecha.getFullYear();
        return edad >= 18 && edad <= 80 ? '' : 'Edad debe estar entre 18 y 80 años';
      case 'telefono':
        return /^\d{10}$/.test(value) ? '' : 'Teléfono debe tener 10 dígitos';
      case 'gmail':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Email inválido';
      case 'password':
        return value.length >= 6 ? '' : 'Mínimo 6 caracteres';
      case 'confirmPassword':
        return value === formData.password ? '' : 'Las contraseñas no coinciden';
      case 'añosExperiencia':
        return value >= 0 && value <= 50 ? '' : 'Años de experiencia inválidos';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleMultiSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'clubId') { // clubId es opcional
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError('Por favor, corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const entrenadorData = {
        ...formData,
        rol: 'entrenador',
        fechaRegistro: new Date(),
        estado: 'activo'
      };

      // Si no se seleccionó club, quitar el campo
      if (!entrenadorData.clubId) {
        delete entrenadorData.clubId;
      }

      await axios.post('http://localhost:5000/api/registros', entrenadorData);
      
      setSuccess('Entrenador registrado correctamente');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Error al registrar entrenador:', error);
      setError(error.response?.data?.error || 'Error al registrar entrenador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, background: '#F5E8C7', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#800020', fontWeight: 'bold', mb: 3 }}>
          🏋️ Registro de Entrenador
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Datos Personales */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#800020', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon /> Datos Personales
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Apellido Paterno"
                name="apellidopa"
                value={formData.apellidopa}
                onChange={handleChange}
                error={!!errors.apellidopa}
                helperText={errors.apellidopa}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Apellido Materno"
                name="apellidoma"
                value={formData.apellidoma}
                onChange={handleChange}
                error={!!errors.apellidoma}
                helperText={errors.apellidoma}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CURP"
                name="curp"
                value={formData.curp}
                onChange={handleChange}
                error={!!errors.curp}
                helperText={errors.curp}
                required
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                name="fechaNacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                error={!!errors.fechaNacimiento}
                helperText={errors.fechaNacimiento}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                error={!!errors.telefono}
                helperText={errors.telefono}
                required
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="gmail"
                type="email"
                value={formData.gmail}
                onChange={handleChange}
                error={!!errors.gmail}
                helperText={errors.gmail}
                required
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.sexo}>
                <InputLabel>Género</InputLabel>
                <Select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  label="Género"
                >
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="femenino">Femenino</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estado de Nacimiento"
                name="estadoNacimiento"
                value={formData.estadoNacimiento}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            {/* Datos de Entrenador */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#800020', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon /> Información Profesional
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Especialidades</InputLabel>
                <Select
                  multiple
                  name="especialidades"
                  value={formData.especialidades}
                  onChange={(e) => handleMultiSelectChange('especialidades', e.target.value)}
                  input={<OutlinedInput label="Especialidades" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {especialidades.map((especialidad) => (
                    <MenuItem key={especialidad} value={especialidad}>
                      {especialidad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Certificaciones</InputLabel>
                <Select
                  multiple
                  name="certificaciones"
                  value={formData.certificaciones}
                  onChange={(e) => handleMultiSelectChange('certificaciones', e.target.value)}
                  input={<OutlinedInput label="Certificaciones" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {certificaciones.map((certificacion) => (
                    <MenuItem key={certificacion} value={certificacion}>
                      {certificacion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Años de Experiencia"
                name="añosExperiencia"
                type="number"
                value={formData.añosExperiencia}
                onChange={handleChange}
                error={!!errors.añosExperiencia}
                helperText={errors.añosExperiencia}
                InputProps={{
                  startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Asignar a Club (Opcional)</InputLabel>
                <Select
                  name="clubId"
                  value={formData.clubId}
                  onChange={handleChange}
                  label="Asignar a Club (Opcional)"
                >
                  <MenuItem value="">
                    <em>Sin asignar</em>
                  </MenuItem>
                  {clubes.map((club) => (
                    <MenuItem key={club._id} value={club._id}>
                      {club.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Contraseña */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#800020', mb: 2 }}>
                🔐 Contraseña
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirmar Contraseña"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                required
              />
            </Grid>

            {/* Botones */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    backgroundColor: '#800020',
                    '&:hover': { backgroundColor: '#600018' },
                    px: 4
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrar Entrenador'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ px: 4 }}
                >
                  Cancelar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default RegistroEntrenador;
