export default function NodesTab({ nodes }) {
  return (
    <div className="flex-1 p-4 md:p-10 bg-[#0B0F19] overflow-y-auto max-h-screen custom-scrollbar">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-10">Estado del Clúster Cassandra</h2>
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 md:p-8 space-y-4 md:space-y-6 shadow-xl">
        {nodes.map(n => (
          <div key={n.ip} className={`bg-[#0B0F19] border ${n.status === 'active' ? 'border-slate-800' : 'border-red-900/50'} rounded-xl p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4 md:gap-0`}>
            <div>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-2">
                <p className="font-bold text-slate-100 text-lg">{n.name}</p>
                <span className="text-slate-400 text-xs font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">{n.ip}</span>
              </div>
              <p className="text-slate-500 text-sm">{n.role}</p>
            </div>
            <div className="flex items-center md:flex-col md:items-end gap-2">
              <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
                <span className={`w-2.5 h-2.5 rounded-full ${n.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
                <span className={`text-sm font-bold ${n.status === 'active' ? 'text-green-400' : 'text-red-500'}`}>{n.status === 'active' ? 'En línea' : 'Desconectado'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}