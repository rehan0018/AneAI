import { useState, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function MedicalVision() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const analyzeImage = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setResult(res.data.analysis);
      }
    } catch (err) {
      setError("Failed to reach API Engine for image analysis. Ensure backend is running and GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Radiology AI (Computer Vision)</h2>
        <p className="text-slate-500">Upload radiographic scans (X-Ray, CT, MRI) for deep multimodal risk assessment prior to surgical induction.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
        {/* Upload Column */}
        <div className="flex flex-col gap-6">
          <div 
            className={`border-4 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all shadow-sm cursor-pointer ${preview ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-900/10' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            onClick={() => fileInputRef.current.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
            {preview ? (
              <img src={preview} alt="Medical Scan" className="max-h-96 object-contain rounded-2xl shadow-lg" />
            ) : (
              <div className="py-20 text-slate-500 hover:text-primary-500 transition-colors">
                <span className="text-7xl mb-6 block">🩻</span>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Upload Medical Scan</h3>
                <p className="font-medium text-sm w-3/4 mx-auto leading-relaxed">Drag & drop or securely click to select a JPEG/PNG scan. Multimodal validation processes structural artifacts mapped against clinical indices.</p>
              </div>
            )}
          </div>

          <button 
            onClick={analyzeImage} 
            disabled={!file || loading}
            className={`w-full py-5 rounded-2xl font-black tracking-widest uppercase transition-all shadow-lg text-lg flex items-center justify-center ${!file || loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800' : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:scale-[1.02] active:scale-95 text-white'}`}
          >
            {loading ? (
              <><div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin mr-3"></div> Parsing Neural Network...</>
            ) : (
              'Run Diagnostics'
            )}
          </button>
        </div>

        {/* Results Column */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-8 overflow-y-auto max-h-[750px]">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            <span className="mr-3 text-2xl">🧠</span> AI Radiologist Inference Summary
          </h3>
          
          {loading ? (
             <div className="flex flex-col items-center justify-center h-64 opacity-60 space-y-6">
               <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="font-bold tracking-widest uppercase text-slate-500 animate-pulse text-sm">Evaluating anatomical margins mapping constraints...</p>
             </div>
          ) : error ? (
            <div className="p-6 bg-danger-50 dark:bg-danger-900/10 border border-danger-200 dark:border-danger-900/30 rounded-2xl text-danger-700 dark:text-danger-400 font-medium tracking-wide">
              <span className="text-4xl block mb-4 animate-bounce">⚠️</span> {error}
            </div>
          ) : result ? (
            <div className="prose dark:prose-invert prose-slate prose-lg max-w-none font-medium leading-relaxed marker:text-primary-500 bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 opacity-40 text-center">
              <span className="text-5xl mb-6">🩺</span>
              <p className="font-bold text-slate-500 w-3/4 leading-relaxed">Awaiting clinical scan upload. The multimodal LLM engine natively flags airway compressions, effusions, and cardiomegaly mapped against exact anesthesia protocols.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
