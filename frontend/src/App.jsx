import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PatientEntryForm from './pages/PatientEntryForm';
import PredictionResults from './pages/PredictionResults';
import DoctorProfile from './pages/DoctorProfile';
import TrackRecords from './pages/TrackRecords';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
        <Sidebar />
        <main className="flex-1 w-full md:ml-64 p-4 md:p-8 pt-24 md:pt-8 overflow-y-auto overflow-x-hidden relative">
          {/* Subtle background glow effect for aesthetic */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none -z-10"></div>
          
          <div className="max-w-7xl mx-auto z-10">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new-patient" element={<PatientEntryForm />} />
              <Route path="/results" element={<PredictionResults />} />
              <Route path="/profile" element={<DoctorProfile />} />
              <Route path="/records" element={<TrackRecords />} />
            </Routes>
          </div>
        </main>
        
        {/* Universal Chatbot Overlay Instance */}
        <ChatWidget />
      </div>
    </Router>
  );
}

export default App;

