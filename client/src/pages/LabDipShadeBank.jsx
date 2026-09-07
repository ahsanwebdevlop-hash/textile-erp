import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Palette, Plus, Sparkles, CheckCircle2, XCircle, Pencil, Trash2 } from 'lucide-react';

export default function LabDipShadeBank() {
  const [shades, setShades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState({
    shadeCode: 'SHD-NAVY-01',
    shadeName: 'Royal Navy Blue',
    colorFamily: 'Navy Blue',
    buyerName: 'H&M / Zara',
    dyeLotNumber: 'LOT-DYE-904',
    pantoneReference: 'PANTONE 19-4052 TCX',
    labDipNumber: 'LD-2026-A',
    deltaEValue: 0.45,
    approvalStatus: 'Approved',
    notes: 'Approved under D65 Primary Daylight & TL84 Store light box standards.'
  });

  const fetchShades = async () => {
    try {
      const res = await api.get('/shades');
      setShades(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShades();
  }, []);

  const resetForm = () => {
    setForm({
      shadeCode: `SHD-COLOR-${Math.floor(100 + Math.random() * 900)}`,
      shadeName: 'Navy Blue Classic',
      colorFamily: 'Navy Blue',
      buyerName: 'Global Apparel Buyer',
      dyeLotNumber: 'LOT-DYE-101',
      pantoneReference: 'PANTONE 19-4010 TCX',
      labDipNumber: 'LD-2026-B',
      deltaEValue: 0.35,
      approvalStatus: 'Approved',
      notes: 'Passed spectrophotometer color matching (Delta E < 0.5).'
    });
    setEditingItem(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      shadeCode: item.shadeCode,
      shadeName: item.shadeName,
      colorFamily: item.colorFamily || 'Navy Blue',
      buyerName: item.buyerName || '',
      dyeLotNumber: item.dyeLotNumber || '',
      pantoneReference: item.pantoneReference || '',
      labDipNumber: item.labDipNumber || '',
      deltaEValue: item.deltaEValue || 0.5,
      approvalStatus: item.approvalStatus || 'Approved',
      notes: item.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      if (editingItem) {
        await api.put(`/shades/${editingItem._id}`, form);
      } else {
        await api.post('/shades', form);
      }
      setShowModal(false);
      fetchShades();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error saving shade');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/shades/${id}`);
      setDeleteConfirm(null);
      fetchShades();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting shade');
    }
  };

  const columns = [
    { key: 'shadeCode', label: 'Shade Code', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
    { key: 'shadeName', label: 'Color Name' },
    { key: 'pantoneReference', label: 'Pantone TCX', render: (val) => <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono">{val || '-'}</span> },
    { key: 'buyerName', label: 'Buyer' },
    { key: 'deltaEValue', label: 'Delta E Tolerance', render: (val) => <span className="font-mono text-xs font-bold text-indigo-700">ΔE {val}</span> },
    { key: 'approvalStatus', label: 'Approval', render: (val) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 w-fit ${val === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
        {val === 'Approved' ? <CheckCircle2 size={13} /> : <XCircle size={13} />} {val}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-purple-500/30 text-purple-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
            <Sparkles size={14} /> Color Recipe & Lab Dips
          </span>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Palette /> Lab Dip & Shade Bank Management
          </h1>
          <p className="text-purple-200 text-sm mt-1">
            Manage spectrophotometer Delta E color matching, Pantone references, and buyer Lab Dip approvals.
          </p>
        </div>
        <button onClick={openAdd} className="bg-white text-purple-950 font-bold px-5 py-3 rounded-xl hover:bg-purple-50 transition-all flex items-center justify-center gap-2 shadow shrink-0">
          <Plus size={20} /> Register New Shade
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading shade bank recipes...</div>
      ) : (
        <DataTable columns={columns} data={shades} searchKeys={['shadeCode', 'shadeName', 'pantoneReference', 'buyerName']} title="Shade Bank"
          actions={(row) => (
            <>
              <button onClick={() => openEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
              <button onClick={() => setDeleteConfirm(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </>
          )} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Shade Recipe' : 'Register New Shade Recipe'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">{errorMessage}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Shade Code</label>
              <input type="text" required value={form.shadeCode} onChange={e => setForm({ ...form, shadeCode: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Color Name</label>
              <input type="text" required value={form.shadeName} onChange={e => setForm({ ...form, shadeName: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Pantone TCX Ref</label>
              <input type="text" value={form.pantoneReference} onChange={e => setForm({ ...form, pantoneReference: e.target.value })} className="input-field" placeholder="PANTONE 19-4052 TCX" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Buyer Name</label>
              <input type="text" value={form.buyerName} onChange={e => setForm({ ...form, buyerName: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Lab Dip #</label>
              <input type="text" value={form.labDipNumber} onChange={e => setForm({ ...form, labDipNumber: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Delta E (ΔE)</label>
              <input type="number" step="0.01" value={form.deltaEValue} onChange={e => setForm({ ...form, deltaEValue: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <select value={form.approvalStatus} onChange={e => setForm({ ...form, approvalStatus: e.target.value })} className="input-field">
                <option value="Approved">Approved</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Rejected">Rejected</option>
                <option value="Conditional">Conditional</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">Lightbox & Dosing Notes</label>
            <textarea rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingItem ? 'Update' : 'Save'} Shade</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-600">Delete shade recipe <strong>{deleteConfirm?.shadeCode}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
