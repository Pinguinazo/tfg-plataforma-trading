import React, { useState } from 'react';
import { printFiatInvoice } from './FacturaCartera';
import { CRYPTOS } from '../../utils/constants';

export default function Cartera({ globalUser, balance, handleDepositExternal, handleWithdrawExternal, holdings, globalPrices, currency, rate, sym, transactions, updateLotLimits }) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedFiatTxs, setSelectedFiatTxs] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  const fiatTransactions = (transactions || []).filter(tx => tx.type === 'DEPOSIT' || tx.type === 'WITHDRAW');
  const displayedFiatTxs = fiatTransactions.slice(0, 15);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedFiatTxs(displayedFiatTxs.map(tx => tx.id || tx.tx_id));
    else setSelectedFiatTxs([]);
  };

  const handleSelectRow = (txId) => {
    setSelectedFiatTxs(prev => prev.includes(txId) ? prev.filter(id => id !== txId) : [...prev, txId]);
  };

  const handleDownloadSelected = () => {
    if (selectedFiatTxs.length === 0) return;
    const txsToPrint = displayedFiatTxs.filter(tx => selectedFiatTxs.includes(tx.id || tx.tx_id));
    printFiatInvoice(txsToPrint, globalUser, rate, sym);
  };

  const toggleExpand = (symbol) => {
    setExpandedRow(prev => prev === symbol ? null : symbol);
  };

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
      } catch (e) { }
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

  return (
    <div className="space-y-8 w-full">
      <h2 className="text-3xl font-bold mb-6">Mi Cartera ({currency})</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-center shadow-xl">
          <p className="text-slate-400 font-bold mb-2 text-center">Dinero de la cuenta</p>
          <h3 className="text-5xl font-bold text-slate-50 text-center">{(balance * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{sym}</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h4 className="text-xl font-bold mb-2 text-center">Depositar o Retirar</h4>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-sm font-bold text-slate-400 w-full sm:w-16">Depositar</p>
            <input type="number" min="0.01" step="any" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="Ej: 5000" className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-50 outline-none focus:border-blue-500 font-bold" />
            <button onClick={() => { if (Number(depositAmount) > 0) { handleDepositExternal(depositAmount); setDepositAmount(''); } }} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer">Ingresar</button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-sm font-bold text-slate-400 w-full sm:w-16">Retirar</p>
            <input type="number" min="0.01" step="any" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="Ej: 200" className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-50 outline-none focus:border-red-500 font-bold" />
            <button onClick={() => { if (Number(withdrawAmount) > 0) { handleWithdrawExternal(withdrawAmount); setWithdrawAmount(''); } }} className="w-full sm:w-auto bg-red-900/20 border border-red-900/50 hover:bg-red-900/40 text-red-400 hover:text-red-300 font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer">Retirar</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mt-2 shadow-xl">
          <div className="p-6 border-b border-slate-800"><h3 className="text-xl font-bold text-center">Activos Comprados</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-950/50 text-xs font-bold text-slate-500 uppercase">
                <tr><th className="p-4">Moneda</th><th className="p-4">Cantidad</th><th className="p-4">Beneficio</th><th className="p-4 text-right">Valor</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {CRYPTOS.map(crypto => {
                  const symbol = crypto.symbol;
                  const lots = holdings[symbol] || [];
                  const totalAmount = lots.reduce((acc, l) => acc + l.amount, 0);
                  const totalCostUSD = lots.reduce((acc, l) => acc + (l.amount * l.buyPrice), 0);
                  const currentPriceUSD = globalPrices[symbol] || 0;
                  const totalValueUSD = totalAmount * currentPriceUSD;

                  let pnlDisplay = '-';
                  let pnlClass = 'text-slate-500';
                  if (totalAmount > 0) {
                    const pnlUSD = totalValueUSD - totalCostUSD;
                    const isProfit = pnlUSD >= 0;
                    pnlDisplay = `${isProfit ? '+' : ''}${(pnlUSD * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}${sym}`;
                    pnlClass = isProfit ? 'text-green-500' : 'text-red-500';
                  }

                  const isExpanded = expandedRow === symbol;
                  return (
                    <React.Fragment key={symbol}>
                      <tr onClick={() => totalAmount > 0 && toggleExpand(symbol)} className={`transition-all ${totalAmount > 0 ? 'cursor-pointer hover:bg-slate-800/50' : 'opacity-60'}`}>
                        <td className="p-4 font-bold flex items-center gap-2">{crypto.ticker}</td>
                        <td className="p-4 font-bold text-slate-300">{totalAmount > 0 ? totalAmount.toLocaleString() : '0'}</td>
                        <td className={`p-4 font-bold ${pnlClass}`}>{pnlDisplay}</td>
                        <td className="p-4 text-right font-bold text-slate-50">
                          <div className="flex justify-end items-center gap-2">
                            {(totalValueUSD * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}{sym}
                            {totalAmount > 0 && <span className="text-slate-500 text-[10px] bg-slate-950 p-1 rounded border border-slate-800">{isExpanded ? '▼' : '▶'}</span>}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && totalAmount > 0 && (
                        <tr className="bg-slate-950/40">
                          <td colSpan="4" className="p-0 border-l-4 border-blue-600">
                            <div className="p-4 text-sm">
                              <p className="text-xs font-bold text-slate-500 uppercase mb-3">Detalle de Compras (Lotes)</p>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-800">
                                      <th className="pb-2 font-medium">Fecha</th>
                                      <th className="pb-2 font-medium">Cantidad</th>
                                      <th className="pb-2 font-medium">Costo Ud.</th>
                                      <th className="pb-2 font-medium">Take Profit</th>
                                      <th className="pb-2 font-medium">Stop Loss</th>
                                      <th className="pb-2 font-medium text-right">Ganancia</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800/50">
                                    {lots.map((lot, idx) => {
                                      const lotPnlUSD = (currentPriceUSD - lot.buyPrice) * lot.amount;
                                      const lotIsProfit = lotPnlUSD >= 0;
                                      const lotDate = lot.time ? new Date(lot.time * 1000).toLocaleString() : 'Reciente';
                                      return (
                                        <tr key={lot.id || idx} className="text-slate-300">
                                          <td className="py-2 text-xs">{lotDate}</td>
                                          <td className="py-2 font-bold">{lot.amount}</td>
                                          <td className="py-2">{(lot.buyPrice * rate).toLocaleString(undefined, { maximumFractionDigits: 4 })}{sym}</td>
                                          <td className="py-2">
                                            <input type="number" defaultValue={lot.tp || ''} onBlur={(e) => updateLotLimits(symbol, lot.id, parseFloat(e.target.value) || null, lot.sl)} className="w-20 bg-slate-900 border border-green-900/50 rounded px-2 py-1 text-xs text-green-400 outline-none focus:border-green-500" placeholder="-" />
                                          </td>
                                          <td className="py-2">
                                            <input type="number" defaultValue={lot.sl || ''} onBlur={(e) => updateLotLimits(symbol, lot.id, lot.tp, parseFloat(e.target.value) || null)} className="w-20 bg-slate-900 border border-red-900/50 rounded px-2 py-1 text-xs text-red-400 outline-none focus:border-red-500" placeholder="-" />
                                          </td>
                                          <td className={`py-2 text-right font-bold ${lotIsProfit ? 'text-green-500' : 'text-red-500'}`}>
                                            {lotIsProfit ? '+' : ''}{(lotPnlUSD * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}{sym}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mt-2 shadow-xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold">Historial de Cuenta</h3>
            <button onClick={handleDownloadSelected} disabled={selectedFiatTxs.length === 0} className={`font-bold px-3 py-1.5 rounded-lg text-xs transition-colors ${selectedFiatTxs.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
              📥 Descargar ({selectedFiatTxs.length})
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-950/50 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-4 w-10">
                    <input type="checkbox" className="w-4 h-4 cursor-pointer accent-blue-600" onChange={handleSelectAll} checked={selectedFiatTxs.length === displayedFiatTxs.length && displayedFiatTxs.length > 0} />
                  </th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Importe</th>
                  <th className="p-4 text-center">Justificante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {displayedFiatTxs.length === 0 ? (
                  <tr><td colSpan="5" className="p-6 text-center text-slate-500 font-bold">Sin ingresos ni retiros.</td></tr>
                ) : (
                  displayedFiatTxs.map(tx => {
                    const txId = tx.id || tx.tx_id;
                    return (
                      <tr key={txId || Math.random()} className="hover:bg-slate-800/50 transition-all">
                        <td className="p-4">
                          <input type="checkbox" className="w-4 h-4 cursor-pointer accent-blue-600" checked={selectedFiatTxs.includes(txId)} onChange={() => handleSelectRow(txId)} />
                        </td>
                        <td className="p-4 text-sm text-slate-400 font-bold">{formatTxDate(tx)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${tx.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {tx.type === 'DEPOSIT' ? 'DEPÓSITO' : 'RETIRO'}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-50">{(tx.amount * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}{sym}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => printFiatInvoice([tx], globalUser, rate, sym)} className="bg-blue-600/20 hover:bg-blue-600 hover:text-white text-blue-400 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer">
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
    </div>
  );
}