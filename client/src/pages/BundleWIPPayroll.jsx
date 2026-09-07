import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { QrCode, Plus, Sparkles, Pencil, Trash2, Printer } from 'lucide-react';

export default function BundleWIPPayroll() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    bundleId: 'BNDL-2026-001',
    barcode: 'BC-904128941',
    styleNumber: 'STY-TSHIRT-01',
    color: 'Navy Blue',
    size: 'M',
    quantity: 24,
    assignedSewingLine: 'Line-1',
    currentDepartment: 'Sewing',
    status: 'In Sewing'
  });

  const fetchBundles = async () => {
    try {
      const res = await api.get('/bundles');
      setBundles(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const resetForm = () => {
    setForm({
      bundleId: `BNDL-2026-${Math.floor(100 + Math.random() * 900)}`,
      barcode: `BC-${Math.floor(100000000 + Math.random() * 900000000)}`,
      styleNumber: 'STY-DENIM-501',
      color: 'Indigo Blue',
      size: '32',
      quantity: 20,
      assignedSewingLine: 'Line-2',
      currentDepartment: 'Cutting',
      status: 'Cut'
    });
    setEditingItem(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      bundleId: item.bundleId,
      barcode: item.barcode,
      styleNumber: item.styleNumber,
      color: item.color,
      size: item.size,
      quantity: item.quantity || 24,
      assignedSewingLine: item.assignedSewingLine || 'Line-1',
      currentDepartment: item.currentDepartment || 'Sewing',
      status: item.status || 'In Sewing'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/bundles/${editingItem._id}`, form);
      } else {
        await api.post('/bundles', form);
      }
      setShowModal(false);
      fetchBundles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving bundle');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/bundles/${id}`);
      setDeleteConfirm(null);
      fetchBundles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting bundle');
    }
  };

  const columns = [
    { key: 'bundleId', label: 'Bundle Ticket ID', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
    { key: 'styleNumber', label: 'Style #' },
    { key: 'color', label: 'Color / Size', render: (_, row) => `${row.color} (${row.size})` },
    { key: 'quantity', label: 'Bundle Qty', render: (val) => <span className="font-bold text-indigo-700">{val} pcs</span> },
    { key: 'assignedSewingLine', label: 'Station Line' },
    { key: 'currentDepartment', label: 'WIP Station', render: (val) => <span className="text-xs bg-indigo-50 text-indigo-800 font-bold px-2.5 py-1 rounded">{val}</span> },
    { key: 'status', label: 'Status', render: (val) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${val === 'Passed QC' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
        {val}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-blue-500/30 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
            <Sparkles size={14} /> Barcode Cut Bundle System
          </span>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <QrCode /> Bundle WIP & Piece-Rate Payroll
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            Generate cut-piece bundle barcode tickets, track sewing station scans, and calculate piece-rate worker earnings.
          </p>
        </div>
        <button onClick={openAdd} className="bg-white text-blue-950 font-bold px-5 py-3 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow shrink-0">
          <Plus size={20} /> Generate Cut Bundle
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading bundle WIP records...</div>
      ) : (
        <DataTable columns={columns} data={bundles} searchKeys={['bundleId', 'styleNumber', 'color', 'size', 'currentDepartment']} title="Bundle WIP"
          actions={(row) => (
            <>
              <button onClick={() => openEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
              <button onClick={() => setDeleteConfirm(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </>
          )} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Bundle Ticket' : 'Generate Cut Bundle Ticket'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Bundle ID</label>
              <input type="text" required value={form.bundleId} onChange={e => setForm({ ...form, bundleId: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Barcode #</label>
              <input type="text" required value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Style Number</label>
              <input type="text" required value={form.styleNumber} onChange={e => setForm({ ...form, styleNumber: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Color</label>
              <input type="text" required value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Size</label>
              <input type="text" required value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Bundle Pcs Qty</label>
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Assigned Line</label>
              <input type="text" value={form.assignedSewingLine} onChange={e => setForm({ ...form, assignedSewingLine: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Current Station</label>
              <select value={form.currentDepartment} onChange={e => setForm({ ...form, currentDepartment: e.target.value })} className="input-field">
                <option value="Cutting">Cutting</option>
                <option value="Sewing">Sewing</option>
                <option value="Washing/Printing">Washing/Printing</option>
                <option value="Finishing">Finishing</option>
                <option value="Quality Audit">Quality Audit</option>
                <option value="Packed">Packed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingItem ? 'Update' : 'Generate'} Bundle</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-600">Delete bundle ticket <strong>{deleteConfirm?.bundleId}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
