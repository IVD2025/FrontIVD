import React from 'react';
import EncabezadoEntrenador from '../Compartidos/EncabezadoEntrenador';
import PieDePaginaEntrenador from '../Compartidos/PieDePaginaEntrenador';

const LayoutEntrenador = ({ children }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#F5E8C7',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <EncabezadoEntrenador />
      <main style={{ 
        flex: 1,
        padding: 0,
        margin: 0,
        background: '#F5E8C7'
      }}>
        {children}
      </main>
      <PieDePaginaEntrenador />
    </div>
  );
};

export default LayoutEntrenador;
