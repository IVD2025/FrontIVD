import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Politica = () => {
  const [politica, setPolitica] = useState({
    titulo: '',
    contenido: '',
  });
  const [politicas, setPoliticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPoliticas();
  }, []);

  const fetchPoliticas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/politicas');
      const formattedPoliticas = response.data.map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : null,
      }));
      setPoliticas(formattedPoliticas);
    } catch (err) {
      setError('Error al cargar las políticas. Verifica tu conexión o el servidor.');
      console.error('Error al obtener políticas:', err.message);
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'titulo' && value.length > 255) return;
    setPolitica({ ...politica, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!politica.titulo.trim() || !politica.contenido.trim()) {
      MySwal.fire({
        title: 'Error!',
        text: 'Por favor, llena todos los campos requeridos.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { titulo: politica.titulo.trim(), contenido: politica.contenido.trim() };
      let response;

      if (editingId) {
        response = await axios.put(`http://localhost:5000/api/politicas/${editingId}`, payload);
        if (response.status === 200) {
          MySwal.fire({
            title: 'Éxito!',
            text: 'La política ha sido actualizada correctamente.',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          setPoliticas(politicas.map((p) => p._id.toString() === editingId ? { ...response.data, createdAt: new Date(response.data.createdAt), updatedAt: new Date(response.data.updatedAt) } : p));
        } else {
          throw new Error(response.data?.message || 'Error desconocido');
        }
      } else {
        response = await axios.post('http://localhost:5000/api/politicas', payload);
        MySwal.fire({
          title: 'Éxito!',
          text: 'La política ha sido creada correctamente.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        setPoliticas([...politicas, { ...response.data, createdAt: new Date(response.data.createdAt), updatedAt: new Date(response.data.updatedAt) }]);
      }
      setPolitica({ titulo: '', contenido: '' });
      setEditingId(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'No se pudo guardar la política. Intenta de nuevo.';
      MySwal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
      });
      console.error('Error al guardar política:', err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto después de eliminarlo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#800020',
      cancelButtonColor: '#7A4069',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await axios.delete(`http://localhost:5000/api/politicas/${id}`);
        if (response.status === 200) {
          setPoliticas(politicas.filter((p) => p._id.toString() !== id));
          MySwal.fire({
            title: 'Eliminado!',
            text: 'La política ha sido eliminada.',
            icon: 'success',
            confirmButtonText: 'OK',
          });
        } else {
          throw new Error(response.data?.message || 'Error desconocido');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Hubo un problema al intentar eliminar la política.';
        MySwal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
        console.error('Error al eliminar política:', err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (politica) => {
    setPolitica({
      titulo: politica.titulo,
      contenido: politica.contenido,
    });
    setEditingId(politica._id.toString());
  };

  const handleCancel = () => {
    setPolitica({ titulo: '', contenido: '' });
    setEditingId(null);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestión de Políticas</h1>
      {loading && <p style={{ textAlign: 'center', color: '#7A4069', fontSize: '18px' }}>Cargando...</p>}
      {error && <p style={{ textAlign: 'center', color: '#D32F2F', fontSize: '18px' }}>{error}</p>}
      <div style={styles.flexContainer}>
        <section style={styles.gestionPoliticaContainer}>
          <h2 style={styles.subtitle}>Gestión de Política</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Título</label>
                <input
                  type="text"
                  name="titulo"
                  placeholder="Título de la política"
                  value={politica.titulo}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Contenido</label>
                <textarea
                  name="contenido"
                  placeholder="Contenido de la política"
                  value={politica.contenido}
                  onChange={handleChange}
                  required
                  style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.editButton} disabled={loading}>
                {editingId ? 'Actualizar Política' : 'Crear Política'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancel} style={styles.cancelButton} disabled={loading}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={styles.politicasGuardadasContainer}>
          <h2 style={styles.subtitle}>Políticas Guardadas</h2>
          {politicas.length === 0 && !loading && <p>No hay políticas guardadas.</p>}
          {politicas.map((politica) => (
            <div key={politica._id} style={styles.politicaItem}>
              <p><strong>Título:</strong> {politica.titulo}</p>
              <p><strong>Contenido:</strong> {politica.contenido}</p>
              <p><strong>Fecha de Creación:</strong> {politica.createdAt.toLocaleString()}</p>
              <p><strong>Última Actualización:</strong> {politica.updatedAt ? politica.updatedAt.toLocaleString() : 'N/A'}</p>
              <div style={styles.buttonGroup}>
                <button
                  style={styles.editButton}
                  onClick={() => handleEdit(politica)}
                  disabled={loading}
                >
                  Editar
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDelete(politica._id.toString())}
                  disabled={loading}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '30px auto',
    padding: '30px',
    background: '#F5E8C7',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    fontFamily: "'Arial', 'Helvetica', sans-serif",
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '30px',
    textAlign: 'center',
    color: '#800020',
    letterSpacing: '0.05em',
  },
  subtitle: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#800020',
  },
  flexContainer: {
    display: 'flex',
    gap: '25px',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gestionPoliticaContainer: {
    flex: '1 1 45%',
    padding: '20px',
    background: '#FFFFFF',
    borderRadius: '15px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease',
    cursor: 'default',
  },
  politicasGuardadasContainer: {
    flex: '1 1 50%',
    padding: '20px',
    background: '#FFFFFF',
    borderRadius: '15px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: '700',
    marginBottom: '8px',
    color: '#7A4069',
    fontSize: '15px',
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '2px solid #D3D0F7',
    backgroundColor: '#FAFAFF',
    transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
    outline: 'none',
    fontWeight: '500',
    color: '#333333',
  },
  buttonGroup: {
    marginTop: '28px',
    display: 'flex',
    gap: '18px',
    justifyContent: 'flex-start',
  },
  editButton: {
    background: '#800020',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    boxShadow: '0 4px 10px rgba(128, 0, 32, 0.3)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  },
  cancelButton: {
    background: '#7A4069',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    boxShadow: '0 4px 10px rgba(122, 64, 105, 0.3)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  },
  deleteButton: {
    background: '#D32F2F',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    boxShadow: '0 4px 10px rgba(211, 47, 47, 0.3)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  },
  politicaItem: {
    padding: '15px',
    borderBottom: '1px solid #EEEEEE',
    marginBottom: '10px',
  },
};

export default Politica;