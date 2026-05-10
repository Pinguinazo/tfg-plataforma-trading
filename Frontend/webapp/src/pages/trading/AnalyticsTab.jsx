import { useEffect, useRef, useState } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import { TrendingUp } from 'lucide-react';
import { printInvoices } from './FacturaAnalytics';

export default function AnalyticsTab({ globalUser, balance, holdings, globalPrices, totalDeposited, currency, rate, sym, transactions, wealthHistory }) {
  const wealthRef = useRef(null);
  const chartInstance = useRef(null);
  const areaSeriesRef = useRef(null);

  const [selectedTxs, setSelectedTxs] = useState([]);

  const currentTotalWealth = wealthHistory.length > 0 ? wealthHistory[wealthHistory.length - 1].value : balance;
  const totalProfitUSD = currentTotalWealth - totalDeposited;
  const totalProfitConverted = totalProfitUSD * rate;
  const isTotalProfit = totalProfitUSD >= 0;

  const visibleTransactions = (transactions || []).filter(tx => tx.type === 'BUY' || tx.type === 'SELL');

  let totalCompradoUSD = 0;
  let totalVendidoUSD = 0;

  visibleTransactions.forEach(tx => {
    const valueUSD = tx.amount * tx.price;
    if (tx.type === 'BUY') totalCompradoUSD += valueUSD;
    if (tx.type === 'SELL') totalVendidoUSD += valueUSD;
  });

  const displayComprado = totalCompradoUSD * rate;
  const displayVendido = totalVendidoUSD * rate;

  const formatTxDate = (tx) => {
    let val = tx.created_at || tx.timestamp || tx.date || tx.time || tx.fecha || tx.tx_date;
    if (!val) return 'Fecha desconocida';

    if (typeof val === 'string' && val.length >= 18) {
      try {
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        view.setBigUint64(0, BigInt(val), false);
        const floatDate = view.getFloat64(0, false);
        
        if (floatDate > 1500000000000 && floatDate < 2000000000000) {
          return new Date(floatDate).toLocaleString();
        }
      } catch (e) {}
    }

    if (val instanceof Date) return val.toLocaleString();
    let d = new Date(val);
    if (!isNaN(d.getTime())) return d.toLocaleString();
    d = new Date(Number(val));
    if (!isNaN(d.getTime())) return d.toLocaleString();
    d = new Date(Number(val) * 1000);
    if (!isNaN(d.getTime())) return d.toLocaleString();

    return 'Fecha desconocida';
  };

  useEffect(() => {
    if (!wealthRef.current || wealthHistory.length === 0) return;
    if (!chartInstance.current) {
      const chart = createChart(wealthRef.current, {
        layout: { 
          background: { type: 'solid', color: 'transparent' }, 
          textColor: '#94a3b8',
          attributionLogo: false
        }, 
        grid: { 
          vertLines: { visible: false }, 
          horzLines: { color: '#1e293b' } 
        }, 
        width: wealthRef.current.clientWidth, 
        height: 250 
      });
      const series = chart.addSeries(AreaSeries, { lineColor: '#3b82f6', topColor: 'rgba(59, 130, 246, 0.4)', bottomColor: 'rgba(59, 130, 246, 0)', lineWidth: 2 });
      chartInstance.current = chart; areaSeriesRef.current = series;
    }
  
    const data = wealthHistory.map(w => ({ time: w.time, value: w.value * rate }));
    areaSeriesRef.current.setData(data);
    chartInstance.current.timeScale().fitContent();
    const handleResize = () => { if (wealthRef.current && chartInstance.current) chartInstance.current.applyOptions({ width: wealthRef.current.clientWidth }); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [wealthHistory, rate]);

  const displayedTxs = visibleTransactions.slice(0, 50);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTxs(displayedTxs.map(tx => tx.id || tx.tx_id));
    } else {
      setSelectedTxs([]);
    }
  };

  const handleSelectRow = (txId) => {
    setSelectedTxs(prev => prev.includes(txId) ? prev.filter(id => id !== txId) : [...prev, txId]);
  };

  const handleDownloadSelected = () => {
    if (selectedTxs.length === 0) return;
    const txsToPrint = displayedTxs.filter(tx => selectedTxs.includes(tx.id || tx.tx_id));
    printInvoices(txsToPrint, globalUser, rate, sym);
  };

  const activePositions = [];
  Object.entries(holdings).forEach(([symbol, lots]) => {
    lots.forEach(lot => activePositions.push({ symbol, ...lot }));
  });

  return (
    <div className="space-y-8 w-full">
      <h2 className="text-3xl font-bold mb-6">Análisis de Mercado ({currency})</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl col-span-1 md:col-span-2 shadow-xl">
          <p className="text-slate-400 font-bold mb-1">Valor de las acciones</p>
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <h3 className="text-4xl sm:text-5xl font-bold text-slate-50">{(currentTotalWealth * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{sym}</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${isTotalProfit ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {isTotalProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
              {isTotalProfit ? '+' : ''}{Math.abs(totalProfitConverted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {sym}
            </div>
          </div>
 
          <div ref={wealthRef} className="w-full h-[250px]" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-center items-center shadow-xl">
          <p className="text-slate-400 font-bold mb-4">Total Comprado</p>
          <h3 className="text-4xl font-bold text-slate-300">{displayComprado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{sym}</h3>
          <div className="w-full h-px bg-slate-800 my-6"></div>
          <p className="text-slate-400 font-bold mb-4">Total Vendido</p>
          <h3 className="text-4xl font-bold text-slate-300">{displayVendido.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{sym}</h3>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl mt-8">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-xl font-bold">Gestión de Riesgo (Posiciones Activas)</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-950/50 text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th className="p-6">Moneda</th>
                <th className="p-6">Cantidad</th>
                <th className="p-6">Precio Coste</th>
                <th className="p-6">Take Profit</th>
                <th className="p-6">Stop Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {activePositions.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-slate-500 font-bold">No tienes posiciones de riesgo abiertas.</td></tr>
              ) : (
                activePositions.map((pos, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-all">
                    <td className="p-6 font-bold">{pos.ticker}</td>
                    <td className="p-6 text-slate-300 font-bold">{pos.amount}</td>
                    <td className="p-6 font-bold">{(pos.buyPrice * rate).toLocaleString(undefined, { maximumFractionDigits: 4 })}{sym}</td>
                    <td className="p-6 font-bold text-green-400">{pos.tp ? `${(pos.tp * rate).toLocaleString(undefined, { maximumFractionDigits: 4 })}${sym}` : '-'}</td>
                    <td className="p-6 font-bold text-red-400">{pos.sl ? `${(pos.sl * rate).toLocaleString(undefined, { maximumFractionDigits: 4 })}${sym}` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mt-8 shadow-xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-bold">Historial de Operaciones</h3>
          <button
            onClick={handleDownloadSelected}
            disabled={selectedTxs.length === 0}
            className={`font-bold px-4 py-2 rounded-xl text-sm transition-colors ${selectedTxs.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
          >
            📥 Descargar Seleccionadas ({selectedTxs.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-950/50 text-xs font-bold text-slate-500 uppercase">
              <tr>
                <th className="p-6 w-10">
                  <input type="checkbox" className="w-4 h-4 cursor-pointer accent-blue-600" onChange={handleSelectAll} checked={selectedTxs.length === displayedTxs.length && displayedTxs.length > 0} />
                </th>
                <th className="p-6">Fecha/Hora</th>
                <th className="p-6">Tipo</th>
                <th className="p-6">Activo</th>
                <th className="p-6">Cantidad</th>
                <th className="p-6">Valor en Bolsa</th>
                <th className="p-6 text-right">Total Transacción</th>
                <th className="p-6 text-center">Factura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {displayedTxs.length === 0 ? (
                <tr><td colSpan="8" className="p-6 text-center text-slate-500 font-bold">Sin operaciones en mercado recientes.</td></tr>
              ) : (
                displayedTxs.map(tx => {
                  const txId = tx.id || tx.tx_id;
                  
                  return (
                    <tr key={txId || Math.random()} className="hover:bg-slate-800/50 transition-all">
                      <td className="p-6">
                        <input type="checkbox" className="w-4 h-4 cursor-pointer accent-blue-600" checked={selectedTxs.includes(txId)} onChange={() => handleSelectRow(txId)} />
                      </td>
                      <td className="p-6 text-sm text-slate-400 font-bold">{formatTxDate(tx)}</td>
                      <td className="p-6"><span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${tx.type === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{tx.type}</span></td>
                      <td className="p-6 font-bold">{tx.ticker}</td>
                      <td className="p-6 font-bold text-slate-300">{tx.amount.toLocaleString()}</td>
                      <td className="p-6 font-bold">{(tx.price * rate).toLocaleString(undefined, { maximumFractionDigits: 4 })}{sym}</td>
                      <td className="p-6 text-right font-bold text-slate-50">{((tx.amount * tx.price) * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}{sym}</td>
                      <td className="p-6 text-center">
                        <button onClick={() => printInvoices([tx], globalUser, rate, sym)} className="bg-blue-600/20 hover:bg-blue-600 hover:text-white text-blue-400 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer">
                          📄 PDF
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}