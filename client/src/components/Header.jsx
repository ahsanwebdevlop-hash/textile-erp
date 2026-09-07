import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Search, Plus, Activity, Bot, Building, Check, ArrowRight, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Header() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setSearching(true);
        try {
          const res = await api.get(`/traceability/search?q=${encodeURIComponent(searchQuery)}`);
          setSearchResults(res.data.results || []);
          setShowResults(true);
        } catch (err) {
          console.error(err);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (url) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(url);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3.5 sticky top-0 z-30 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Organization & Welcome */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-md shrink-0">
            <Building size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                {user?.company?.name || 'TextileFlow Mills Ltd'}
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <Check size={10} /> Verified ERP Enterprise
              </span>
            </div>
            <p className="text-xs text-gray-500">
              User: <strong className="text-gray-800">{user?.name || 'Admin User'}</strong> • <span className="capitalize text-indigo-600 font-semibold">{user?.role?.replace('_', ' ') || 'Admin'}</span>
            </p>
          </div>
        </div>

        {/* Center: Global ERP Search Bar */}
        <div className="relative flex-1 max-w-md hidden lg:block" ref={dropdownRef}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults.length) setShowResults(true); }}
            placeholder="Global ERP Search (SO#, PO#, Roll#, Invoice#, Style)..."
            className="pl-10 pr-8 py-2 bg-gray-100 border border-transparent focus:border-indigo-400 focus:bg-white rounded-2xl text-xs outline-none w-full transition-all shadow-inner" 
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setShowResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}

          {/* Quick Jump Dropdown Menu */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto animate-scale-up">
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <span>Search Results ({searchResults.length})</span>
                {searching && <span className="text-indigo-600 animate-pulse">Searching...</span>}
              </div>

              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">No matching records found across ERP modules.</div>
              ) : (
                searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectResult(item.url)}
                    className="w-full text-left px-4 py-2.5 hover:bg-indigo-50/70 transition-colors flex items-center justify-between group border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                          {item.type}
                        </span>
                        <span className="font-bold text-xs text-gray-900 group-hover:text-indigo-600">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.subtitle}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: Quick Action Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 shrink-0">
          <Link to="/sales-orders" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0">
            <Plus size={14} /> + Sales Order
          </Link>
          <Link to="/factory-map" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0">
            <Activity size={14} className="text-emerald-400" /> Factory Map
          </Link>
          <Link to="/ai-assistant" className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0">
            <Bot size={14} /> AI Assistant
          </Link>

          <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors shrink-0" title="Notifications">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
