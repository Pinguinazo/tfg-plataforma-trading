import { Activity } from 'lucide-react';

export default function Home({ setActivePage }) {
  return (
    <div className="flex flex-col items-center justify-center text-center pt-6 md:pt-10 px-4 md:px-0">
      <div className="inline-flex items-center gap-2 bg-blue-900/40 text-blue-400 px-4 py-2 rounded-full font-bold text-xs md:text-sm border border-blue-500/30 mb-6">
        <Activity className="w-4 h-4" /> Trabajo de Fin de Grado
      </div>
      
      <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 leading-tight mb-6">
        Aplicación y web de trading <br className="hidden md:block" />con programación asíncrona.
      </h1>
      
      <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10 px-2">
        Hemos diseñado una plataforma analítica en tiempo real con persistencia en Cassandra para una experiencia fluida y escalable.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
        <button onClick={() => setActivePage('register')} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-base md:text-lg transition-all shadow-lg shadow-blue-500/25">Comienza Gratis</button>
        <button onClick={() => setActivePage('services')} className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-8 py-4 rounded-xl text-base md:text-lg transition-all border border-slate-700">Ver Características</button>
      </div>
    </div>
  );
}