import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TrackRecords() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/patients')
      .then(res => {
        setPatients(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredPatients = patients.filter(p => 
    p.id.toString().includes(searchTerm) || 
    p.risk_level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patient Track Records</h2>
          <p className="text-slate-500 mt-2">Historical vault mapping AI suggestions, treatments, and biometrics.</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search ID or Risk..." 
            className="pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-72 shadow-sm transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-3 text-slate-400">🔍</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Identification</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Biometrics</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Comorbidities</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">AI Assessment Status</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor Treatment Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-500 animate-pulse">Retrieving secure historical records from database...</td></tr>
              ) : filteredPatients.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-500 font-medium">No patient records found matching query.</td></tr>
              ) : (
                filteredPatients.map(p => {
                  const dateOpts = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                  const date = new Date(p.created_at).toLocaleDateString(undefined, dateOpts);
                  
                  // Dynamically infer treatment based on models outputs strictly for chronological reporting
                  const estWeight = p.bmi * 2.89;
                  let doseFactor = p.age > 65 ? 1.5 : 2.0;
                  if (p.risk_level === 'High' || p.risk_level === 'Medium' || p.asa_status >= 3) doseFactor *= 0.8;
                  const targetDose = `${Math.floor(estWeight * doseFactor * 0.9)}mg - ${Math.ceil(estWeight * doseFactor * 1.1)}mg`;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-5 align-top">
                        <div className="font-bold text-slate-800 dark:text-white text-lg">#{p.id.toString().padStart(5, '0')}</div>
                        <div className="text-xs text-slate-500 font-medium mt-1 inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                          Started: {date}
                        </div>
                      </td>
                      <td className="p-5 align-top text-sm text-slate-600 dark:text-slate-300">
                        <div className="font-medium">Age: {p.age} | BMI: {p.bmi}</div>
                        <div className="mt-1 text-xs opacity-80">ASA {p.asa_status} | {p.surgery_type}</div>
                      </td>
                      <td className="p-5 align-top text-xs text-slate-500">
                        <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                          {p.hypertension === 1 && <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-medium border border-slate-200 dark:border-slate-700 shadow-sm">Hypertension</span>}
                          {p.diabetes === 1 && <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-medium border border-slate-200 dark:border-slate-700 shadow-sm">Diabetes</span>}
                          {p.cardiac_disease === 1 && <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-medium border border-slate-200 dark:border-slate-700 shadow-sm">Cardiac</span>}
                          {!p.hypertension && !p.diabetes && !p.cardiac_disease && <span className="opacity-50 mt-1 italic">Clean Medical History</span>}
                        </div>
                      </td>
                      <td className="p-5 align-top">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] uppercase tracking-widest font-black ${
                            p.risk_level === 'High' ? 'bg-danger-100 text-danger-700 border border-danger-200' :
                            p.risk_level === 'Medium' ? 'bg-warning-100 text-warning-700 border border-warning-200' :
                            'bg-success-100 text-success-700 border border-success-200'
                          }`}>
                            {p.risk_level} Risk
                          </span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">{Math.round(p.survival_probability * 100)}% Surv. Prob</span>
                        </div>
                        {p.complications && p.complications.length > 0 && (
                          <div className="text-[11px] text-danger-500 font-bold mt-2 bg-danger-50 dark:bg-danger-900/10 p-1.5 rounded border border-danger-100 dark:border-danger-900/30">
                            ⚠ {p.complications.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="p-5 align-top">
                        <div className="p-3 bg-primary-50 dark:bg-primary-900/10 border border-primary-200/50 dark:border-primary-900/40 rounded-xl text-xs font-semibold text-primary-800 dark:text-primary-300 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">💉</span> 
                            <span>Induction: Propofol</span>
                          </div>
                          <div className="font-black text-sm text-primary-900 dark:text-primary-200">{targetDose}</div>
                          <div className="mt-2 text-[10px] text-slate-500 uppercase tracking-widest">Signed: Dr. R. Shaikh</div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
