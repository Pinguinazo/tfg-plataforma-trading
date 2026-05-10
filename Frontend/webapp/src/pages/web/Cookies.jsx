export default function CookiesPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 text-slate-300 font-light leading-relaxed">
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500 mb-8">Última revisión: Abril 2026</p>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">POLÍTICA DE COOKIES Y ALMACENAMIENTO</h2>
      <p className="mb-12">Esta política describe el uso de almacenamiento local en la plataforma de simulación TradingPulse.</p>

      <h3 className="text-xl md:text-2xl font-bold text-white mt-12 mb-6 border-b border-slate-800 pb-4">1. Uso de Almacenamiento Local (Local Storage)</h3>
      <p className="mb-4">A diferencia de las webs tradicionales que usan "cookies" de seguimiento, TradingPulse utiliza principalmente el <strong>Almacenamiento Local del Navegador (Local Storage)</strong>. Esta tecnología nos permite guardar tus datos de sesión de forma segura en tu propio dispositivo sin necesidad de enviarlos constantemente al servidor.</p>

      <h3 className="text-xl md:text-2xl font-bold text-white mt-12 mb-6 border-b border-slate-800 pb-4">2. Tecnologías estrictamente necesarias</h3>
      <p className="mb-6">Las siguientes tecnologías son esenciales para que la plataforma de trading funcione correctamente. No utilizamos almacenamiento para fines publicitarios ni de rastreo a terceros.</p>

      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 text-sm mb-8 overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
              <thead>
                  <tr className="border-b border-slate-700 text-slate-100">
                      <th className="pb-3 pr-4 font-bold">Nombre del Dato</th>
                      <th className="pb-3 pr-4 font-bold">Tipo</th>
                      <th className="pb-3 pr-4 font-bold">Caducidad</th>
                      <th className="pb-3 font-bold">Función en TradingPulse</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                  <tr className="text-slate-300">
                      <td className="py-4 pr-4 font-mono text-blue-400">finpulse_session</td>
                      <td className="py-4 pr-4">Local Storage</td>
                      <td className="py-4 pr-4">Al cerrar sesión</td>
                      <td className="py-4 leading-relaxed">Mantiene tu sesión activa y guarda tu token de acceso para que no tengas que loguearte en cada pestaña.</td>
                  </tr>
                  <tr className="text-slate-300">
                      <td className="py-4 pr-4 font-mono text-blue-400">trading_preferences</td>
                      <td className="py-4 pr-4">Local Storage</td>
                      <td className="py-4 pr-4">Persistente</td>
                      <td className="py-4 leading-relaxed">Guarda tu divisa preferida (USD, EUR, etc.) y la configuración visual del gráfico de velas.</td>
                  </tr>
              </tbody>
          </table>
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-white mt-12 mb-6 border-b border-slate-800 pb-4">3. Conexiones Externas (WebSockets)</h3>
      <p className="mb-4">Para mostrar los precios en tiempo real, tu navegador establece una conexión segura bidireccional (WebSocket) directa con la API pública de Binance (<code>wss://stream.binance.com</code>). Esta conexión solo recibe datos de mercado y no envía información personal tuya a Binance.</p>
    </div>
  );
}