export default function Footer({ setActivePage }) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-6 md:py-4 mt-auto w-full px-4">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row justify-between items-center gap-4 text-slate-500 text-xs md:text-sm pb-safe">
        
        {/* TEXTO IZQUIERDA */}
        <p className="text-center md:text-left w-full md:w-auto">
          © {new Date().getFullYear()} TradingPulse Inc. Plataforma de Trading Simulada. Persistencia con Cassandra.
        </p>
        
        {/* ENLACES DERECHA (Forzados a una línea) */}
        <div className="flex flex-row items-center justify-center gap-3 md:gap-4 w-full md:w-auto whitespace-nowrap">
          <button onClick={() => { setActivePage('privacidad'); window.scrollTo(0,0); }} className="hover:text-blue-400 transition-colors cursor-pointer">
            Privacidad
          </button>
          
          <span className="text-slate-700">•</span>
          
          <button onClick={() => { setActivePage('cookies'); window.scrollTo(0,0); }} className="hover:text-blue-400 transition-colors cursor-pointer">
            Cookies
          </button>

          <span className="text-slate-700">•</span>

          <button onClick={() => { setActivePage('aviso-legal'); window.scrollTo(0,0); }} className="hover:text-blue-400 transition-colors cursor-pointer">
            Aviso Legal
          </button>
        </div>

      </div>
    </footer>
  );
}