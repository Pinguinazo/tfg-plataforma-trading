import { useState, useEffect } from 'react';

export default function SettingsTab({ globalUser, setGlobalUser, currency, setCurrency, logEvent, onLogout }) {
  const [editing, setEditing] = useState(null);
  const [formUsername, setFormUsername] = useState(globalUser?.username || '');
  const [formEmail, setFormEmail] = useState(globalUser?.email || '');
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

  const AVAILABLE_CURRENCIES = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' }
  ];

  useEffect(() => {
    setFormUsername(globalUser?.username || '');
    setFormEmail(globalUser?.email || '');
  }, [globalUser]);

  const maskEmail = (email) => {
    if (!email || !email.includes('@')) return 'Sin correo definido';
    const [name, domain] = email.split('@');
    return `${name.substring(0, 2)}••••••@${domain}`;
  };
  
  const updateCassandraUser = async (updatedData) => {
    try {
      const userId = globalUser?.id || globalUser?.user_id;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();

      if (!res.ok) {
         logEvent(data.error || 'Fallo en la actualización de Cassandra', 'error');
         return false;
      }
      return true;
    } catch (e) {
      console.error(e);
      logEvent('Error de conexión con el servidor', 'error');
      return false;
    }
  };

  const saveUsername = async (e) => {
    e.preventDefault();
    if (!formUsername || formUsername.trim() === '') return logEvent('El usuario no puede estar vacío', 'error');
    const success = await updateCassandraUser({ username: formUsername });
    if (success) {
      setGlobalUser(prev => ({ ...prev, username: formUsername }));
      setEditing(null);
      logEvent('Nombre de usuario actualizado con éxito', 'success');
    }
  };

  const saveEmail = async (e) => {
    e.preventDefault();
    if (!formEmail || formEmail.trim() === '') return logEvent('El email no puede estar vacío', 'error');
    const success = await updateCassandraUser({ email: formEmail });
    if (success) {
      setGlobalUser(prev => ({ ...prev, email: formEmail }));
      setEditing(null);
      logEvent('Correo electrónico persistido en Cassandra', 'success');
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return logEvent('Las contraseñas nuevas no coinciden', 'error');
    if (!passwords.old) return logEvent('Debes introducir tu contraseña actual', 'error');
    const success = await updateCassandraUser({ password: passwords.new, oldPassword: passwords.old });
    if (success) {
      setPasswords({ old: '', new: '', confirm: '' });
      setEditing(null);
      logEvent('Contraseña actualizada de forma segura', 'success');
    }
  };

  const savePlan = async (tier) => {
    const success = await updateCassandraUser({ tier: tier });
    if (success) {
      const newRole = tier === 'Élite' ? 'admin' : 'user';
      setGlobalUser(prev => ({ ...prev, tier: tier, role: newRole }));
      setEditing(null);
      logEvent(`Suscripción actualizada a Plan ${tier} en Cassandra`, 'success');
    }
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    setEditing(null);
    logEvent(`Moneda principal cambiada a ${newCurrency}`, 'success');
  };

  const currentSymbol = AVAILABLE_CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  return (
    <div className="space-y-8 max-w-4xl w-full">
      <h2 className="text-3xl font-bold mb-6 text-slate-100">Configuración de la Cuenta</h2>
      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl mb-8">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-xl font-bold text-green-400">Divisa</h3>
        </div>
        <div className="p-6 transition-colors hover:bg-slate-800/20">
            {editing === 'currency' ? (
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-400">Selecciona tu moneda principal</label>
                <div className="flex flex-wrap gap-4">
                  {AVAILABLE_CURRENCIES.map(curr => (
                    <button 
                      key={curr.code} 
                      onClick={() => handleCurrencyChange(curr.code)}
                      className={`px-6 py-3 rounded-xl border-2 font-bold transition-all cursor-pointer ${currency === curr.code ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'}`}
                    >
                      {curr.code} ({curr.symbol})
                    </button>
                  ))}
                </div>
                <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white font-bold text-sm underline mt-2 block cursor-pointer">Cancelar</button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400 font-bold mb-1">Moneda de la plataforma (Facturas y Gráficos)</p>
                  <p className="text-lg text-slate-100 font-bold tracking-wider">{currency} ({currentSymbol})</p>
                </div>
                <button onClick={() => setEditing('currency')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2 rounded-xl transition-all border border-slate-700 text-sm w-max cursor-pointer">Cambiar Moneda</button>
              </div>
            )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-xl font-bold text-blue-400">Datos de Acceso</h3>
        </div>

        <div className="divide-y divide-slate-800/50">
          <div className="p-6 transition-colors hover:bg-slate-800/20">
            {editing === 'username' ? (
              <form onSubmit={saveUsername} className="space-y-4">
                <label className="block text-sm font-bold text-slate-400">Nuevo Nombre de Usuario</label>
                <input autoFocus type="text" value={formUsername} onChange={e => setFormUsername(e.target.value)} className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-50 font-bold outline-none focus:border-blue-500" required />
                <div className="flex gap-3">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-xl transition-all cursor-pointer">Guardar</button>
                  <button type="button" onClick={() => {setEditing(null); setFormUsername(globalUser?.username);}} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2 rounded-xl transition-all cursor-pointer">Cancelar</button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400 font-bold mb-1">Nombre de Usuario</p>
                  <p className="text-lg text-slate-100 font-bold">{globalUser?.username || 'No definido'}</p>
                </div>
                <button onClick={() => setEditing('username')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2 rounded-xl transition-all border border-slate-700 text-sm w-max cursor-pointer">Cambiar Usuario</button>
              </div>
            )}
          </div>

          <div className="p-6 transition-colors hover:bg-slate-800/20">
            {editing === 'email' ? (
              <form onSubmit={saveEmail} className="space-y-4">
                <label className="block text-sm font-bold text-slate-400">Nuevo Correo Electrónico</label>
                <input autoFocus type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-50 font-bold outline-none focus:border-blue-500" required />
                <div className="flex gap-3">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-xl transition-all cursor-pointer">Guardar</button>
                  <button type="button" onClick={() => {setEditing(null); setFormEmail(globalUser?.email);}} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2 rounded-xl transition-all cursor-pointer">Cancelar</button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400 font-bold mb-1">Correo Electrónico</p>
                  <p className="text-lg text-slate-100 font-bold tracking-wider">{maskEmail(globalUser?.email)}</p>
                </div>
                <button onClick={() => setEditing('email')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2 rounded-xl transition-all border border-slate-700 text-sm w-max cursor-pointer">Cambiar Email</button>
              </div>
            )}
          </div>

          <div className="p-6 transition-colors hover:bg-slate-800/20">
            {editing === 'password' ? (
              <form onSubmit={savePassword} className="space-y-4 max-w-md">
                <div><label className="block text-sm font-bold text-slate-400 mb-2">Contraseña Actual</label><input type="password" value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-50 font-bold outline-none focus:border-blue-500" required /></div>
                <div><label className="block text-sm font-bold text-slate-400 mb-2">Nueva Contraseña</label><input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-50 font-bold outline-none focus:border-blue-500" required /></div>
                <div><label className="block text-sm font-bold text-slate-400 mb-2">Repetir Nueva Contraseña</label><input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-50 font-bold outline-none focus:border-blue-500" required /></div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-xl transition-all cursor-pointer">Actualizar Contraseña</button>
                  <button type="button" onClick={() => {setEditing(null); setPasswords({old:'', new:'', confirm:''})}} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2 rounded-xl transition-all cursor-pointer">Cancelar</button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400 font-bold mb-1">Seguridad</p>
                  <p className="text-lg text-slate-100 font-bold tracking-widest mt-2">••••••••••••</p>
                </div>
                <button onClick={() => setEditing('password')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2 rounded-xl transition-all border border-slate-700 text-sm w-max cursor-pointer">Modificar Clave</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-purple-400">Tu Suscripción</h3>
          <span className="bg-slate-950 border border-slate-700 px-3 py-1 rounded-lg text-xs font-bold text-slate-300 uppercase">Plan {globalUser?.tier || 'BÁSICO'}</span>
        </div>
        
        <div className="p-6">
          {editing === 'plan' ? (
            <div className="space-y-6">
              <p className="text-slate-400 mb-4">Selecciona el nuevo plan.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => savePlan('Básico')} className="p-6 rounded-2xl border-2 border-slate-800 bg-slate-950 hover:border-slate-600 transition-all flex flex-col gap-2 text-left cursor-pointer">
                  <span className="font-bold text-slate-300">Básico</span><span className="text-2xl font-bold">$0<span className="text-xs text-slate-500">/mes</span></span>
                </button>
                <button onClick={() => savePlan('Pro')} className="p-6 rounded-2xl border-2 border-slate-800 bg-slate-950 hover:border-blue-600 transition-all flex flex-col gap-2 text-left cursor-pointer">
                  <span className="font-bold text-blue-400">Pro</span><span className="text-2xl font-bold">$15<span className="text-xs text-slate-500">/mes</span></span>
                </button>
                <button onClick={() => savePlan('Élite')} className="p-6 rounded-2xl border-2 border-slate-800 bg-slate-950 hover:border-purple-500 transition-all flex flex-col gap-2 text-left cursor-pointer">
                  <span className="font-bold text-purple-400">Élite</span><span className="text-2xl font-bold">$49<span className="text-xs text-slate-500">/mes</span></span>
                </button>
              </div>
              <button onClick={() => setEditing(null)} className="mt-4 text-slate-400 hover:text-white font-bold text-sm underline cursor-pointer">Cancelar</button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="max-w-xl">
                <p className="text-slate-300 text-sm mt-2">Actualmente disfrutas del plan <strong className="text-white">{globalUser?.tier || 'Básico'}</strong>.</p>
              </div>
              <button onClick={() => setEditing('plan')} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 text-sm w-max whitespace-nowrap cursor-pointer">Gestionar Plan</button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-800">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Gestión de Cuenta</h4>
        <div className="bg-red-900/10 border border-red-900/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-red-200 font-bold">¿Deseas salir de TradingPulse?</p>
            <p className="text-red-400/70 text-sm">Se cerrará tu sesión de forma segura en este dispositivo.</p>
          </div>
          <button 
            onClick={onLogout} 
            className="w-full md:w-auto cursor-pointer flex justify-center items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}