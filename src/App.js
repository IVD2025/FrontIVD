import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import LayoutConEncabezado from "./Componentes/Layout/LayoutConEncabezado";
import PaginaPrincipal from "./Paginas/PaginaPrincipal";
import PaginaPrincipalAdministrativa from "./Paginas/PaginaPrincipalAdministrativa";
import PaginaPrincipalAtleta from "./Paginas/PaginaPrincipalAtleta";
import AcercaDe from "./Componentes/Compartidos/AcercaDe";
import { ThemeProvider } from "./Componentes/Temas/ThemeContext";
import { AuthProvider } from "./Componentes/Autenticacion/AuthContext";
import Login from "./Componentes/Autenticacion/Login";
import Registro from "./Componentes/Autenticacion/Registro";
import RegistroEntrenador from "./Componentes/Autenticacion/RegistroEntrenador";
import Perfil from "./Componentes/Administrativo/Perfil";
import Club from "./Componentes/Administrativo/Club";
import HotelesP from "./Componentes/Publico/HotelesP";
import Politicas from "./Componentes/Administrativo/Politica";
import Atleta from "./Componentes/Administrativo/Atleta";
import Eventos from "./Componentes/Administrativo/Eventos";
import CuartosP from "./Componentes/Publico/CuartosP";
import DetallesHabitacion from "./Componentes/Publico/DetalleHabitacion";
import Terminos from "./Componentes/Administrativo/Terminos";
import Vision from "./Componentes/Administrativo/Vision";
import Mision from "./Componentes/Administrativo/Mision";
import PoliticasPCA from "./Componentes/Compartidos/PoliticasPCA";
import TerminosPCA from "./Componentes/Compartidos/TerminosPCA";
import VisionPCA from "./Componentes/Compartidos/VisionPCA";
import MisionPCA from "./Componentes/Compartidos/MisionPCA";
import PaginaPrincipalClub from "./Paginas/PaginaPrincipalClub";
import AcercarDe from "./Componentes/Compartidos/AcercaDe";
import EventosAtleta from "./Componentes/Atleta/EventosAtleta";
import ConvocatoriaAtleta from "./Componentes/Atleta/ConvocatoriaAtleta";
//IMPORTACION DE COMPONENTES DEL ROL DE ATLETA
import PerfilAtleta from "./Componentes/Atleta/PerfilAtleta";
import ResultadosAtleta from "./Componentes/Atleta/ResultadosAtleta";
import EstadisticasAtleta from "./Componentes/Atleta/EstadisticasAtleta";

import EventosClub from "./Componentes/Club/Eventos";
import GestionAtletas from "./Componentes/Club/GestionAtletas";
import PerfilClub from "./Componentes/Club/PerfilClub";
import Resultados from "./Componentes/Club/Resultados";
import Convocatoria from "./Componentes/Club/Convocatoria";

import PieDePagina from "./Componentes/Compartidos/PieDePagina";
import GestionResultados from "./Componentes/Administrativo/GestionResultados";
import Reportes from "./Componentes/Administrativo/Reportes";
import ValidacionCategoriaAutomatica from "./Componentes/Administrativo/ValidacionCategoriaAutomatica";
import GestionClubes from "./Componentes/Administrativo/GestionClubes";
import GestionarAtletasAdmin from "./Componentes/Administrativo/GestionarAtletas";
import PromocionarAtleta from "./Componentes/Administrativo/PromocionarAtleta";

import PaginaPrincipalEntrenador from "./Paginas/PaginaPrincipalEntrenador";
import LayoutEntrenador from "./Componentes/Entrenador/LayoutEntrenador";
import GestionarAtletasEntrenador from "./Componentes/Entrenador/GestionarAtletas";
import PerfilEntrenador from "./Componentes/Entrenador/PerfilEntrenador";

import EventosEntrenador from "./Componentes/Entrenador/EventosEntrenador";
import ReportesEntrenador from "./Componentes/Entrenador/Reportes";
import BuscarClubes from "./Componentes/Entrenador/BuscarClubes";

import RecuperarCorreo from "./Componentes/Autenticacion/RecuperarCorreo";
import VerificarCodigo from "./Componentes/Autenticacion/VerificarCodigo";
import RestablecerPassword from "./Componentes/Autenticacion/RestablecerPassword";

// ...dentro de <Routes>

const CuartosPWrapper = () => {
  const { idHotel } = useParams();
  return <CuartosP idHotel={idHotel} />;
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes>
          {/* Rutas públicas con LayoutConEncabezado */}
          <Route path="/" element={<LayoutConEncabezado><PaginaPrincipal /></LayoutConEncabezado>} />
          <Route path="/login" element={<LayoutConEncabezado><Login /></LayoutConEncabezado>} />
          <Route path="/registro" element={<LayoutConEncabezado><Registro /></LayoutConEncabezado>} />
          <Route path="/registro-entrenador" element={<LayoutConEncabezado><RegistroEntrenador /></LayoutConEncabezado>} />
          <Route path="/hotelesp" element={<LayoutConEncabezado><HotelesP /></LayoutConEncabezado>} />
          <Route path="/cuartosp/:idHotel" element={<LayoutConEncabezado><CuartosPWrapper /></LayoutConEncabezado>} />
          <Route path="/detalles-habitacion/:idHabitacion" element={<LayoutConEncabezado><DetallesHabitacion /></LayoutConEncabezado>} />
          <Route path="/politicaspca" element={<LayoutConEncabezado><PoliticasPCA /></LayoutConEncabezado>} />
          <Route path="/terminospca" element={<LayoutConEncabezado><TerminosPCA /></LayoutConEncabezado>} />
          <Route path="/visionpca" element={<LayoutConEncabezado><VisionPCA /></LayoutConEncabezado>} />
          <Route path="/misionpca" element={<LayoutConEncabezado><MisionPCA /></LayoutConEncabezado>} />
          <Route path="/acercade" element={<LayoutConEncabezado><AcercaDe /></LayoutConEncabezado>} />

          {/* Rutas para la administración con LayoutConEncabezado */}
          <Route path="/administrador" element={<LayoutConEncabezado><PaginaPrincipalAdministrativa /></LayoutConEncabezado>} />
          <Route path="/administrador/perfil" element={<LayoutConEncabezado><Perfil /></LayoutConEncabezado>} />
          <Route path="/administrador/club" element={<LayoutConEncabezado><Club /></LayoutConEncabezado>} />
          <Route path="/administrador/atleta" element={<LayoutConEncabezado><Atleta /></LayoutConEncabezado>} />
          <Route path="/administrador/evento" element={<LayoutConEncabezado><Eventos /></LayoutConEncabezado>} />
          <Route path="/administrador/resultados" element={<LayoutConEncabezado><GestionResultados /></LayoutConEncabezado>} />
          <Route path="/administrador/reportes" element={<LayoutConEncabezado><Reportes /></LayoutConEncabezado>} />
          <Route path="/administrador/validacion-categoria" element={<LayoutConEncabezado><ValidacionCategoriaAutomatica /></LayoutConEncabezado>} />
          <Route path="/administrador/gestion-clubes" element={<LayoutConEncabezado><GestionClubes /></LayoutConEncabezado>} />
          <Route path="/administrador/gestionar-atletas" element={<LayoutConEncabezado><GestionarAtletasAdmin /></LayoutConEncabezado>} />
          <Route path="/administrador/promocionar-atleta" element={<LayoutConEncabezado><PromocionarAtleta /></LayoutConEncabezado>} />
          <Route path="/administrador/politicas" element={<LayoutConEncabezado><Politicas /></LayoutConEncabezado>} />
          <Route path="/administrador/terminos" element={<LayoutConEncabezado><Terminos /></LayoutConEncabezado>} />
          <Route path="/administrador/vision" element={<LayoutConEncabezado><Vision /></LayoutConEncabezado>} />
          <Route path="/administrador/mision" element={<LayoutConEncabezado><Mision /></LayoutConEncabezado>} />
          <Route path="/administrador/politicaspca" element={<LayoutConEncabezado><PoliticasPCA /></LayoutConEncabezado>} />
          <Route path="/administrador/terminospca" element={<LayoutConEncabezado><TerminosPCA /></LayoutConEncabezado>} />
          <Route path="/administrador/visionpca" element={<LayoutConEncabezado><VisionPCA /></LayoutConEncabezado>} />
          <Route path="/administrador/misionpca" element={<LayoutConEncabezado><MisionPCA /></LayoutConEncabezado>} />
          

          {/* Rutas del Entrenador con LayoutEntrenador (sin LayoutConEncabezado) */}
          <Route path="/entrenador" element={<LayoutEntrenador><PaginaPrincipalEntrenador /></LayoutEntrenador>} />
          <Route path="/entrenador/gestionar-atletas" element={<LayoutEntrenador><GestionarAtletasEntrenador /></LayoutEntrenador>} />
              
              <Route path="/entrenador/eventos" element={<LayoutEntrenador><EventosEntrenador /></LayoutEntrenador>} />
                            <Route path="/entrenador/reportes" element={<LayoutEntrenador><ReportesEntrenador /></LayoutEntrenador>} />
              <Route path="/entrenador/buscar-clubes" element={<LayoutEntrenador><BuscarClubes /></LayoutEntrenador>} />
              <Route path="/entrenador/perfil" element={<LayoutEntrenador><PerfilEntrenador /></LayoutEntrenador>} />
          <Route path="/entrenador/politicaspca" element={<LayoutEntrenador><PoliticasPCA /></LayoutEntrenador>} />
          <Route path="/entrenador/terminospca" element={<LayoutEntrenador><TerminosPCA /></LayoutEntrenador>} />
          <Route path="/entrenador/visionpca" element={<LayoutEntrenador><VisionPCA /></LayoutEntrenador>} />
          <Route path="/entrenador/misionpca" element={<LayoutEntrenador><MisionPCA /></LayoutEntrenador>} />

          {/* Rutas para el atleta con LayoutConEncabezado */}
          <Route path="/atleta" element={<LayoutConEncabezado><PaginaPrincipalAtleta /></LayoutConEncabezado>} />
          <Route path="/atleta/eventos" element={<LayoutConEncabezado><EventosAtleta /></LayoutConEncabezado>} />
          <Route path="/atleta/convocatoria" element={<LayoutConEncabezado><ConvocatoriaAtleta /></LayoutConEncabezado>} />
          <Route path="/atleta/perfil" element={<LayoutConEncabezado><PerfilAtleta /></LayoutConEncabezado>} />
          <Route path="/atleta/resultados" element={<LayoutConEncabezado><ResultadosAtleta /></LayoutConEncabezado>} />
          <Route path="/atleta/estadisticas" element={<LayoutConEncabezado><EstadisticasAtleta /></LayoutConEncabezado>} />

          <Route path="/atleta/politicaspca" element={<LayoutConEncabezado><PoliticasPCA /></LayoutConEncabezado>} />
          <Route path="/atleta/terminospca" element={<LayoutConEncabezado><TerminosPCA /></LayoutConEncabezado>} />
          <Route path="/atleta/visionpca" element={<LayoutConEncabezado><VisionPCA /></LayoutConEncabezado>} />
          <Route path="/atleta/misionpca" element={<LayoutConEncabezado><MisionPCA /></LayoutConEncabezado>} />

          {/* Rutas para el club con LayoutConEncabezado */}
          <Route path="/club" element={<LayoutConEncabezado><PaginaPrincipalClub /></LayoutConEncabezado>} />
          <Route path="/club/eventos" element={<LayoutConEncabezado><EventosClub /></LayoutConEncabezado>} />
          <Route path="/club/gestionAtletas" element={<LayoutConEncabezado><GestionAtletas /></LayoutConEncabezado>} />
          <Route path="/club/perfil" element={<LayoutConEncabezado><PerfilClub /></LayoutConEncabezado>} />  
          <Route path="/club/resultados" element={<LayoutConEncabezado><Resultados /></LayoutConEncabezado>} />
          <Route path="/club/convocatoria" element={<LayoutConEncabezado><Convocatoria /></LayoutConEncabezado>} />

          <Route path="/club/politicaspca" element={<LayoutConEncabezado><PoliticasPCA /></LayoutConEncabezado>} />
          <Route path="/club/terminospca" element={<LayoutConEncabezado><TerminosPCA /></LayoutConEncabezado>} />
          <Route path="/club/visionpca" element={<LayoutConEncabezado><VisionPCA /></LayoutConEncabezado>} />
          <Route path="/club/misionpca" element={<LayoutConEncabezado><MisionPCA /></LayoutConEncabezado>} />

          {/* Rutas para recuperar contraseña con LayoutConEncabezado */}
          <Route path="/recuperar-correo" element={<LayoutConEncabezado><RecuperarCorreo /></LayoutConEncabezado>} />
          <Route path="/verificar-codigo" element={<LayoutConEncabezado><VerificarCodigo /></LayoutConEncabezado>} />
          <Route path="/restablecer-password" element={<LayoutConEncabezado><RestablecerPassword /></LayoutConEncabezado>} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;