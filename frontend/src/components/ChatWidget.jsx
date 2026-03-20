import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hello Doctor. How can I assist you with clinical intelligence today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/chat', { message: userMsg.text });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error: Cannot reach the backend engine.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-full shadow-[0_10px_25px_-5px_rgba(170,59,255,0.4)] flex items-center justify-center text-white z-[70] hover:scale-110 active:scale-95 transition-all outline-none"
      >
        <span className="text-2xl leading-none">{isOpen ? '✕' : '💬'}</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 w-[calc(100vw-2rem)] md:w-96 h-[500px] max-h-[75vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-[65] animate-fade-in origin-bottom-right">
          <div className="p-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold flex items-center shadow-md relative z-10">
            <span className="mr-2 text-xl">🤖</span>
            <span>aneAI Assistant</span>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950/50 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  m.sender === 'user' 
                    ? 'bg-gradient-to-br from-primary-600 to-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-200 dark:bg-slate-800 text-slate-500 p-3 rounded-2xl rounded-tl-sm text-sm animate-pulse w-16 flex justify-center space-x-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                </div>
              </div>
            )}
            <div ref={endRef}></div>
          </div>

          <form onSubmit={sendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 relative z-10">
            <input 
              type="text" 
              className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 dark:text-white transition-all shadow-inner"
              placeholder="Ask a clinical question..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" disabled={loading || !input.trim()} className="w-12 h-12 shrink-0 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 hover:scale-[1.05] active:scale-95 disabled:opacity-50 transition-all font-bold text-lg shadow-sm">
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
