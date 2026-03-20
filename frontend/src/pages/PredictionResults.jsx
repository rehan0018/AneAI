import { useLocation, Link, Navigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function PredictionResults() {
  const location = useLocation();
  const data = location.state;

  if (!data || !data.prediction) {
    return <Navigate to="/new-patient" />;
  }

  const { risk_level, survival_probability, complications, recommended_dosage } = data.prediction;

  const riskColorMap = {
    Low: 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800',
    Medium: 'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800',
    High: 'text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800'
  };
  
  const survData = [
    { name: 'Survival', value: survival_probability * 100, fill: '#10b981' },
    { name: 'Mortality', value: (1 - survival_probability) * 100, fill: '#ef4444' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Evaluation Results</h2>
          <p className="text-slate-500 mt-2">Intelligent synthesis of operative risk indices.</p>
        </div>
        <Link to="/new-patient" className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-5 py-2.5 rounded-xl font-medium transition-colors whitespace-nowrap text-center">
          &larr; Start New Evaluation
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`p-8 rounded-3xl border shadow-lg flex flex-col items-center justify-center text-center ${riskColorMap[risk_level]}`}>
          <h3 className="text-lg font-bold uppercase tracking-widest opacity-80 mb-2">Stratified Risk Level</h3>
          <p className="text-6xl font-black mb-4">{risk_level}</p>
          <p className="w-3/4 mx-auto font-medium opacity-90">
            Based on the clinical parameters provided, the patient exhibits a {risk_level.toLowerCase()} probability of encountering severe adverse events.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Survival Probability</h3>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={survData} dataKey="value" nameKey="name" cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={80} outerRadius={110} paddingAngle={2} stroke="none">
                  <Cell key="cell-0" fill="#10b981" />
                  <Cell key="cell-1" fill="#ef4444" opacity={0.3} />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[85%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full">
              <span className="text-4xl font-black text-slate-900 dark:text-white">{(survival_probability * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dosage Recommendation */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-3xl p-8 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold mb-2 flex items-center"><span className="text-2xl mr-2">💉</span> Recommended Anesthesia Dosage</h3>
          <p className="text-primary-100 font-medium">Safe baseline target calculated utilizing patient biometrics and ML risk stratification.</p>
        </div>
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-5 text-center shrink-0 min-w-[280px]">
          <p className="text-sm uppercase tracking-widest font-bold opacity-90 mb-1">Induction Range</p>
          <p className="text-2xl font-black">{recommended_dosage || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Predicted Complications</h3>
        {complications.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {complications.map((c, i) => (
              <span key={i} className="px-5 py-3 rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-400 font-bold text-md flex items-center shadow-sm">
                <span className="mr-2 text-danger-500">⚠️</span> {c}
              </span>
            ))}
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 text-success-700 dark:text-success-400 font-bold flex items-center shadow-sm">
            <span className="mr-3 text-2xl">✅</span> No major complications predicted based on current metrics.
          </div>
        )}
      </div>
      
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-primary-50/50 dark:from-slate-800 dark:to-primary-900/10 border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Model Explainability (SHAP)</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review the global SHAP inference plots generated structurally in the ML model module to understand feature contributions.</p>
        </div>
        <button className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition whitespace-nowrap text-primary-600 dark:text-primary-400">
          View Interpretation Map
        </button>
      </div>

    </div>
  );
}
