import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PatientEntryForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: 50, bmi: 25.0, asa_status: 2, heart_rate: 75,
    sys_bp: 120, dia_bp: 80, spo2: 98, surgery_type: 'General',
    emergency: 0, hypertension: 0, diabetes: 0,
    cardiac_disease: 0, resp_disease: 0, kidney_disease: 0
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target.checked ? 1 : 0) : 
              isNaN(value) ? value : Number(value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/predict', formData);
      navigate('/results', { state: { prediction: res.data, input: formData } });
    } catch (err) {
      console.error(err);
      alert('Failed to connect to API Engine. Ensure the backend is running.');
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Pre-Operative Assessment</h2>
        <p className="text-slate-500 mt-2">Enter patient clinical metrics to calculate anesthesia risk parameters instantly.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary-600 dark:text-primary-400">Demographics</h3>
            <div className="space-y-4">
              <div><label className={labelClass}>Age (Years)</label><input type="number" name="age" value={formData.age} onChange={handleChange} className={inputClass} required /></div>
              <div><label className={labelClass}>BMI</label><input type="number" step="0.1" name="bmi" value={formData.bmi} onChange={handleChange} className={inputClass} required /></div>
              <div>
                <label className={labelClass}>ASA Status (1-5)</label>
                <select name="asa_status" value={formData.asa_status} onChange={handleChange} className={inputClass}>
                  {[1,2,3,4,5].map(v => <option key={v} value={v}>ASA {v}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-primary-600 dark:text-primary-400">Baseline Vitals</h3>
            <div className="space-y-4">
              <div><label className={labelClass}>Heart Rate (bpm)</label><input type="number" name="heart_rate" value={formData.heart_rate} onChange={handleChange} className={inputClass} required /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Sys BP</label><input type="number" name="sys_bp" value={formData.sys_bp} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>Dia BP</label><input type="number" name="dia_bp" value={formData.dia_bp} onChange={handleChange} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>SpO2 (%)</label><input type="number" name="spo2" value={formData.spo2} onChange={handleChange} className={inputClass} required /></div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-primary-600 dark:text-primary-400">Surgical Logic</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Surgery Category</label>
                <select name="surgery_type" value={formData.surgery_type} onChange={handleChange} className={inputClass}>
                  {['General', 'Cardiac', 'Orthopedic', 'Neuro', 'Trauma'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="pt-2">
                <label className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <input type="checkbox" name="emergency" checked={formData.emergency === 1} onChange={handleChange} className="w-5 h-5 accent-danger-500" />
                  <span className="font-semibold text-danger-600 dark:text-danger-400">Emergency Surgery</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mb-8">
          <h3 className="text-xl font-bold mb-4 text-primary-600 dark:text-primary-400">Comorbidities</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['hypertension', 'diabetes', 'cardiac_disease', 'resp_disease', 'kidney_disease'].map(cat => (
              <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name={cat} checked={formData[cat] === 1} onChange={handleChange} className="w-5 h-5 accent-primary-500" />
                <span className="capitalize font-medium text-slate-700 dark:text-slate-300">{cat.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-lg">
            {loading ? 'Running ML Engine...' : 'Run Risk Analysis'}
          </button>
        </div>
      </form>
    </div>
  );
}
