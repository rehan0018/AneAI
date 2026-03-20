import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Overview Dashboard', icon: '📊' },
    { path: '/new-patient', label: 'Patient Evaluation', icon: '🩺' },
    { path: '/records', label: 'Patient Records', icon: '📋' },
  ];

  return (
    <>
      <button 
        className="md:hidden fixed top-4 right-4 z-[60] bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white p-3 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={() => setIsOpen(false)}></div>
      )}

      <div className={`w-64 h-screen bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 flex flex-col fixed top-0 left-0 shadow-2xl transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500">
            aneAI
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold tracking-widest">Surgical Intelligence</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/results' && item.path === '/new-patient');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold shadow-[0_0_20px_rgba(170,59,255,0.15)] ring-1 ring-primary-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-slate-200 dark:border-slate-800">
          <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 -mx-2 rounded-xl transition-colors cursor-pointer">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white font-bold border-2 border-white dark:border-slate-800 shadow-sm shrink-0">
              RS
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Dr. R. Shaikh</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Chief Anesthesiologist</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
