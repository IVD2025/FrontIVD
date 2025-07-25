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
import PerfilAtleta from "./Componentes/Atleta/PerfilAtleta";
import ResultadosAtleta from "./Componentes/Atleta/ResultadosAtleta";
import EventosClub from "./Componentes/Club/Eventos";
import GestionAtletas from "./Componentes/Club/GestionAtletas";
import PerfilClub from "./Componentes/Club/PerfilClub";
import Resultados from "./Componentes/Club/Resultados";
import Convocatoria from "./Componentes/Club/Convocatoria";
import PieDePagina from "./Componentes/Compartidos/PieDePagina";

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
        <LayoutConEncabezado>
          <Routes>
            <Route path="/" element={<PaginaPrincipal />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/hotelesp" element={<HotelesP />} />
            <Route path="/cuartosp/:idHotel" element={<CuartosPWrapper />} />
            <Route path="/detalles-habitacion/:idHabitacion" element={<DetallesHabitacion />} />
            <Route path="/politicaspca" element={<PoliticasPCA />} />
            <Route path="/terminospca" element={<TerminosPCA />} />
            <Route path="/visionpca" element={<VisionPCA />} />
            <Route path="/misionpca" element={<MisionPCA />} />
            <Route path="/acercade" element={<AcercaDe />} />

            {/* Rutas para la administración */}
            <Route path="/administrador" element={<PaginaPrincipalAdministrativa />} />
            <Route path="/administrador/perfil" element={<Perfil />} />
            <Route path="/administrador/club" element={<Club />} />
            <Route path="/administrador/atleta" element={<Atleta />} />
            <Route path="/administrador/evento" element={<Eventos />} />
            <Route path="/administrador/politicas" element={<Politicas />} />
            <Route path="/administrador/terminos" element={<Terminos />} />
            <Route path="/administrador/vision" element={<Vision />} />
            <Route path="/administrador/mision" element={<Mision />} />
            <Route path="/administrador/politicaspca" element={<PoliticasPCA />} />
            <Route path="/administrador/terminospca" element={<TerminosPCA />} />
            <Route path="/administrador/visionpca" element={<VisionPCA />} />
            <Route path="/administrador/misionpca" element={<MisionPCA />} />

            {/* Rutas para el atleta */}
            <Route path="/atleta" element={<PaginaPrincipalAtleta />} />
            <Route path="/atleta/eventos" element={<EventosAtleta />} />
            <Route path="/atleta/convocatoria" element={<ConvocatoriaAtleta />} />
            <Route path="/atleta/perfil" element={<PerfilAtleta />} />
            <Route path="/atleta/resultados" element={<ResultadosAtleta />} />
            <Route path="/atleta/politicaspca" element={<PoliticasPCA />} />
            <Route path="/atleta/terminospca" element={<TerminosPCA />} />
            <Route path="/atleta/visionpca" element={<VisionPCA />} />
            <Route path="/atleta/misionpca" element={<MisionPCA />} />
            {/* Rutas para el club */}
            <Route path="/club" element={<PaginaPrincipalClub />} />
            <Route path="/club/eventos" element={<EventosClub />} />
            <Route path="/club/gestionAtletas" element={<GestionAtletas />} />
            <Route path="/club/perfil" element={<PerfilClub />} />  
            <Route path="/club/resultados" element={<Resultados />} />
            <Route path="/club/convocatoria" element={<Convocatoria />} />
            <Route path="/club/politicaspca" element={<PoliticasPCA />} />
            <Route path="/club/terminospca" element={<TerminosPCA />} />
            <Route path="/club/visionpca" element={<VisionPCA />} />
            <Route path="/club/misionpca" element={<MisionPCA />} />
              {/*Rutas para recuperar contraseña*/}
            <Route path="/recuperar-correo" element={<RecuperarCorreo />} />
            <Route path="/verificar-codigo" element={<VerificarCodigo />} />
            <Route path="/restablecer-password" element={<RestablecerPassword />} />

                      
          </Routes>
        </LayoutConEncabezado>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;