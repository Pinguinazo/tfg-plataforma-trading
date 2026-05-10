import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, Activity } from 'lucide-react';

export default function PublicLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path) => location.pathname === path;
  
  const navLinkClass = (path) => 
    `font-bold transition-colors ${isActive(path) ? 'text-blue-500' : 'text-slate-300 hover:text-white'}`;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-body text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-heading font-bold">TradingPulse</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={navLinkClass('/')}>Inicio</Link>
            <Link to="/about" className={navLinkClass('/about')}>Sobre Nosotros</Link>
            <Link to="/services" className={navLinkClass('/services')}>Servicios</Link>
            <Link to="/contact" className={navLinkClass('/contact')}>Contacto</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/app" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all">
                  Ir a la Plataforma
                </Link>
                <button 
                  onClick={logout}
                  className="p-2.5 text-slate-400 hover:text-red-400 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all">
                <LogIn className="w-4 h-4" />
                Acceder
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-slate-400">TradingPulse</span>
          </div>
          <p className="text-slate-500 text-sm font-bold text-center">
            &copy; {new Date().getFullYear()} TradingPulse. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-full"></div>
            <div className="w-10 h-10 bg-slate-900 rounded-full"></div>
            <div className="w-10 h-10 bg-slate-900 rounded-full"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
