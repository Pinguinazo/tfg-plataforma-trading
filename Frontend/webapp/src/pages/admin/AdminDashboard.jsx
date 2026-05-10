import { useState, useEffect } from 'react';
import FinancialTab from './FinancialTab';
import UsersTab from './UsersTab';
import NodesTab from './NodesTab';
import AdminsTab from './AdminsTab';
import AdminSettingsTab from './AdminSettingsTab'; // 🚀 IMPORTAMOS LA NUEVA PESTAÑA

const API_URL = import.meta.env.VITE_API_URL;

const iconFinancial = () => <span className="cursor-pointer">📊</span>;
const iconUsers = () => <span className="cursor-pointer">👥</span>;
const iconNodes = () => <span className="cursor-pointer">🗄️</span>;
const iconShield = () => <span className="cursor-pointer">🛡️</span>;
const iconSettings = () => <span className="cursor-pointer">⚙️</span>; // 🚀 NUEVO ICONO

export default function AdminDashboard({ adminUser, onLogout }) { 
  const [activeView, setActiveView] = useState('financial');
  const [loading, setLoading] = useState(true);
  
  const [dbStats, setDbStats] = useState({ activeUsers: '---', mrr: '---', arr: '---', proCount: '---', eliteCount: '---', basicoCount: '---', pendingDeletions: '---', softDeleteList: [] });
  const [users, setUsers] = useState([]);
  const [nodes, setNodes] = useState([]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, nodesRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`), 
        fetch(`${API_URL}/api/admin/users`), 
        fetch(`${API_URL}/api/admin/nodes`)
      ]);
      if (statsRes.ok) setDbStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (nodesRes.ok) setNodes(await nodesRes.json());
    } catch (e) { 
      console.error(e);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('finpulse_session');
      window.location.href = '/'; 
    }
  };

  const navItems = [
    { id: 'financial', label: 'Financiero', icon: iconFinancial() },
    { id: 'users', label: 'Usuarios', icon: iconUsers() },
    { id: 'nodes', label: 'Nodos', icon: iconNodes() },
  ];
  if (adminUser?.role === 'master') {
    navItems.push({ id: 'admins', label: 'Admins', icon: iconShield() });
  }
  // 🚀 AÑADIMOS LA PESTAÑA AL MENÚ
  navItems.push({ id: 'settings', label: 'Ajustes', icon: iconSettings() });

  const AdminSidebar = () => (
    <aside className="w-64 bg-slate-950/70 border-r border-red-950 p-6 hidden md:flex flex-col gap-12 relative z-10 min-h-screen">
      <div className="flex items-center gap-3 cursor-pointer">
        <div className="bg-red-600 p-2.5 rounded-xl font-bold text-white text-xl">
          {adminUser?.role === 'master' ? 'M' : 'A'}
        </div>
        <h1 className="text-2xl font-bold text-white">
          TradingPulse <span className="text-red-400 font-medium text-sm block">
            {adminUser?.role === 'master' ? 'Master' : 'Admin'}
          </span>
        </h1>
      </div>
      <nav className="flex-1 flex flex-col gap-3">
        {navItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveView(item.id)} 
            className={`cursor-pointer flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm w-full text-left ${activeView === item.id ? 'bg-red-950/50 text-red-100 shadow-inner border border-red-900/30' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'}`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
      <div className="border-t border-red-950/50 pt-6 mt-auto">
        <button onClick={handleLogout} className="cursor-pointer w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all text-sm">
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-slate-400 text-3xl font-bold">Cargando ecosistema...</div>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0B0F19] font-sans selection:bg-red-900/50 relative overflow-hidden">
      
      {/* CABECERA MÓVIL */}
      <div className="md:hidden bg-slate-950/90 border-b border-red-950 p-4 flex justify-between items-center z-20 sticky top-0">
        <div className="flex items-center gap-2">
           <div className="bg-red-600 w-8 h-8 rounded-lg font-bold text-white flex items-center justify-center text-sm">
             {adminUser?.role === 'master' ? 'M' : 'A'}
           </div>
           <span className="font-bold text-white">TradingPulse <span className="text-red-400 text-xs">Admin</span></span>
        </div>
        <button onClick={handleLogout} className="bg-red-900/30 text-red-400 border border-red-900/50 px-3 py-1.5 rounded-lg text-xs font-bold">
          Salir
        </button>
      </div>

      <AdminSidebar />
      
      {/* 🚀 RENDERIZAMOS LA VISTA */}
      <main className="flex-1 w-full pb-24 md:pb-0 h-screen overflow-y-auto">
        {activeView === 'financial' && <FinancialTab dbStats={dbStats} fetchAllData={fetchAllData} />}
        {activeView === 'users' && <UsersTab users={users} fetchAllData={fetchAllData} adminUser={adminUser} />}
        {activeView === 'nodes' && <NodesTab nodes={nodes} />}
        {activeView === 'admins' && <AdminsTab />}
        {activeView === 'settings' && <AdminSettingsTab adminUser={adminUser} onLogout={handleLogout} />}
      </main>

      {/* NAVEGACIÓN INFERIOR (Móvil) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-red-950 z-50 flex justify-around items-center p-2 pb-safe">
        {navItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveView(item.id)} 
            className={`flex flex-col items-center p-2 transition-colors ${activeView === item.id ? 'text-red-400' : 'text-slate-500 hover:text-slate-400'}`}
          >
            <div className={`text-xl mb-1 ${activeView === item.id ? 'scale-110 transition-transform' : 'grayscale opacity-60'}`}>{item.icon}</div>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; cursor: pointer; } button { cursor: pointer !important; }`}} />
    </div>
  );
}