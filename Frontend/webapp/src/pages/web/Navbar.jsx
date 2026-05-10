import { useState } from 'react';

export default function Navbar({ activePage, setActivePage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (page) => {
    setActivePage(page);
    setIsMenuOpen(false);
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-row justify-between items-center gap-2">
        
        {/* LOGO */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <span className="text-white font-bold text-lg md:text-xl">T</span>
          </div>
          <span className="text-xl md:text-2xl font-bold tracking-tight hidden sm:block">TradingPulse</span>
        </div>
        
        {/* LINKS CENTRALES (Solo PC) */}
        <div className="hidden md:flex gap-8 font-bold text-sm text-slate-300">
          <button onClick={() => handleNavClick('home')} className={`hover:text-blue-400 transition-colors ${activePage === 'home' && 'text-blue-500'}`}>Inicio</button>
          <button onClick={() => handleNavClick('about')} className={`hover:text-blue-400 transition-colors ${activePage === 'about' && 'text-blue-500'}`}>Nosotros</button>
          <button onClick={() => handleNavClick('services')} className={`hover:text-blue-400 transition-colors ${activePage === 'services' && 'text-blue-500'}`}>Servicios</button>
          <button onClick={() => handleNavClick('pricing')} className={`hover:text-blue-400 transition-colors ${activePage === 'pricing' && 'text-blue-500'}`}>Planes</button>
          <button onClick={() => handleNavClick('contact')} className={`hover:text-blue-400 transition-colors ${activePage === 'contact' && 'text-blue-500'}`}>Contacto</button>
          <button onClick={() => handleNavClick('download')} className={`hover:text-blue-400 transition-colors ${activePage === 'download' && 'text-blue-500'}`}>App</button>
        </div>
        
        {/* BOTONES DERECHA Y MENÚ HAMBURGUESA */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Ahora "Acceder" siempre se ve, con padding ajustado */}
          <button onClick={() => handleNavClick('login')} className="text-slate-300 hover:text-white font-bold px-2 py-2 transition-colors text-xs sm:text-sm">Acceder</button>
          <button onClick={() => handleNavClick('register')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 sm:px-6 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-xs sm:text-sm whitespace-nowrap">Registro</button>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            )}
          </button>
        </div>

      </div>

      {/* MENÚ DESPLEGABLE MÓVIL (Limpio y sin botón de login extra) */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-slate-800 shadow-2xl py-4 px-4 flex flex-col gap-2 font-bold text-slate-300 z-50">
          <button onClick={() => handleNavClick('home')} className={`text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors ${activePage === 'home' && 'text-blue-500 bg-slate-800/50'}`}>Inicio</button>
          <button onClick={() => handleNavClick('about')} className={`text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors ${activePage === 'about' && 'text-blue-500 bg-slate-800/50'}`}>Nosotros</button>
          <button onClick={() => handleNavClick('services')} className={`text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors ${activePage === 'services' && 'text-blue-500 bg-slate-800/50'}`}>Servicios</button>
          <button onClick={() => handleNavClick('pricing')} className={`text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors ${activePage === 'pricing' && 'text-blue-500 bg-slate-800/50'}`}>Planes</button>
          <button onClick={() => handleNavClick('contact')} className={`text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors ${activePage === 'contact' && 'text-blue-500 bg-slate-800/50'}`}>Contacto</button>
          <button onClick={() => handleNavClick('download')} className={`text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors ${activePage === 'download' && 'text-blue-500 bg-slate-800/50'}`}>Descargar App</button>
        </div>
      )}
    </nav>
  );
}