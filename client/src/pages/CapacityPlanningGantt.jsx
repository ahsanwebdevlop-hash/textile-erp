import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Calendar, Plus, Sparkles, Pencil, Trash2, Sliders } from 'lucide-react';

export default function CapacityPlanningGantt() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    lineName: 'Sewing Line 1',
    styleNumber: 'STY-DENIM-501',
    buyerName: 'Global Denim Corp',
    orderQuantity: 5000,
    smv: 18.5,
    operatorsCount: 22,
    helpersCount: 2,
    targetEfficiency: 75,
    dailyTargetPcs: 450,
    startDate: '2026-09-10',
    completionDate: '2026-09-22',
    status: 'Running'
  });

  const fetchPlans = async () => {
    try {
      const res = await api.get('/capacity-plans');
      setPlans(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const resetForm = () => {
    setForm({
      lineName: 'Sewing Line 2',
      styleNumber: 'STY-TSHIRT-02',
      buyerName: 'Target Apparel',
      orderQuantity: 3000,
      smv: 12.0,
      operatorsCount: 18,
      helpersCount: 2,
      targetEfficiency: 80,
      dailyTargetPcs: 650,
      startDate: '2026-09-12',
      completionDate: '2026-09-18',
      status: 'Scheduled'
    });
    setEditingItem(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      lineName: item.lineName,
      styleNumber: item.styleNumber,
      buyerName: item.buyerName || '',
      orderQuantity: item.orderQuantity || 1000,
      smv: item.smv || 15,
      operatorsCount: item.operatorsCount || 20,
      helpersCount: item.helpersCount || 2,
      targetEfficiency: item.targetEfficiency || 75,
      dailyTargetPcs: item.dailyTargetPcs || 400,
      startDate: item.startDate?.split('T')[0] || '',
      completionDate: item.completionDate?.split('T')[0] || '',
      status: item.status || 'Scheduled'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/capacity-plans/${editingItem._id}`, form);
      } else {
        await api.post('/capacity-plans', form);
      }
      setShowModal(false);
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving capacity plan');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/capacity-plans/${id}`);
      setDeleteConfirm(null);
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting capacity plan');
    }
  };

  const columns = [
    { key: 'lineName', label: 'Sewing Line', render: (val) => <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded text-xs">{val}</span> },
    { key: 'styleNumber', label: 'Style #' },
    { key: 'buyerName', label: 'Buyer' },
    { key: 'smv', label: 'Garment SMV (SAM)', render: (val) => <span className="font-mono text-xs font-bold">{val} mins</span> },
    { key: 'targetEfficiency', label: 'Target Eff %', render: (val) => <span className="font-bold text-emerald-600">{val}%</span> },
    { key: 'dailyTargetPcs', label: 'Daily Target Pcs', render: (val) => <span className="font-extrabold text-gray-900">{val} pcs/day</span> },
    { key: 'status', label: 'Status', render: (val) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${val === 'Running' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
        {val}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
            <Sparkles size={14} /> FastReact-Style Line Balancing
          </span>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Calendar /> Sewing Line Capacity & Loading Planner
          </h1>
          <p className="text-indigo-200 text-sm mt-1">
            Calculate Standard Minute Value (SMV/SAM), daily line target output, target line efficiency %, and line schedule.
          </p>
        </div>
        <button onClick={openAdd} className="bg-white text-indigo-950 font-bold px-5 py-3 rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow shrink-0">
          <Plus size={20} /> Schedule Sewing Line
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading sewing line capacity schedules...</div>
      ) : (
        <DataTable columns={columns} data={plans} searchKeys={['lineName', 'styleNumber', 'buyerName', 'status']} title="Capacity Schedule"
          actions={(row) => (
            <>
              <button onClick={() => openEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
              <button onClick={() => setDeleteConfirm(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </>
          )} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Capacity Schedule' : 'Schedule Sewing Line Capacity'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Sewing Line Name</label>
              <input type="text" required value={form.lineName} onChange={e => setForm({ ...form, lineName: e.target.value })} className="input-field" placeholder="e.g. Line-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Style Number</label>
              <input type="text" required value={form.styleNumber} onChange={e => setForm({ ...form, styleNumber: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Buyer Name</label>
              <input type="text" required value={form.buyerName} onChange={e => setForm({ ...form, buyerName: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Order Qty (pcs)</label>
              <input type="number" required value={form.orderQuantity} onChange={e => setForm({ ...form, orderQuantity: Number(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">SMV / SAM (mins)</label>
              <input type="number" step="0.1" value={form.smv} onChange={e => setForm({ ...form, smv: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Operators Count</label>
              <input type="number" value={form.operatorsCount} onChange={e => setForm({ ...form, operatorsCount: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Daily Target Pcs</label>
              <input type="number" value={form.dailyTargetPcs} onChange={e => setForm({ ...form, dailyTargetPcs: Number(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Start Date</label>
              <input type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Completion Date</label>
              <input type="date" required value={form.completionDate} onChange={e => setForm({ ...form, completionDate: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingItem ? 'Update' : 'Save'} Capacity Plan</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-600">Delete capacity plan for <strong>{deleteConfirm?.lineName}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
