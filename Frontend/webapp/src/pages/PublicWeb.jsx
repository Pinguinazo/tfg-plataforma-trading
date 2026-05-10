import { useState } from 'react';
import Navbar from './web/Navbar';
import Home from './web/Home';
import About from './web/About';
import Services from './web/Services';
import Pricing from './web/Pricing';
import Contact from './web/Contact';
import Login from './web/Login';
import Register from './web/Register';
import Footer from './web/Footer';
import LegalNotice from './web/Legal';
import PrivacyPolicy from './web/Politicas';
import CookiesPolicy from './web/Cookies';
import Download from './web/Download';

export default function PublicWeb({ setRoute, setGlobalUser }) {
  const [activePage, setActivePage] = useState(() => {
    if (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron')) {
      return 'login';
    }
    return 'home';
  });
  
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState(null);
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [registerError, setRegisterError] = useState(null);

  const changePage = (page) => {
    setLoginError(null);
    setRegisterError(null);
    setActivePage(page);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPass })
      });
      const data = await res.json();
      
      if (res.ok) {
        setGlobalUser({ 
          id: data.user_id, 
          username: data.username,
          email: data.email,
          role: data.role, 
          tier: data.tier, 
          balance: data.balance, 
          totalDeposited: data.total_deposited, 
          holdings: data.holdings || {} 
        });
        setRoute(data.role === 'master' || data.role === 'admin' ? 'admin-dashboard' : 'dashboard');
      } else {
        setLoginError(data.error || "Credenciales incorrectas");
      }
    } catch(err) {
      setLoginError("Error conectando con el servidor");
    }
  };

  const handleRegister = async (e, tier) => {
    e.preventDefault();
    setRegisterError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regName, email: regEmail, password: regPass, tier })
      });
      const data = await res.json();
      
      if (res.ok) {
        setGlobalUser({ 
          id: data.user_id, 
          username: regName,
          email: regEmail,
          role: 'user',
          tier: tier, 
          balance: 10000, 
          totalDeposited: 10000, 
          holdings: {} 
        });
        setRoute('dashboard');
      } else {
        setRegisterError(data.error || "Error al registrar la cuenta");
      }
    } catch(err) {
      setRegisterError("Error conectando con el servidor");
    }
  };

  const isElectron = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col w-full">
      {!isElectron && <Navbar activePage={activePage} setActivePage={changePage} />}

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        {activePage === 'home' && <Home setActivePage={changePage} />}
        {activePage === 'about' && <About />}
        {activePage === 'services' && <Services />}
        {activePage === 'pricing' && <Pricing handleRegister={handleRegister} />}
        {activePage === 'contact' && <Contact />}
        {activePage === 'aviso-legal' && <LegalNotice />}
        {activePage === 'privacidad' && <PrivacyPolicy />}
        {activePage === 'cookies' && <CookiesPolicy />}
        {activePage === 'download' && <Download />}
        
        {activePage === 'login' && (
          <Login 
            handleLogin={handleLogin}
            loginUsername={loginUsername} setLoginUsername={setLoginUsername}
            loginPass={loginPass} setLoginPass={setLoginPass}
            setActivePage={changePage}
            loginError={loginError}
          />
        )}
        
        {activePage === 'register' && (
          <Register 
            handleRegister={handleRegister}
            regName={regName} setRegName={setRegName}
            regEmail={regEmail} setRegEmail={setRegEmail}
            regPass={regPass} setRegPass={setRegPass}
            registerError={registerError}
          />
        )}
      </main>

      {!isElectron && <Footer setActivePage={changePage} />}
    </div>
  );
}