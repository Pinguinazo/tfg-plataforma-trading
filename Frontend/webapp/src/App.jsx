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
  }, [globalUser, route]); 

  if (globalUser) {
    const role = globalUser.role || 'user'; 
    if ((role === 'master' || role === 'admin') && route === 'admin-dashboard') {
      return (
        <AdminDashboard 
          adminUser={globalUser} 
          onLogout={() => { setGlobalUser(null); setRoute('home'); }} 
        />
      );
    }
    
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