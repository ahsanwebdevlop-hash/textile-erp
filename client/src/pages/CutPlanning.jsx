import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Scissors, Plus, Sparkles, Pencil, Trash2 } from 'lucide-react';

export default function CutPlanning() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    cutPlanNumber: 'CUT-2026-001',
    styleNumber: 'STY-TSHIRT-01',
    fabricName: '100% Combed Cotton Single Jersey',
    totalOrderPcs: 1200,
    plannedPliesCount: 100,
    markerLengthMeters: 6.2,
    markerEfficiencyPercent: 86.5,
    totalCutPcs: 1200,
    fabricConsumedKg: 264.0,
    status: 'In Cutting'
  });

  const fetchPlans = async () => {
    try {
      const res = await api.get('/cut-plans');
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
      cutPlanNumber: `CUT-2026-${Math.floor(100 + Math.random() * 900)}`,
      styleNumber: 'STY-DENIM-501',
      fabricName: 'Organic Denim Twill',
      totalOrderPcs: 2500,
      plannedPliesCount: 120,
      markerLengthMeters: 8.5,
      markerEfficiencyPercent: 88.2,
      totalCutPcs: 2500,
      fabricConsumedKg: 620.0,
      status: 'Draft'
    });
    setEditingItem(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      cutPlanNumber: item.cutPlanNumber,
      styleNumber: item.styleNumber,
      fabricName: item.fabricName,
      totalOrderPcs: item.totalOrderPcs || 1000,
      plannedPliesCount: item.plannedPliesCount || 50,
      markerLengthMeters: item.markerLengthMeters || 5,
      markerEfficiencyPercent: item.markerEfficiencyPercent || 85,
      totalCutPcs: item.totalCutPcs || 1000,
      fabricConsumedKg: item.fabricConsumedKg || 200,
      status: item.status || 'Draft'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/cut-plans/${editingItem._id}`, form);
      } else {
        await api.post('/cut-plans', form);
      }
      setShowModal(false);
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving cut plan');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/cut-plans/${id}`);
      setDeleteConfirm(null);
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting cut plan');
    }
  };

  const columns = [
    { key: 'cutPlanNumber', label: 'Cut Order #', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
    { key: 'styleNumber', label: 'Style #' },
    { key: 'fabricName', label: 'Fabric Spec' },
    { key: 'markerEfficiencyPercent', label: 'Marker Efficiency', render: (val) => <span className="font-bold text-emerald-600">{val}%</span> },
    { key: 'plannedPliesCount', label: 'Lay Plies', render: (val) => `${val} plies` },
    { key: 'totalCutPcs', label: 'Total Cut Pcs', render: (val) => <span className="font-extrabold text-indigo-700">{val} pcs</span> },
    { key: 'status', label: 'Status', render: (val) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${val === 'In Cutting' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
        {val}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-blue-500/30 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
            <Sparkles size={14} /> Cutting Room Optimization
          </span>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Scissors /> Cut Planning & Marker Efficiency
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            Plan size ratios, lay plies count, fabric roll allocation, and marker utilization efficiency %.
          </p>
        </div>
        <button onClick={openAdd} className="bg-white text-blue-950 font-bold px-5 py-3 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow shrink-0">
          <Plus size={20} /> Create Cut Order
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading cut planning orders...</div>
      ) : (
        <DataTable columns={columns} data={plans} searchKeys={['cutPlanNumber', 'styleNumber', 'fabricName', 'status']} title="Cut Orders"
          actions={(row) => (
            <>
              <button onClick={() => openEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
              <button onClick={() => setDeleteConfirm(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </>
          )} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Cut Order' : 'Create Cut Order'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Cut Plan Order #</label>
              <input type="text" required value={form.cutPlanNumber} onChange={e => setForm({ ...form, cutPlanNumber: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Style Number</label>
              <input type="text" required value={form.styleNumber} onChange={e => setForm({ ...form, styleNumber: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">Fabric Description</label>
            <input type="text" required value={form.fabricName} onChange={e => setForm({ ...form, fabricName: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Order Quantity</label>
              <input type="number" value={form.totalOrderPcs} onChange={e => setForm({ ...form, totalOrderPcs: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Plies Count</label>
              <input type="number" value={form.plannedPliesCount} onChange={e => setForm({ ...form, plannedPliesCount: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Marker Efficiency %</label>
              <input type="number" step="0.1" value={form.markerEfficiencyPercent} onChange={e => setForm({ ...form, markerEfficiencyPercent: Number(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Total Cut Pieces</label>
              <input type="number" value={form.totalCutPcs} onChange={e => setForm({ ...form, totalCutPcs: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Fabric Consumed (kg)</label>
              <input type="number" value={form.fabricConsumedKg} onChange={e => setForm({ ...form, fabricConsumedKg: Number(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingItem ? 'Update' : 'Save'} Cut Plan</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-600">Delete cut plan <strong>{deleteConfirm?.cutPlanNumber}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
