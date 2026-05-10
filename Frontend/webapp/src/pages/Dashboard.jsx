import { useState, useEffect, useCallback } from 'react';
import { EXCHANGE_RATES, CURRENCY_SYMBOLS } from '../utils/constants';

import TradingTab from './trading/Trading'; // Ajusta la ruta si es TradingTab.jsx
import PortfolioTab from './trading/Cartera'; // Ajusta la ruta si es PortfolioTab.jsx
import AnalyticsTab from './trading/AnalyticsTab';
import SettingsTab from './trading/Ajustes'; // Ajusta la ruta si es SettingsTab.jsx

export default function Dashboard({ onLogout, globalUser, setGlobalUser }) {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [currency, setCurrency] = useState('USD');
  const rate = EXCHANGE_RATES[currency];
  const sym = CURRENCY_SYMBOLS[currency];
  
  const [balance, setBalance] = useState(globalUser.balance || 10000);
  const [totalDeposited, setTotalDeposited] = useState(globalUser.totalDeposited || 10000); 
  const [holdings, setHoldings] = useState(globalUser.holdings || {}); 
  
  const [transactions, setTransactions] = useState([]);
  const [globalPrices, setGlobalPrices] = useState({}); 
  const [wealthHistory, setWealthHistory] = useState([]);
  const [logs, setLogs] = useState([]); 
  const [toasts, setToasts] = useState([]);

  const fetchHistorial = async () => {
    if (!globalUser || (!globalUser.id && !globalUser.user_id)) return;
    try {
      const userId = globalUser.id || globalUser.user_id;
      // USAMOS LA VARIABLE DE ENTORNO SI LA TIENES, O TU IP LOCAL
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/users/${userId}/transactions`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error conectando con Cassandra para el historial:", error);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, [globalUser]);

  useEffect(() => {
    const fetchGlobalPrices = () => {
      fetch('https://api.binance.com/api/v3/ticker/price')
        .then(res => res.json())
        .then(data => {
          const pricesObj = {};
          data.forEach(item => pricesObj[item.symbol] = parseFloat(item.price));
          setGlobalPrices(pricesObj);
        }).catch(() => {});
    };
    fetchGlobalPrices();
    const interval = setInterval(fetchGlobalPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (transactions.length === 0) return; 
    const portfolioCryptoValue = Object.keys(holdings).reduce((acc, symbol) => {
      const lots = holdings[symbol] || [];
      const totalAmount = lots.reduce((sum, lot) => sum + lot.amount, 0);
      const currentPrice = globalPrices[symbol] || (lots.length > 0 ? lots[0].buyPrice : 0);
      return acc + (totalAmount * currentPrice);
    }, 0);
    const currentTotalWealth = balance + portfolioCryptoValue;
    const now = Math.floor(Date.now() / 1000);

    setWealthHistory(prev => {
      if (prev.length === 0) return [{ time: now - 60, value: totalDeposited }, { time: now, value: currentTotalWealth }];
      const last = prev[prev.length - 1];
      if (now <= last.time) { const updated = [...prev]; updated[updated.length - 1] = { time: last.time, value: currentTotalWealth }; return updated; }
      return [...prev, { time: now, value: currentTotalWealth }];
    });
  }, [balance, holdings, globalPrices, transactions.length, totalDeposited]);

  const logEvent = useCallback((message, type = 'info') => {
    const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const newLog = { id, message, type, time: new Date().toLocaleTimeString() };
    setLogs(prev => [newLog, ...prev]); setToasts(prev => [newLog, ...prev]); 
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 4000);
  }, []);

  const callApiTrade = async (type, symbol, ticker, amount, priceUSD, newBalance, newHoldings) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: globalUser.id || globalUser.user_id,
          type, symbol, ticker, amount, price: priceUSD,
          balance: newBalance,
          holdings: newHoldings
        })
      });
      if (res.ok) {
        setGlobalUser(prev => ({ ...prev, balance: newBalance, holdings: newHoldings }));
        fetchHistorial();
      }
    } catch(e) { 
      console.error('Error API persist:', e);
      logEvent("Error conectando con base Cassandra", "error");
    }
  };

  const updateLotLimits = async (symbol, lotId, newTp, newSl) => {
    const lots = holdings[symbol] || [];
    const updatedLots = lots.map(l => l.id === lotId ? { ...l, tp: newTp, sl: newSl } : l);
    const newHoldings = { ...holdings, [symbol]: updatedLots };
    
    setHoldings(newHoldings);
    setGlobalUser(prev => ({ ...prev, holdings: newHoldings }));
    logEvent('Límites actualizados', 'success');

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await fetch(`${apiUrl}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: globalUser.id || globalUser.user_id,
          balance: balance,
          total_deposited: totalDeposited,
          holdings: newHoldings
        })
      });
    } catch (e) { console.error('Error sincronizando límites:', e); }
  };

  const handleTrade = (type, symbol, ticker, amount, priceUSD, candleTime, lotId = null, tp = null, sl = null) => {
    if (type === 'BUY') {
      const costUSD = amount * priceUSD;
      if (balance < costUSD) return logEvent(`Saldo insuficiente`, 'error');
      
      const newBalance = balance - costUSD;
      setBalance(newBalance);
      const newLot = { id: Date.now().toString(), amount: amount, buyPrice: priceUSD, ticker: ticker, time: candleTime, tp: tp, sl: sl };
      const newHoldings = { ...holdings, [symbol]: [...(holdings[symbol] || []), newLot] };
      setHoldings(newHoldings);
      
      logEvent(`Compra de ${amount} ${ticker} exitosa`, 'success');
      setTransactions(prev => [{ id: Date.now(), type: 'BUY', symbol, ticker, amount, price: priceUSD, date: new Date().toLocaleTimeString() }, ...prev]);
      callApiTrade('BUY', symbol, ticker, amount, priceUSD, newBalance, newHoldings);
      
    } else if (type === 'SELL_LOT') {
      const lots = holdings[symbol] || []; const lotToSell = lots.find(l => l.id === lotId); if (!lotToSell) return;
      const revenueUSD = lotToSell.amount * priceUSD;
      const newBalance = balance + revenueUSD;
      setBalance(newBalance);
      
      let newHoldings = { ...holdings };
      const remainingLots = lots.filter(l => l.id !== lotId); 
      if (remainingLots.length === 0) delete newHoldings[symbol]; else newHoldings[symbol] = remainingLots; 
      setHoldings(newHoldings);
      logEvent(`Venta de ${lotToSell.amount} ${ticker} ejecutada a ${(priceUSD * rate).toFixed(2)}${sym}`, 'success');
      setTransactions(prev => [{ id: Date.now(), type: 'SELL', symbol, ticker, amount: lotToSell.amount, price: priceUSD, date: new Date().toLocaleTimeString() }, ...prev]);
      callApiTrade('SELL', symbol, ticker, lotToSell.amount, priceUSD, newBalance, newHoldings);

    } else if (type === 'SELL_ALL') {
      const lots = holdings[symbol] || []; if (lots.length === 0) return;
      const totalAmount = lots.reduce((acc, l) => acc + l.amount, 0);
      const revenueUSD = totalAmount * priceUSD;
      
      const newBalance = balance + revenueUSD;
      setBalance(newBalance);
      
      const newHoldings = { ...holdings };
      delete newHoldings[symbol]; 
      setHoldings(newHoldings);
      
      logEvent(`Has vendido todos tus ${ticker}`, 'success');
      setTransactions(prev => [{ id: Date.now(), type: 'SELL', symbol, ticker, amount: totalAmount, price: priceUSD, date: new Date().toLocaleTimeString() }, ...prev]);
      callApiTrade('SELL', symbol, ticker, totalAmount, priceUSD, newBalance, newHoldings);
    }
  };

  const handleDepositExternal = async (depositAmount) => {
    const amountLocal = parseFloat(depositAmount);
    if (isNaN(amountLocal) || amountLocal <= 0) return logEvent('Cantidad inválida', 'error');
    
    const amountUSD = amountLocal / rate;
    const newBalance = balance + amountUSD;
    const newTotalDeposit = totalDeposited + amountUSD;
    
    setBalance(newBalance); setTotalDeposited(newTotalDeposit);
    logEvent(`Has ingresado ${sym}${amountLocal.toLocaleString()} a cuenta.`, 'success');
    callApiTrade('DEPOSIT', 'FIAT', 'Efectivo', amountUSD, 1, newBalance, holdings);
  }

  const handleWithdrawExternal = async (withdrawAmount) => {
    const amountLocal = parseFloat(withdrawAmount);
    if (isNaN(amountLocal) || amountLocal <= 0) return logEvent('Cantidad inválida', 'error');
    
    const amountUSD = amountLocal / rate;
    if (balance < amountUSD) return logEvent('Fondos insuficientes para retirar', 'error');

    const newBalance = balance - amountUSD;
    
    setBalance(newBalance);
    logEvent(`Has retirado ${sym}${amountLocal.toLocaleString()} de tu cuenta.`, 'success'); 
    callApiTrade('WITHDRAW', 'FIAT', 'Efectivo', amountUSD, 1, newBalance, holdings);
  }

  const tierColor = globalUser.tier === 'Élite' ? 'text-purple-500' : globalUser.tier === 'Pro' ? 'text-blue-500' : 'text-slate-400';
  const userInitial = globalUser.username ? globalUser.username.charAt(0).toUpperCase() : 'U';

  const NavItem = ({ id, label, icon }) => (
    <button onClick={() => setActiveTab(id)} className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === id ? 'bg-blue-600/10 text-blue-500' : 'text-slate-400 hover:text-slate-50 hover:bg-slate-900'}`}>{icon} {label}</button>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex w-full text-slate-50 relative">
      {/* MENÚ LATERAL PARA ORDENADORES */}
      <aside className="w-64 border-r border-slate-800 hidden md:flex flex-col sticky top-0 h-screen bg-slate-950 z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10"><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold">T</span></div><span className="text-xl font-bold">TradingPulse</span></div>
          <nav className="space-y-2">
            <NavItem id="overview" label="Trading Panel" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>} />
            <NavItem id="portfolio" label="Mi Cartera" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>} />
            <NavItem id="analytics" label="Análisis" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>} />
            <NavItem id="settings" label="Ajustes" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.31c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} />
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-slate-800 flex flex-col items-center gap-4 bg-slate-900/50">
          <div className="flex flex-col items-center text-center gap-2">
            <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold bg-slate-900 border-slate-700 text-xl text-slate-300 shadow-inner`}>
              {userInitial}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-50">{globalUser.username || 'Mi Cuenta'}</p>
              <p className={`text-xs font-bold uppercase ${tierColor}`}>Plan {globalUser.tier}</p>
            </div>
          </div>
          <button onClick={onLogout} className="cursor-pointer w-full flex justify-center items-center gap-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold p-3 rounded-xl transition-all border border-red-500/20 shadow-lg text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL (Le he añadido pb-24 para que el contenido no quede oculto por la barra móvil) */}
      <main className="flex-1 min-w-0 flex flex-col p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto w-full">
        {activeTab === 'overview' && <TradingTab updateLotLimits={updateLotLimits} globalUser={globalUser} logEvent={logEvent} balance={balance} handleTrade={handleTrade} holdings={holdings} currency={currency} rate={rate} sym={sym} />}
        {activeTab === 'portfolio' && <PortfolioTab updateLotLimits={updateLotLimits} globalUser={globalUser} balance={balance} handleDepositExternal={handleDepositExternal} handleWithdrawExternal={handleWithdrawExternal} holdings={holdings} globalPrices={globalPrices} currency={currency} rate={rate} sym={sym} transactions={transactions} />}
        {activeTab === 'analytics' && <AnalyticsTab globalUser={globalUser} balance={balance} holdings={holdings} globalPrices={globalPrices} totalDeposited={totalDeposited} currency={currency} rate={rate} sym={sym} transactions={transactions} wealthHistory={wealthHistory} />}
        {activeTab === 'settings' && (<SettingsTab globalUser={globalUser} setGlobalUser={setGlobalUser} currency={currency} setCurrency={setCurrency} logEvent={logEvent} onLogout={onLogout} />)}
      </main>

      {/* 🚀 AQUÍ ESTÁ LA BARRA MÓVIL (Bottom Nav) QUE FALTABA 🚀 */}
      {/* md:hidden hace que en PC desaparezca, fixed bottom-0 la clava abajo */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 z-50 flex justify-around items-center p-2 pb-safe">
        <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'overview' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-400'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span className="text-[10px] font-bold">Trading</span>
        </button>

        <button onClick={() => setActiveTab('portfolio')} className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'portfolio' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-400'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
          <span className="text-[10px] font-bold">Cartera</span>
        </button>

        <button onClick={() => setActiveTab('analytics')} className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'analytics' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-400'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          <span className="text-[10px] font-bold">Análisis</span>
        </button>

        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'settings' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-400'}`}>
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.31c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span className="text-[10px] font-bold">Ajustes</span>
        </button>
      </nav>

      {/* NOTIFICACIONES TOAST */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex flex-col gap-2 pointer-events-none transition-all">
        {toasts.map(log => (
          <div key={log.id} className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 bg-slate-900 ${log.type === 'error' ? 'border-red-500/50 text-red-100' : log.type === 'success' ? 'border-green-500/50 text-green-100' : 'border-blue-500/50 text-blue-100'}`}><span className="text-sm font-bold">{log.message}</span></div>
        ))}
      </div>
    </div>
  );
}