
import React, { useState, useEffect } from 'react';
import { User, AppConfig } from '../types';

interface LoginProps {
  config: AppConfig;
  onLogin: (user: User) => void;
  initialType: 'MASTER' | 'ADMIN' | null;
}

const Login: React.FC<LoginProps> = ({ config, onLogin, initialType }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeType, setActiveType] = useState<'MASTER' | 'ADMIN'>(initialType || 'ADMIN');

  useEffect(() => {
    if (initialType) setActiveType(initialType);
  }, [initialType]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = config.users.find(u => 
      u.username === username && 
      u.password === password && 
      u.role === activeType
    );
    
    if (user) {
      onLogin(user);
    } else {
      setError(`Invalid ${activeType} credentials. Ensure you are using the correct login tab.`);
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {/* Portal Toggle */}
      <div className="flex bg-gray-200 p-1 rounded-2xl mb-8 w-full max-w-md">
        <button 
          onClick={() => { setActiveType('ADMIN'); setError(''); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeType === 'ADMIN' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Staff Admin
        </button>
        <button 
          onClick={() => { setActiveType('MASTER'); setError(''); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeType === 'MASTER' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Master Admin
        </button>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className={`inline-block p-4 rounded-2xl mb-4 ${activeType === 'MASTER' ? 'bg-purple-50' : 'bg-blue-50'}`}>
            <svg className={`w-8 h-8 ${activeType === 'MASTER' ? 'text-purple-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-3.04l.592-.813a4.874 4.874 0 00-.745-.551m12.986-2.034a6.738 6.738 0 11-1.547-10.134M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{activeType === 'MASTER' ? 'Master Control' : 'Staff Access'}</h2>
          <p className="text-gray-500 mt-2 text-sm italic">
            {activeType === 'MASTER' ? 'Full system authority required.' : 'Enter assigned Admin ID and Password.'}
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">{activeType} User ID</label>
            <input 
              required 
              className={inputClass} 
              placeholder={activeType === 'MASTER' ? "e.g. master" : "e.g. staff_id"} 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide tracking-widest">Password</label>
            <input 
              required 
              type="password" 
              className={inputClass} 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100 animate-shake">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg transform hover:-translate-y-0.5 ${activeType === 'MASTER' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
          >
            Authenticate Portal
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          {activeType === 'MASTER' ? 'Master Admin manages all team accounts' : 'Contact Master Admin if credentials lost'}
        </div>
      </div>
    </div>
  );
};

export default Login;
