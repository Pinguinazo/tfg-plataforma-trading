export default function Pricing({ handleRegister }) {
  const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
  );

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4 text-slate-50">Elige tu Rango</h1>
        <p className="text-slate-400">Selecciona el plan que mejor se adapte a tu estilo de trading.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-10">
        
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative flex flex-col transition-all hover:border-slate-600 transition-transform duration-300 ease-in-out hover:-translate-y-4 hover:shadow-2xl">
          <h3 className="text-2xl font-bold text-slate-300 mb-2">Básico</h3>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-5xl font-bold text-white">$0</span>
            <span className="text-slate-500">/mes</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1 text-slate-300 text-sm">
            <li className="flex items-start"><CheckIcon /> Acceso a análisis diarios básicos</li>
            <li className="flex items-start"><CheckIcon /> Acceso limitado a histórico</li>
            <li className="flex items-start"><CheckIcon /> Acceso desde web</li>
            <li className="flex items-start"><CheckIcon /> Generar autofacturas</li>
          </ul>
          
          <button onClick={(e) => handleRegister(e, 'Básico')} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer mt-auto">
            Elegir Básico
          </button>
        </div>

        <div className="bg-slate-900 border-2 border-blue-500 p-8 rounded-3xl relative shadow-2xl shadow-blue-500/10 flex flex-col transition-transform duration-300 ease-in-out hover:-translate-y-4 hover:shadow-3xl hover:shadow-blue-500/15">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
            Más Popular
          </div>
          <h3 className="text-2xl font-bold text-blue-400 mb-2">Pro</h3>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-5xl font-bold text-white">$15</span>
            <span className="text-slate-500">/mes</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1 text-slate-300 text-sm">
            <li className="flex items-start font-bold text-white"><CheckIcon /> Todo lo del plan Básico +</li>
            <li className="flex items-start"><CheckIcon /> Análisis técnico completo (más activos y profundidad)</li>
            <li className="flex items-start"><CheckIcon /> Más indicadores (MACD, Fibonacci, volumen, etc.)</li>
            <li className="flex items-start"><CheckIcon /> Acceso a histórico ampliado</li>
            <li className="flex items-start"><CheckIcon /> Sin publicidad</li>
          </ul>
          
          <button onClick={(e) => handleRegister(e, 'Pro')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 cursor-pointer mt-auto">
            Comprar Pro
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative flex flex-col transition-all hover:border-purple-500/50 transition-transform duration-300 ease-in-out hover:-translate-y-4 hover:shadow-2xl">
          <h3 className="text-2xl font-bold text-purple-400 mb-2">Élite</h3>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-5xl font-bold text-white">$49</span>
            <span className="text-slate-500">/mes</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1 text-slate-300 text-sm">
            <li className="flex items-start font-bold text-white"><CheckIcon /> Todo lo del plan Pro +</li>
            <li className="flex items-start"><CheckIcon /> Análisis en tiempo real</li>
            <li className="flex items-start"><CheckIcon /> Acceso a comunidad privada (Discord/Telegram)</li>
            <li className="flex items-start"><CheckIcon /> Consultas o mentoría directa</li>
            <li className="flex items-start"><CheckIcon /> API corporativa y exportación de datos</li>
          </ul>
          
          <button onClick={(e) => handleRegister(e, 'Élite')} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 cursor-pointer mt-auto">
            Hacerse Élite
          </button>
        </div>

      </div>
    </div>
  );
}