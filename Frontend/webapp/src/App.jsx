import { useState, useEffect } from 'react';
import PublicWeb from './pages/PublicWeb';
import Dashboard from './pages/Dashboard';
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  const [route, setRoute] = useState('home'); 
  
  const [globalUser, setGlobalUser] = useState(() => {
    const savedUser = localStorage.getItem('finpulse_session');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (globalUser) {
      localStorage.setItem('finpulse_session', JSON.stringify(globalUser));
      
      // ¡ESTO ES LO QUE FALTABA! 
      // Auto-enrutamiento al recargar la página (F5)
      if (route === 'home') {
        if (globalUser.role === 'master' || globalUser.role === 'admin') {
          setRoute('admin-dashboard');
        } else {
          setRoute('dashboard');
        }
      }
    } else {
      localStorage.removeItem('finpulse_session'); 
    }
  }, [globalUser, route]); // <-- Añadido 'route' a las dependencias

  if (globalUser) {
    // Verificamos el rol directamente desde el backend
    const role = globalUser.role || 'user'; 

    // Si es máster o admin secundario, van al AdminDashboard
    if ((role === 'master' || role === 'admin') && route === 'admin-dashboard') {
      return (
        <AdminDashboard 
          adminUser={globalUser} // <-- Importante: Pasamos el usuario al dashboard
          onLogout={() => { setGlobalUser(null); setRoute('home'); }} 
        />
      );
    }

    // Si es un usuario normal
    if (role === 'user' && route === 'dashboard') {
      return (
        <Dashboard 
          globalUser={globalUser}
          setGlobalUser={setGlobalUser}
          onLogout={() => { setGlobalUser(null); setRoute('home'); }} 
        />
      );
    }
  }

  return (
    <PublicWeb 
      setRoute={setRoute} 
      setGlobalUser={setGlobalUser} 
    />
  );
}