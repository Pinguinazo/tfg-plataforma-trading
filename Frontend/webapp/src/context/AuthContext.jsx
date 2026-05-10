import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('finpulse_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        const userObj = {
          name: data.username,
          username: data.username,
          id: data.user_id,
          email: data.email,
          password: data.password,
          rank: data.tier,
          balance: data.balance || 0,
          totalDeposited: data.total_deposited || 0,
          holdings: data.holdings || {}
        };
        setUser(userObj);
        localStorage.setItem('finpulse_user', JSON.stringify(userObj));
        return { success: true };
      }
      return { success: false, error: data.error || 'Credenciales incorrectas' };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: 'Error conectando al servidor' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('http://localhost:3001/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          tier: userData.service === 'premium' ? 'Premium' : userData.service === 'vip' ? 'VIP' : 'Básico'
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        const userObj = {
          name: data.username,
          username: data.username,
          id: data.user_id,
          email: userData.email,
          password: userData.password,
          rank: data.tier,
          balance: data.balance || 0,
          totalDeposited: data.total_deposited || 0,
          holdings: data.holdings || {}
        };
        
        setUser(userObj);
        localStorage.setItem('finpulse_user', JSON.stringify(userObj));
        return { success: true };
      }
      return { success: false, error: data.error || 'Error de registro' };
    } catch (error) {
      console.error('Error registering:', error);
      return { success: false, error: 'Error conectando al servidor' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('finpulse_user');
  };

  const updateUserData = (newData) => {
    setUser(prev => {
        const updated = { ...prev, ...newData };
        localStorage.setItem('finpulse_user', JSON.stringify(updated));
        return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateUserData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
