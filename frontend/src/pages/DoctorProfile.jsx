import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DoctorProfile() {
  const [stats, setStats] = useState({ total: 0, highRisk: 0, avgAge: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/patients')
      .then(res => {
        const patients = res.data;
        const highRisk = patients.filter(p => p.risk_level === 'High').length;
        const avgAge = patients.length > 0 ? Math.round(patients.reduce((acc, p) => acc + p.age, 0) / patients.length) : 0;
        setStats({ total: patients.length, highRisk, avgAge });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Physician Profile</h2>
        <p className="text-slate-500 mt-2">Manage your clinical identity and view personal impact metrics.</p>
      </div>

      {/* Cover Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-primary-600 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-12 sm:-mt-16 sm:space-x-6">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-tr from-primary-500 to-indigo-500 shadow-xl flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shrink-0 relative z-10">
              RS
            </div>
            <div className="mt-4 sm:mt-0 pb-2 flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dr. R. Shaikh</h1>
              <p className="text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase text-sm mt-1">Board Certified Anesthesiologist</p>
            </div>
            <div className="mt-4 sm:mt-0 pb-2">
              <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all border border-slate-200 dark:border-slate-700 w-full sm:w-auto shadow-sm active:scale-95">
                Edit Profile
              </button>
            </div>
          </div>
          
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm text-slate-500 font-medium">Department</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">Anesthesiology & Perioperative Medicine</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Specialization</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">Neuroanesthesia & Trauma</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Hospital Affiliation</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">Central Medical Hub</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Email Address</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">rs@medical.aneai.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <h3 className="text-xl font-bold text-slate-800 dark:text-white pt-4">Your Analytical Impact</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Evaluations</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{loading ? '...' : stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500">High Risk Mapped</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{loading ? '...' : stats.highRisk}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Avg Patient Age</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{loading ? '...' : stats.avgAge}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
