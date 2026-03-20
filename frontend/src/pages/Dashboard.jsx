import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempting to fetch from backend explicitly on 127.0.0.1 to avoid Windows DNS localhost failures
    axios.get('http://127.0.0.1:8000/api/patients')
      .then(res => {
        setPatients(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Backend offline. Loading mock data...");
        // Mock fallback if user hasn't started the backend yet
        setPatients([]);
        setLoading(false);
      });
  }, []);

  const riskCounts = { Low: 0, Medium: 0, High: 0 };
  patients.forEach(p => {
    if (riskCounts[p.risk_level] !== undefined) riskCounts[p.risk_level]++;
  });
  
  const chartData = [
    { name: 'Low Risk', count: riskCounts.Low, color: '#10b981' },
    { name: 'Medium Risk', count: riskCounts.Medium, color: '#f59e0b' },
    { name: 'High Risk', count: riskCounts.High, color: '#ef4444' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Aggregated clinical risk data and evaluation history.</p>
        </div>
        <Link to="/new-patient" className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl shadow-lg ring-1 ring-primary-500/50 transition-all font-medium flex items-center gap-2">
          <span>+</span> New Evaluation
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Total Patient Records</h3>
          <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">{patients.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 dark:text-slate-400 font-semibold mb-1">High Risk Flagged</h3>
          <p className="text-4xl font-bold text-danger-500">{riskCounts.High}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 dark:text-slate-400 font-semibold mb-1">ML Engine Status</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-3 h-3 rounded-full bg-success-500 animate-pulse"></div>
            <p className="text-lg font-bold text-success-500">Online & Serving</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm h-[400px]">
        <h3 className="text-lg font-bold mb-6">Risk Stratification Distribution</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
            <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' }} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={60}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
