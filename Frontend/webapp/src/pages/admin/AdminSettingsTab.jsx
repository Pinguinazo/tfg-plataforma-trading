import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminSettingsTab({ adminUser, onLogout }) {
  const [editing, setEditing] = useState(null);
  const [formUsername, setFormUsername] = useState(adminUser?.username || '');
  const [formEmail, setFormEmail] = useState(adminUser?.email || '');
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setFormUsername(adminUser?.username || '');
    setFormEmail(adminUser?.email || '');
  }, [adminUser]);

  const showMessage = (msg, type = 'success') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const isValidEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]{1,35}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
    return email && email.length <= 50 && re.test(email);
  };

  const isSafeText = (text) => {
    const re = /^[^<>`]{1,50}$/;
    return text && text.length <= 50 && re.test(text);
  };

  const updateAdminData = async (updatedData) => {
    const userId = adminUser.admin_id || adminUser.id || adminUser.user_id;
    const isMaster = adminUser.role?.toLowerCase() === 'master';
    const endpoint = isMaster
      ? `${API_URL}/api/admin/master/${userId}`
      : `${API_URL}/api/admin/managers/${userId}`;

    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    if (!res.ok) {
      const errorData = await res.json();
      showMessage("Error del servidor: " + (errorData.error || "Desconocido"), "error");
    }
    return res.ok;
  };

  const saveUsername = async (e) => {
    e.preventDefault();
    if (!isSafeText(formUsername)) return showMessage('Nombre inválido o contiene caracteres prohibidos', 'error');
    if (await updateAdminData({ username: formUsername })) {
      setEditing(null);
      showMessage('Nombre de usuario actualizado (requiere reconectar)');
    }
  };

  const saveEmail = async (e) => {
    e.preventDefault();
    if (!isValidEmail(formEmail)) return showMessage('Por favor, introduce un correo válido', 'error');
    if (await updateAdminData({ email: formEmail })) {
      setEditing(null);
      showMessage('Correo electrónico actualizado');
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!isSafeText(passwords.new) || !isSafeText(passwords.old)) return showMessage('Las contraseñas contienen caracteres no permitidos', 'error');
    if (passwords.new !== passwords.confirm) return showMessage('Las contraseñas nuevas no coinciden', 'error');
    if (!passwords.old) return showMessage('Debes introducir tu contraseña actual', 'error');
    
    if (await updateAdminData({ password: passwords.new, oldPassword: passwords.old })) {
      setPasswords({ old: '', new: '', confirm: '' });
      setEditing(null);
      showMessage('Contraseña actualizada de forma segura');
    }
  };

  const maskEmail = (email) => {
    if (!email || !email.includes('@')) return 'Sin correo definido';
    const [name, domain] = email.split('@');
    return `${name.substring(0, 2)}••••••@${domain}`;
  };

  return (
    <div className="flex-1 p-4 md:p-10 bg-[#0B0F19] overflow-y-auto max-h-screen custom-scrollbar relative">
      <header className="mb-6 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Ajustes de Administrador</h2>
        <p className="text-slate-500 text-sm mt-1">Gestiona las credenciales de tu cuenta de acceso al panel de control.</p>
      </header>

      {message && (
        <div className={`mb-6 p-4 rounded-xl border font-bold text-sm ${message.type === 'error' ? 'bg-red-900/20 border-red-900/50 text-red-400' : 'bg-green-900/20 border-green-900/50 text-green-400'}`}>
          {message.text}
        </div>
      )}
      
      <div className="max-w-4xl space-y-8">
        
        <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 bg-[#0B0F19]/50">
            <h3 className="text-xl font-bold text-blue-400">Datos de Acceso</h3>
          </div>

          <div className="divide-y divide-slate-800/50">
            <div className="p-6 transition-colors hover:bg-slate-800/20">
              {editing === 'username' ? (
                <form onSubmit={saveUsername} className="space-y-4">
                  <label className="block text-sm font-bold text-slate-400">Nuevo Nombre de Usuario</label>
                  <input autoFocus type="text" value={formUsername} onChange={e => setFormUsername(e.target.value)} className="w-full max-w-md bg-[#0B0F19] border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500" required />
                  <div className="flex gap-3">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-xl transition-all">Guardar</button>
                    <button type="button" onClick={() => {setEditing(null); setFormUsername(adminUser?.username);}} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2 rounded-xl transition-all">Cancelar</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400 font-bold mb-1">Nombre de Usuario</p>
                    <p className="text-lg text-slate-100 font-bold">@{adminUser?.username || 'No definido'}</p>
                  </div>
                  <button onClick={() => setEditing('username')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2 rounded-xl transition-all border border-slate-700 text-sm w-max">Cambiar</button>
                </div>
              )}
            </div>

            <div className="p-6 transition-colors hover:bg-slate-800/20">
              {editing === 'email' ? (
                <form onSubmit={saveEmail} className="space-y-4">
                  <label className="block text-sm font-bold text-slate-400">Nuevo Correo Electrónico</label>
                  <input autoFocus type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full max-w-md bg-[#0B0F19] border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500" required />
                  <div className="flex gap-3">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-xl transition-all">Guardar</button>
                    <button type="button" onClick={() => {setEditing(null); setFormEmail(adminUser?.email);}} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2 rounded-xl transition-all">Cancelar</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400 font-bold mb-1">Correo Electrónico</p>
                    <p className="text-lg text-slate-100 font-bold tracking-wider">{maskEmail(adminUser?.email)}</p>
                  </div>
                  <button onClick={() => setEditing('email')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2 rounded-xl transition-all border border-slate-700 text-sm w-max">Cambiar</button>
                </div>
              )}
            </div>

            <div className="p-6 transition-colors hover:bg-slate-800/20">
              {editing === 'password' ? (
                <form onSubmit={savePassword} className="space-y-4 max-w-md">
                  <div><label className="block text-sm font-bold text-slate-400 mb-2">Contraseña Actual</label><input type="password" value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500" required /></div>
                  <div><label className="block text-sm font-bold text-slate-400 mb-2">Nueva Contraseña</label><input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500" required /></div>
                  <div><label className="block text-sm font-bold text-slate-400 mb-2">Repetir Nueva Contraseña</label><input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500" required /></div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="bg-red-700 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-xl transition-all">Actualizar Clave</button>
                    <button type="button" onClick={() => {setEditing(null); setPasswords({old:'', new:'', confirm:''})}} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2 rounded-xl transition-all">Cancelar</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400 font-bold mb-1">Seguridad de la Cuenta</p>
                    <p className="text-lg text-slate-100 font-bold tracking-widest mt-2">••••••••••••</p>
                  </div>
                  <button onClick={() => setEditing('password')} className="bg-red-900/30 hover:bg-red-900/50 text-red-400 font-bold px-6 py-2 rounded-xl transition-all border border-red-900/50 text-sm w-max">Modificar Clave</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="bg-red-900/10 border border-red-900/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-red-200 font-bold">¿Deseas salir del Panel de Control?</p>
              <p className="text-red-400/70 text-sm">Se cerrará tu sesión de forma segura en este dispositivo.</p>
            </div>
            
            <button 
              onClick={onLogout} 
              className="w-full md:w-auto cursor-pointer flex justify-center items-center gap-2 bg-red-700 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}