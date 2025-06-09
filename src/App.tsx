import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router';
import type { ReactNode } from 'react';
import Login from './components/login/Login';
import Dashboard from './admin/Dashboard';
import AdminProfesores from './admin/admin_profesores/AdminProfesores';
import AdminUnidadesAcademicas from './admin/admin_unidades_academicas/AdminUnidadesAcademicas';
import AdminCursos from './admin/admin_cursos/AdminCursos';
import AdminAulas from './admin/admin_aulas/AdminAulas';
import AdminHorarios from './admin/admin_horarios/AdminHorarios';
import Sidebar from './components/sidebar/Sidebar';
import { TOKEN_KEY } from './config';
import './App.css';

// Definición de tipos
interface ProtectedRouteProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

// Componente protegido para rutas que requieren autenticación
const ProtectedRoute = ({ children, isAuthenticated }: ProtectedRouteProps) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('Token recuperado al cargar la app:', token ? '***' : 'No hay token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Función para manejar el inicio de sesión exitoso
  const handleLogin = (token: string) => {
    console.log('Guardando token en localStorage con clave:', TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);
    setIsAuthenticated(true);
  };

  // El cierre de sesión ahora se maneja a través del componente Sidebar

  // Layout component that includes the Sidebar and content
  const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={isSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with toggle button for mobile */}
          <header className="bg-white shadow-sm z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="md:hidden text-gray-500 hover:text-gray-600 focus:outline-none"
                  aria-label="Toggle sidebar"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="flex-1"></div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">Admin</span>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <Login onLogin={handleLogin} /> 
        } />
        
        {/* Protected routes with layout */}
        <Route element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profesores" element={<AdminProfesores />} />
          <Route path="/unidades-academicas" element={<AdminUnidadesAcademicas />} />
          <Route path="/cursos" element={<AdminCursos />} />
          <Route path="/classrooms" element={<AdminAulas />} />
          <Route path="/schedules" element={<AdminHorarios />} />
          {/* Add more protected routes here */}
        </Route>
        
        <Route path="/" element={
          isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <Navigate to="/login" replace />
        } />
        
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-xl mb-6">Página no encontrada</p>
              <button
                onClick={() => window.location.href = isAuthenticated ? '/dashboard' : '/login'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Ir a {isAuthenticated ? 'el Dashboard' : 'Iniciar sesión'}
              </button>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
