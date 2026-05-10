export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 text-slate-300 font-light leading-relaxed">
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500 mb-8">Última revisión: Abril 2026</p>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">POLÍTICA DE PRIVACIDAD</h2>
      <p className="mb-12"><a href="http://192.168.1.77:5173" className="text-blue-400 hover:text-blue-300 underline decoration-1 underline-offset-4 transition-colors">www.tradingpulse.com</a></p>

      <h3 className="text-xl md:text-2xl font-bold text-white mt-12 mb-6 border-b border-slate-800 pb-4">I. POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS</h3>
      <p className="mb-4">Respetando lo establecido en la legislación vigente, TradingPulse se compromete a adoptar las medidas técnicas y organizativas necesarias, según el nivel de seguridad adecuado al riesgo de los datos recogidos en esta plataforma de simulación (TFG).</p>

      <h4 className="text-lg font-bold text-slate-100 mt-8 mb-4">Identidad del responsable</h4>
      <p className="mb-4">El responsable del tratamiento de los datos personales recogidos en TradingPulse es: TradingPulse Inc., con NIF: [NIF INVENTADO] (en adelante, Responsable del tratamiento). Sus datos de contacto son los siguientes:</p>
      
      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 text-sm mb-8">
          <p className="mb-2"><strong className="text-slate-100">Dirección:</strong> [DIRECCIÓN FÍSICA INVENTADA / CAMPUS]</p>
          <p><strong className="text-slate-100">Email de contacto:</strong> <a href="mailto:contacto@tradingpulse.com" className="text-blue-400 hover:underline">contacto@tradingpulse.com</a></p>
      </div>

      <h4 className="text-lg font-bold text-slate-100 mt-8 mb-4">Fines del tratamiento</h4>
      <p className="mb-4">Los datos personales (nombre de usuario y correo electrónico simulado) son recabados y gestionados por TradingPulse con la única finalidad de permitir el acceso al simulador de trading, guardar el estado de la cartera virtual y personalizar la experiencia del usuario dentro del marco de este Trabajo de Fin de Grado.</p>

      <h4 className="text-lg font-bold text-slate-100 mt-8 mb-4">Destinatarios y Seguridad</h4>
      <p className="mb-4">Al ser un proyecto académico, los datos personales del Usuario <strong>no serán compartidos con terceros</strong> ni utilizados para fines comerciales reales. Los datos se almacenan en un clúster local de Cassandra DB garantizando su confidencialidad mediante encriptación básica de contraseñas.</p>
    </div>
  );
}