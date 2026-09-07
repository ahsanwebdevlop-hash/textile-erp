import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { ExternalLink, Plus, Sparkles, Pencil, Trash2 } from 'lucide-react';

export default function Subcontracting() {
  const [subcontracts, setSubcontracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    jobOrderNumber: 'DC-OUT-2026-001',
    vendorName: 'Creative Printing & Embroidery Mills',
    vendorContact: '+880 1711-902182',
    processType: 'Screen Printing',
    styleNumber: 'STY-TSHIRT-01',
    materialIssued: 'Cut Garment Front Panels',
    issuedQuantity: 2400,
    unit: 'Pieces',
    unitProcessingCost: 0.35,
    returnedQuantity: 2380,
    rejectedQuantity: 20,
    status: 'In Process'
  });

  const fetchSubcontracts = async () => {
    try {
      const res = await api.get('/subcontracts');
      setSubcontracts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcontracts();
  }, []);

  const resetForm = () => {
    setForm({
      jobOrderNumber: `DC-OUT-2026-${Math.floor(100 + Math.random() * 900)}`,
      vendorName: 'Apex Washing & Dyeing Unit',
      vendorContact: '+880 1812-409123',
      processType: 'Washing',
      styleNumber: 'STY-DENIM-501',
      materialIssued: 'Sewn Denim Jeans',
      issuedQuantity: 1500,
      unit: 'Pieces',
      unitProcessingCost: 0.85,
      returnedQuantity: 1500,
      rejectedQuantity: 0,
      status: 'Material Issued'
    });
    setEditingItem(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      jobOrderNumber: item.jobOrderNumber,
      vendorName: item.vendorName,
      vendorContact: item.vendorContact || '',
      processType: item.processType || 'Screen Printing',
      styleNumber: item.styleNumber || '',
      materialIssued: item.materialIssued || '',
      issuedQuantity: item.issuedQuantity || 1,
      unit: item.unit || 'Pieces',
      unitProcessingCost: item.unitProcessingCost || 0,
      returnedQuantity: item.returnedQuantity || 0,
      rejectedQuantity: item.rejectedQuantity || 0,
      status: item.status || 'Material Issued'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalEstimatedCost = form.issuedQuantity * form.unitProcessingCost;
      const payload = { ...form, totalEstimatedCost };
      if (editingItem) {
        await api.put(`/subcontracts/${editingItem._id}`, payload);
      } else {
        await api.post('/subcontracts', payload);
      }
      setShowModal(false);
      fetchSubcontracts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving subcontract order');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/subcontracts/${id}`);
      setDeleteConfirm(null);
      fetchSubcontracts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting subcontract order');
    }
  };

  const columns = [
    { key: 'jobOrderNumber', label: 'Delivery Challan #', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
    { key: 'vendorName', label: 'Outsource Vendor' },
    { key: 'processType', label: 'Process', render: (val) => <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2 py-1 rounded">{val}</span> },
    { key: 'materialIssued', label: 'Material Issued' },
    { key: 'issuedQuantity', label: 'Issued Qty', render: (val, row) => `${val} ${row.unit}` },
    { key: 'returnedQuantity', label: 'Returned', render: (val, row) => <span className="font-bold text-emerald-600">{val} {row.unit}</span> },
    { key: 'status', label: 'Status', render: (val) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${val === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
        {val}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-amber-500/30 text-amber-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
            <Sparkles size={14} /> Outsource Vendor Dispatch
          </span>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <ExternalLink /> Subcontracting & Outsource Processing
          </h1>
          <p className="text-amber-200 text-sm mt-1">
            Track fabric sent out for Printing, Embroidery, Washing, Dyeing with Delivery Challans & Return Logs.
          </p>
        </div>
        <button onClick={openAdd} className="bg-white text-amber-950 font-bold px-5 py-3 rounded-xl hover:bg-amber-50 transition-all flex items-center justify-center gap-2 shadow shrink-0">
          <Plus size={20} /> Issue Delivery Challan
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading subcontracting job orders...</div>
      ) : (
        <DataTable columns={columns} data={subcontracts} searchKeys={['jobOrderNumber', 'vendorName', 'processType', 'materialIssued']} title="Subcontracts"
          actions={(row) => (
            <>
              <button onClick={() => openEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
              <button onClick={() => setDeleteConfirm(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </>
          )} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Subcontract Order' : 'Issue Subcontract Delivery Challan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Delivery Challan #</label>
              <input type="text" required value={form.jobOrderNumber} onChange={e => setForm({ ...form, jobOrderNumber: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Vendor Name</label>
              <input type="text" required value={form.vendorName} onChange={e => setForm({ ...form, vendorName: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Process Type</label>
              <select value={form.processType} onChange={e => setForm({ ...form, processType: e.target.value })} className="input-field">
                <option value="Screen Printing">Screen Printing</option>
                <option value="Embroidery">Embroidery</option>
                <option value="Washing">Garment Washing</option>
                <option value="Dyeing">Dyeing</option>
                <option value="Pleating">Pleating</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Material Description</label>
              <input type="text" required value={form.materialIssued} onChange={e => setForm({ ...form, materialIssued: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Issued Qty</label>
              <input type="number" value={form.issuedQuantity} onChange={e => setForm({ ...form, issuedQuantity: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Cost/Unit ($)</label>
              <input type="number" step="0.01" value={form.unitProcessingCost} onChange={e => setForm({ ...form, unitProcessingCost: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
                <option value="Material Issued">Material Issued</option>
                <option value="In Process">In Process</option>
                <option value="Partially Returned">Partially Returned</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingItem ? 'Update' : 'Save'} Subcontract</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-600">Delete subcontract order <strong>{deleteConfirm?.jobOrderNumber}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
