export default function LegalNotice() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 text-slate-300 font-light leading-relaxed">
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500 mb-8">Última revisión: Abril 2026</p>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">AVISO LEGAL Y CONDICIONES DE USO</h2>
      
      <h3 className="text-xl md:text-2xl font-bold text-white mt-12 mb-6 border-b border-slate-800 pb-4">I. INFORMACIÓN GENERAL</h3>
      <p className="mb-4">La titularidad de este sitio web, simulador de trading y panel analítico (en adelante, Sitio Web) la ostenta: TradingPulse Inc., provista de NIF: [NIF INVENTADO], cuyos datos de contacto son:</p>

      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 text-sm mb-8">
          <p className="mb-2"><strong className="text-slate-100">Dirección:</strong> [DIRECCIÓN FÍSICA INVENTADA / CAMPUS]</p>
          <p><strong className="text-slate-100">Email de contacto:</strong> <a href="mailto:legal@tradingpulse.com" className="text-blue-400 hover:underline">legal@tradingpulse.com</a></p>
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-white mt-12 mb-6 border-b border-slate-800 pb-4">II. NATURALEZA DEL PROYECTO (TFG)</h3>
      <p className="mb-4">TradingPulse ha sido desarrollado estrictamente con fines académicos como un Trabajo de Fin de Grado (TFG). <strong>No es una plataforma financiera real ni un bróker.</strong></p>
      <p className="mb-4">Todo el capital, las compras, ventas y balances mostrados en esta plataforma son <strong>ficticios y simulados</strong>. El Sitio Web utiliza datos del mercado real (a través de Binance API) únicamente para proporcionar un entorno de simulación realista, pero no se realiza ninguna transacción económica real ni se conectan pasarelas de pago operativas.</p>

      <h3 className="text-xl md:text-2xl font-bold text-white mt-12 mb-6 border-b border-slate-800 pb-4">III. EXCLUSIÓN DE GARANTÍAS Y RESPONSABILIDAD</h3>
      <p className="mb-4">TradingPulse no garantiza la continuidad, disponibilidad y utilidad del Sitio Web, ni de los Contenidos o Servicios al tratarse de un entorno de pruebas.</p>
      <ul className="list-disc pl-6 space-y-3 mb-8 text-slate-400 mt-4">
          <li>El desarrollador no se hace responsable en modo alguno de las caídas o interrupciones de la base de datos (Cassandra) o de los servidores de desarrollo.</li>
          <li>Los datos de mercado en tiempo real dependen de APIs de terceros (Binance), por lo que no se garantiza su exactitud ni latencia.</li>
          <li>TradingPulse no ofrece asesoramiento financiero. Cualquier estrategia probada en este simulador es responsabilidad exclusiva del usuario.</li>
      </ul>

      <h3 className="text-xl md:text-2xl font-bold text-white mt-12 mb-6 border-b border-slate-800 pb-4">IV. PROPIEDAD INTELECTUAL E INDUSTRIAL</h3>
      <p className="mb-4">El código fuente, arquitectura (bases de datos, WebSockets, integración de Lightweight Charts), diseño gráfico y logotipos de TradingPulse son propiedad de sus desarrolladores académicos y se rigen por las licencias de software libre correspondientes a las librerías utilizadas (React, Tailwind, Vite, Electron).</p>
    </div>
  );
}