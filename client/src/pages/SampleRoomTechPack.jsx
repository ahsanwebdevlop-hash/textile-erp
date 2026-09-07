import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Ruler, Plus, Sparkles, CheckCircle2, Pencil, Trash2 } from 'lucide-react';

export default function SampleRoomTechPack() {
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    styleNumber: 'STY-TSHIRT-01',
    styleName: 'Organic Cotton Heavyweight Crewneck',
    buyerName: 'Urban Outfitters',
    garmentCategory: 'Tops',
    sampleStage: 'Fit Sample',
    sampleStatus: 'Approved',
    comments: 'Fit approved with +0.5cm tolerance on chest width.'
  });

  const fetchSpecs = async () => {
    try {
      const res = await api.get('/tech-pack-specs');
      setSpecs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecs();
  }, []);

  const resetForm = () => {
    setForm({
      styleNumber: `STY-GARMENT-${Math.floor(100 + Math.random() * 900)}`,
      styleName: 'Premium Fleece Hoodie',
      buyerName: 'Target Brands',
      garmentCategory: 'Outerwear',
      sampleStage: 'PP Sample',
      sampleStatus: 'Submitted',
      comments: 'Pre-production sample submitted for wash fastness testing.'
    });
    setEditingItem(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      styleNumber: item.styleNumber,
      styleName: item.styleName,
      buyerName: item.buyerName || '',
      garmentCategory: item.garmentCategory || 'Tops',
      sampleStage: item.sampleStage || 'Proto Sample',
      sampleStatus: item.sampleStatus || 'Pending Submission',
      comments: item.comments || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/tech-pack-specs/${editingItem._id}`, form);
      } else {
        await api.post('/tech-pack-specs', form);
      }
      setShowModal(false);
      fetchSpecs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving tech spec');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tech-pack-specs/${id}`);
      setDeleteConfirm(null);
      fetchSpecs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting tech spec');
    }
  };

  const columns = [
    { key: 'styleNumber', label: 'Style #', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
    { key: 'styleName', label: 'Garment Description' },
    { key: 'buyerName', label: 'Buyer' },
    { key: 'sampleStage', label: 'Sample Stage', render: (val) => <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded">{val}</span> },
    { key: 'sampleStatus', label: 'Status', render: (val) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${val === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
        {val}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-blue-500/30 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
            <Sparkles size={14} /> Size Spec & Sampling Pipeline
          </span>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Ruler /> Garment Tech Pack Spec & Sample Room
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            Track garment measurement specs (S to 2XL) and buyer sample approval milestones (Proto → Fit → PP → TOP).
          </p>
        </div>
        <button onClick={openAdd} className="bg-white text-slate-900 font-bold px-5 py-3 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow shrink-0">
          <Plus size={20} /> Create Tech Spec Sheet
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading sample room tech specs...</div>
      ) : (
        <DataTable columns={columns} data={specs} searchKeys={['styleNumber', 'styleName', 'buyerName', 'sampleStage']} title="Tech Pack Specs"
          actions={(row) => (
            <>
              <button onClick={() => openEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
              <button onClick={() => setDeleteConfirm(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </>
          )} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Spec Sheet' : 'New Garment Spec Sheet'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Style Number</label>
              <input type="text" required value={form.styleNumber} onChange={e => setForm({ ...form, styleNumber: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Garment Name</label>
              <input type="text" required value={form.styleName} onChange={e => setForm({ ...form, styleName: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Buyer Name</label>
              <input type="text" required value={form.buyerName} onChange={e => setForm({ ...form, buyerName: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Category</label>
              <select value={form.garmentCategory} onChange={e => setForm({ ...form, garmentCategory: e.target.value })} className="input-field">
                <option value="Tops">Tops / Shirts</option>
                <option value="Bottoms">Bottoms / Pants</option>
                <option value="Dresses">Dresses</option>
                <option value="Outerwear">Outerwear / Jackets</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Sample Stage</label>
              <select value={form.sampleStage} onChange={e => setForm({ ...form, sampleStage: e.target.value })} className="input-field">
                <option value="Proto Sample">Proto Sample</option>
                <option value="Fit Sample">Fit Sample</option>
                <option value="Salesman Sample">Salesman Sample</option>
                <option value="PP Sample">PP Sample (Pre-Production)</option>
                <option value="TOP Sample">TOP Sample (Top of Production)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Buyer Approval Verdict</label>
              <select value={form.sampleStatus} onChange={e => setForm({ ...form, sampleStatus: e.target.value })} className="input-field">
                <option value="Pending Submission">Pending Submission</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Revise & Resubmit">Revise & Resubmit</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">Sample Fitter & Buyer Comments</label>
            <textarea rows="2" value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} className="input-field" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingItem ? 'Update' : 'Save'} Tech Spec</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-600">Delete tech spec <strong>{deleteConfirm?.styleNumber}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
