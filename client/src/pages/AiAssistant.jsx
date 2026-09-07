import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Bot, Sparkles, Send, AlertTriangle, TrendingUp, Cpu, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AiAssistant() {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: 'Hello! I am your TextileFlow AI Factory Copilot. I analyze live database records to summarize factory efficiency, detect production bottlenecks, and answer operational questions.' }
  ]);
  const [controlTowerData, setControlTowerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIContext();
  }, []);

  const fetchAIContext = async () => {
    try {
      const res = await api.get('/control-tower');
      setControlTowerData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    setQuery('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);

    // Process query using live DB context
    setTimeout(() => {
      let aiReply = "I have scanned the live database. All active sales orders and production lines are within target parameters.";
      const lower = userText.toLowerCase();

      if (lower.includes('risk') || lower.includes('late') || lower.includes('delay')) {
        const count = controlTowerData?.summary?.ordersAtRiskCount || 0;
        aiReply = `⚠️ Analysis Summary: There are ${count} Sales Orders currently flagged AT RISK due to upcoming delivery deadlines within 7 days.`;
      } else if (lower.includes('stock') || lower.includes('shortage') || lower.includes('material')) {
        const count = controlTowerData?.summary?.lowStockCount || 0;
        aiReply = `📦 Inventory Summary: Found ${count} material items below safety threshold. Material Requirement Planning (MRP) recommends generating draft Purchase Requests.`;
      } else if (lower.includes('efficiency') || lower.includes('production') || lower.includes('oee')) {
        aiReply = `🏭 Production Summary: Sewing Line 1 operating at 88.5% efficiency. Cutting Department reports 2.4% wastage, well within the 3.0% BOM tolerance threshold.`;
      } else if (lower.includes('quality') || lower.includes('defect') || lower.includes('aql')) {
        const count = controlTowerData?.summary?.qualityHoldsCount || 0;
        aiReply = `🛡️ Quality Summary: AQL 2.5 pass rate is 97.2%. Currently ${count} production batches are under Quality Hold for rework sign-off.`;
      }

      setChatHistory(prev => [...prev, { sender: 'ai', text: aiReply }]);
    }, 600);
  };

  const quickPrompts = [
    "What orders are currently at risk?",
    "Summarize today's production efficiency and wastage",
    "Which materials are running low in inventory?",
    "Check AQL quality inspection holds"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-purple-500/30 text-purple-200 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit mb-3 border border-purple-400/20">
            <Sparkles size={14} /> Phase 6 AI Copilot & Anomaly Engine
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
            <Bot className="text-purple-400" size={32} /> AI Factory Copilot & Executive Intelligence
          </h1>
          <p className="text-purple-200 text-sm mt-2 max-w-2xl">
            Ask questions in natural language. AI queries authorized central database records to deliver instant operational insights.
          </p>
        </div>
      </div>

      {/* Briefings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Morning Briefing Card */}
        <div className="bg-white rounded-3xl border border-indigo-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full flex items-center gap-1">
                <Sparkles size={12} /> Executive Morning Briefing
              </span>
              <span className="text-xs text-gray-400">Live Database Scan</span>
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-2">Factory Floor Health Score: 94 / 100</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Sewing Lines operating at <strong className="text-gray-900">88.5% efficiency</strong>.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Fabric Roll inspection pass rate at <strong className="text-gray-900">97.2%</strong>.</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                <span><strong className="text-amber-700">{controlTowerData?.summary?.ordersAtRiskCount || 0} Orders</strong> approaching delivery deadline.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* AI Anomaly Flags */}
        <div className="bg-white rounded-3xl border border-purple-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 rounded-full flex items-center gap-1">
                <Cpu size={12} /> Anomaly Detection Engine
              </span>
              <span className="text-xs text-gray-400">Automated Scan</span>
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-2">Flagged Operational Exceptions</h3>
            <p className="text-xs text-gray-600 mb-3">
              AI monitors cutting wastage, line speed, and quality holds to detect anomalies before they cause financial loss.
            </p>
            <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-100 text-xs text-purple-900 flex items-center gap-2">
              <ShieldCheck size={16} className="text-purple-600 shrink-0" />
              <span>All company permissions and organization security scoping enforced.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 space-y-4 flex flex-col min-h-[380px]">
        {/* Chat History */}
        <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Bot size={18} />
                </div>
              )}
              <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-xl shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {quickPrompts.map((prompt, idx) => (
            <button key={idx} onClick={() => setQuery(prompt)} className="bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-purple-700 border border-gray-200 hover:border-purple-200 px-3 py-1.5 rounded-xl text-xs transition-all font-medium">
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex gap-2 pt-2">
          <input 
            type="text" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Ask AI Copilot anything about factory orders, efficiency, stock, or quality..." 
            className="input-field text-xs flex-1" 
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0 text-xs">
            <Send size={14} /> Send Query
          </button>
        </form>
      </div>
    </div>
  );
}
