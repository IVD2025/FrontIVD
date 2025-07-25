// components/AgregarEvento.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import PeopleIcon from '@mui/icons-material/People';
import { CircularProgress, Typography, Button } from '@mui/material';

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
  const [participantes, setParticipantes] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);

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
      }
    } catch (error) {
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
      const response = await axios.get(`http://localhost:5000/api/inscripciones?eventoId=${evento._id}`);
      setParticipantes(response.data);
    } catch (error) {
      setParticipantes([]);
    } finally {
      setLoadingParticipantes(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Agregar Nuevo Evento</h2>
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

      {/* Modal de Participantes */}
      <Dialog open={modalParticipantesOpen} onClose={() => setModalParticipantesOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Participantes de "{eventoSeleccionado?.titulo}"</DialogTitle>
        <DialogContent>
          {loadingParticipantes ? (
            <CircularProgress />
          ) : participantes.length === 0 ? (
            <Typography variant="body2">No hay participantes inscritos.</Typography>
          ) : (
            <List>
              {participantes.map((p, idx) => (
                <ListItem key={idx} divider>
                  <ListItemText
                    primary={`${p.datosAtleta?.nombre || ''} ${p.datosAtleta?.apellidopa || ''} ${p.datosAtleta?.apellidoma || ''}`}
                    secondary={
                      <>
                        <b>CURP:</b> {p.datosAtleta?.curp || ''} <br />
                        <b>Club:</b> {p.datosAtleta?.club || 'Independiente'} <br />
                        <b>Sexo:</b> {p.datosAtleta?.sexo || ''} <br />
                        <b>Fecha de Nacimiento:</b> {p.datosAtleta?.fechaNacimiento || ''}
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
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '20px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#333',
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
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  'button:disabled': {
    backgroundColor: '#a0a0a0',
    cursor: 'not-allowed',
  },
};

export default AgregarEvento;