import { Database, Activity, Box, RefreshCw } from 'lucide-react';

export default function Services() {
  return (
    <section id="tecnologias" className="py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Tecnologías Implementadas</h2>
          <p className="text-slate-400 text-lg">
            Arquitectura moderna orientada a la escalabilidad, la automatización y el alto rendimiento.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col group">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
              <Database className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Cassandra DB</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Base de datos NoSQL persistente y distribuida. Elegida por su alta disponibilidad y capacidad para manejar grandes volúmenes de transacciones en tiempo real sin puntos únicos de fallo.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col group">
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
              <Activity className="w-7 h-7 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">APIs & WebSockets</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Integración directa con WebSockets de Binance para streaming de precios en milisegundos, respaldado por una API RESTful propia desarrollada en Node.js y Express.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col group">
            <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
              <Box className="w-7 h-7 text-cyan-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Docker</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Contenedorización integral de la infraestructura. Aislamiento de servicios (Frontend, Backend, Base de Datos y Redes internas) para garantizar un entorno de ejecución idéntico y portable.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-red-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/10 flex flex-col group">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
              <RefreshCw className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Jenkins CI/CD</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pipelines de Integración y Entrega Continua implementados para automatizar los procesos de construcción (build), validación y despliegue del ecosistema de microservicios.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}