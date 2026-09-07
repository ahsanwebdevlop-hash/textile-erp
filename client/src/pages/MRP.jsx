import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import { Cpu, RefreshCw, ShoppingCart, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function MRP() {
  const [mrpItems, setMrpItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchMRP = async () => {
    try {
      const res = await api.get('/mrp');
      setMrpItems(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMRP();
  }, []);

  const handleRunCalculation = async () => {
    setCalculating(true);
    setStatusMsg('');
    try {
      const res = await api.get('/mrp');
      setMrpItems(res.data.data || []);
      setStatusMsg('MRP calculation updated against active Sales Orders & BOMs!');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error running MRP calculation');
    } finally {
      setCalculating(false);
    }
  };

  const handleGeneratePO = async () => {
    const shortages = mrpItems.filter(i => i.shortageQty > 0);
    if (!shortages.length) {
      alert('No material shortages detected. All requirements are satisfied by current inventory!');
      return;
    }
    try {
      await api.post('/mrp/generate-po', { items: shortages });
      setStatusMsg(`Successfully created Purchase Request for ${shortages.length} shortage materials!`);
      setTimeout(() => setStatusMsg(''), 5000);
      fetchMRP();
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating Purchase Order');
    }
  };

  const totalShortages = mrpItems.filter(i => i.shortageQty > 0).length;
  const estimatedCostTotal = mrpItems.reduce((acc, curr) => acc + (curr.shortageQty * (curr.estimatedUnitCost || 5)), 0);

  const columns = [
    { key: 'materialName', label: 'Material Name', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
    { key: 'category', label: 'Category', render: (val) => <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-semibold">{val}</span> },
    { key: 'requiredQty', label: 'Required Qty', render: (val, row) => `${val} ${row.unit}` },
    { key: 'onHandQty', label: 'On-Hand Stock', render: (val, row) => `${val} ${row.unit}` },
    { key: 'availableQty', label: 'Available Net', render: (val, row) => `${val} ${row.unit}` },
    { key: 'shortageQty', label: 'Net Shortage', render: (val, row) => (
      <span className={val > 0 ? 'text-red-600 font-extrabold' : 'text-emerald-600 font-bold'}>
        {val > 0 ? `-${val} ${row.unit}` : '0 (OK)'}
      </span>
    )},
    { key: 'status', label: 'MRP Verdict', render: (val) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${val === 'SHORTAGE' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
        {val}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
            <Sparkles size={14} /> Material Planning Engine
          </span>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Cpu /> Material Requirements Planning (MRP)
          </h1>
          <p className="text-indigo-200 text-sm mt-1">
            Auto-calculates net yarn, dye, and trim shortages based on active Sales Orders, BOM Tech Packs, and on-hand stock.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleRunCalculation} disabled={calculating} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-sm">
            <RefreshCw size={16} className={calculating ? 'animate-spin' : ''} /> {calculating ? 'Calculating...' : 'Run MRP Calculation'}
          </button>
          <button onClick={handleGeneratePO} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-sm shadow">
            <ShoppingCart size={16} /> Auto-Generate PO ({totalShortages})
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" /> {statusMsg}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-slate-50 border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase">Materials Analyzed</p>
          <p className="text-2xl font-black text-slate-800">{mrpItems.length}</p>
        </div>
        <div className="card bg-red-50 border-red-200">
          <p className="text-xs font-semibold text-red-600 uppercase">Shortage Items</p>
          <p className="text-2xl font-black text-red-700">{totalShortages}</p>
        </div>
        <div className="card bg-emerald-50 border-emerald-200">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Estimated Procurement Cost</p>
          <p className="text-2xl font-black text-emerald-700">${estimatedCostTotal.toFixed(2)}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Running MRP material audit...</div>
      ) : (
        <DataTable columns={columns} data={mrpItems} searchKeys={['materialName', 'category', 'status']} title="MRP Shortages" />
      )}
    </div>
  );
}
