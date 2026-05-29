import { useState } from 'react';

export default function FinancialTab({ dbStats, fetchAllData }) {
  const handleRecoverUser = async (userId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/recover`, { method: 'PATCH' });
      fetchAllData();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex-1 p-4 md:p-10 space-y-6 md:space-y-8 bg-[#0B0F19]">
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-red-400">Cassandra DB <span className="text-orange-400">Dashboard</span></h2>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Usuarios', value: dbStats.activeUsers.toLocaleString(), color: 'slate', border: 'border-slate-800' },
          { label: 'Usuarios Básicos', value: dbStats.basicoCount.toLocaleString(), desc: 'Gratuitas', color: 'slate', border: 'border-slate-800' },
          { label: 'Ingresos Anuales', value: `${dbStats.arr.toLocaleString()}€`, color: 'blue', border: 'border-blue-900/50' },
          { label: 'Cuentas en Cola', value: dbStats.pendingDeletions.toLocaleString(), color: 'red', border: 'border-red-900/50' }
        ].map(kpi => (
          <div key={kpi.label} className={`bg-[#111827] border ${kpi.border} p-5 md:p-6 rounded-2xl shadow-lg`}>
            <p className="text-xs font-bold text-slate-400 mb-2">{kpi.label}</p>
            <p className={`text-3xl md:text-4xl font-bold ${kpi.color === 'blue' ? 'text-blue-400' : kpi.color === 'red' ? 'text-red-400' : 'text-slate-100'}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-[2] bg-[#111827] border border-slate-800 p-5 md:p-8 rounded-3xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 md:mb-8">Analítica de Ingresos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-center">
            <div className="bg-[#0B0F19] p-6 rounded-2xl border border-slate-800/80"><p className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">{dbStats.proCount.toLocaleString()}</p><p className="text-sm text-slate-300 font-bold">Usuarios Pro</p></div>
            <div className="bg-[#0B0F19] p-6 rounded-2xl border border-slate-800/80"><p className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{dbStats.eliteCount.toLocaleString()}</p><p className="text-sm text-slate-300 font-bold">Usuarios Élite</p></div>
            <div className="bg-[#0B0F19] p-6 rounded-2xl border border-slate-800/80"><p className="text-3xl md:text-4xl font-bold text-green-400 mb-2">{dbStats.mrr.toLocaleString()}€</p><p className="text-sm text-slate-300 font-bold">Ingresos mensuales</p></div>
          </div>
        </div>
        
        <div className="flex-1 bg-[#111827] border border-slate-800 p-5 md:p-8 rounded-3xl flex flex-col shadow-xl min-h-[300px]">
          <h3 className="text-lg font-bold text-red-300 mb-4 md:mb-6">Cola de Borrado</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar max-h-64 lg:max-h-full">
            {dbStats.softDeleteList.length === 0 && <p className="text-slate-500 text-sm">No hay cuentas en cola de borrado.</p>}
            {dbStats.softDeleteList.map(item => (
              <div key={item.user_id} className="bg-[#0B0F19] border border-red-900/30 p-4 rounded-2xl">
                <p className="font-bold text-slate-200 text-sm break-all">{item.email}</p>
                <button onClick={() => handleRecoverUser(item.user_id)} className="cursor-pointer mt-2 w-full bg-red-950/40 hover:bg-red-900/60 text-red-400 py-2 rounded-xl text-xs font-bold transition-colors">
                  Recuperar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}