import { useState } from 'react';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export default function Register({ handleRegister, regName, setRegName, regEmail, setRegEmail, regPass, setRegPass, registerError }) {
  const [selectedTier, setSelectedTier] = useState('Básico');
  const [showPassword, setShowPassword] = useState(false);

  const onFormSubmit = (e) => {
    e.preventDefault();
    handleRegister(e, selectedTier);
  };

  const handleCustomValidation = (e, customMessage) => {
    if (e.target.validity.patternMismatch) {
      e.target.setCustomValidity(customMessage);
    } else {
      e.target.setCustomValidity('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 p-6 md:p-10 rounded-2xl md:rounded-3xl mt-6 md:mt-10 shadow-2xl mx-4 lg:mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center text-slate-100">Crear Cuenta TradingPulse</h1>
      {registerError && (
        <div className="mb-6 p-4 rounded-xl border font-bold text-sm bg-red-900/20 border-red-900/50 text-red-400 text-center">
          {registerError}
        </div>
      )}
      <p className="text-slate-400 mb-6 md:mb-8 text-center text-sm md:text-base">Únete y elige el rango que mejor se adapte a tu trading.</p>
      
      <form className="space-y-6 md:space-y-8" onSubmit={onFormSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-slate-950 p-4 md:p-6 rounded-2xl border border-slate-800">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">Nombre de Usuario</label>
            <input 
              type="text" 
              value={regName} 
              onChange={e => { e.target.setCustomValidity(''); setRegName(e.target.value); }} 
              onInvalid={e => handleCustomValidation(e, "El nombre no puede contener símbolos como < > o `")}
              pattern="[^<>\`]{1,50}"
              placeholder="Usuario" 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-slate-100 font-bold" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              value={regEmail} 
              onChange={e => { e.target.setCustomValidity(''); setRegEmail(e.target.value); }} 
              onInvalid={e => handleCustomValidation(e, "Introduce un correo válido (ej: usuario@dominio.com).")}
              pattern="[a-zA-Z0-9._%\+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,10}"
              placeholder="usuario@dominio.com" 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-slate-100 font-bold" 
              required 
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-400 mb-2">Contraseña</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={regPass} 
                onChange={e => { e.target.setCustomValidity(''); setRegPass(e.target.value); }} 
                onInvalid={e => handleCustomValidation(e, "La contraseña contiene caracteres no permitidos.")}
                pattern="[^<>\`]{1,50}"
                placeholder="••••••••" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-slate-100 font-bold pr-12" 
                required 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-4 text-center">Selecciona tu Plan de Suscripción</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div onClick={() => setSelectedTier('Básico')} className={`cursor-pointer p-5 rounded-xl border-2 transition-all flex flex-col items-center text-center ${selectedTier === 'Básico' ? 'border-blue-500 bg-blue-500/10 md:scale-105 shadow-lg' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`}>
              <h4 className="font-bold text-slate-200">Básico</h4>
              <p className="text-2xl font-bold my-2">$0<span className="text-xs text-slate-500">/mes</span></p>
              <p className="text-xs text-slate-400">Estándar del mercado. Ideal para empezar.</p>
            </div>
            
            <div onClick={() => setSelectedTier('Pro')} className={`cursor-pointer p-5 rounded-xl border-2 transition-all flex flex-col items-center text-center ${selectedTier === 'Pro' ? 'border-blue-500 bg-blue-500/10 md:scale-105 shadow-lg' : 'border-slate-800 bg-slate-950 hover:border-blue-900'}`}>
              <h4 className="font-bold text-blue-400">Pro</h4>
              <p className="text-2xl font-bold my-2">$15<span className="text-xs text-slate-500">/mes</span></p>
              <p className="text-xs text-slate-400">Herramientas avanzadas y gestión ilimitada.</p>
            </div>

            <div onClick={() => setSelectedTier('Élite')} className={`cursor-pointer p-5 rounded-xl border-2 transition-all flex flex-col items-center text-center ${selectedTier === 'Élite' ? 'border-purple-500 bg-purple-500/10 md:scale-105 shadow-lg shadow-purple-500/20' : 'border-slate-800 bg-slate-950 hover:border-purple-900'}`}>
              <h4 className="font-bold text-purple-400">Élite</h4>
              <p className="text-2xl font-bold my-2">$49<span className="text-xs text-slate-500">/mes</span></p>
              <p className="text-xs text-slate-400">Todo incluido, soporte prioritario y consultorías.</p>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all text-base md:text-lg shadow-lg shadow-blue-500/25">
          Completar Registro ({selectedTier})
        </button>
      </form>
    </div>
  );
}