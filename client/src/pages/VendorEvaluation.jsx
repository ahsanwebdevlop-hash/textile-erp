import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Star, Plus, Sparkles, Pencil, Trash2 } from 'lucide-react';

export default function VendorEvaluation() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    vendorName: 'TexMaster Cotton Mills',
    category: 'Yarn Supplier',
    onTimeDeliveryPercent: 96,
    qualityAcceptancePercent: 98,
    priceCompetivenessRating: 4.8,
    totalOrdersFulfilled: 24,
    debitNotesIssuedCount: 0,
    overallScore: 95,
    grade: 'Preferred (A+)',
    notes: 'Top tier yarn supplier with zero quality rejections in Q3.'
  });

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendor-ratings');
      setVendors(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const resetForm = () => {
    setForm({
      vendorName: 'Global Dye & Chemicals Corp',
      category: 'Dye Chemical',
      onTimeDeliveryPercent: 92,
      qualityAcceptancePercent: 95,
      priceCompetivenessRating: 4.2,
      totalOrdersFulfilled: 15,
      debitNotesIssuedCount: 1,
      overallScore: 88,
      grade: 'Approved (A)',
      notes: 'Reliable eco-friendly reactive dye chemical vendor.'
    });
    setEditingItem(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      vendorName: item.vendorName,
      category: item.category || 'Fabric Mill',
      onTimeDeliveryPercent: item.onTimeDeliveryPercent || 90,
      qualityAcceptancePercent: item.qualityAcceptancePercent || 95,
      priceCompetivenessRating: item.priceCompetivenessRating || 4,
      totalOrdersFulfilled: item.totalOrdersFulfilled || 0,
      debitNotesIssuedCount: item.debitNotesIssuedCount || 0,
      overallScore: item.overallScore || 90,
      grade: item.grade || 'Approved (A)',
      notes: item.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/vendor-ratings/${editingItem._id}`, form);
      } else {
        await api.post('/vendor-ratings', form);
      }
      setShowModal(false);
      fetchVendors();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving vendor rating');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/vendor-ratings/${id}`);
      setDeleteConfirm(null);
      fetchVendors();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting vendor rating');
    }
  };

  const columns = [
    { key: 'vendorName', label: 'Supplier Name', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
    { key: 'category', label: 'Category', render: (val) => <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{val}</span> },
    { key: 'onTimeDeliveryPercent', label: 'On-Time Delivery', render: (val) => <span className="font-bold text-emerald-600">{val}%</span> },
    { key: 'qualityAcceptancePercent', label: 'Quality Pass %', render: (val) => <span className="font-bold text-indigo-600">{val}%</span> },
    { key: 'overallScore', label: 'Scorecard', render: (val) => <span className="font-black text-sm text-gray-900">{val} / 100</span> },
    { key: 'grade', label: 'Vendor Grade', render: (val) => (
      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
        {val}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-amber-500/30 text-amber-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
            <Sparkles size={14} /> Supplier Quality Matrix
          </span>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Star /> Vendor Evaluation & Raw Material Scorecard
          </h1>
          <p className="text-amber-200 text-sm mt-1">
            Rate suppliers based on On-Time Delivery %, Quality Acceptance Rate, and Debit Notes for defective fabric/yarn.
          </p>
        </div>
        <button onClick={openAdd} className="bg-white text-amber-950 font-bold px-5 py-3 rounded-xl hover:bg-amber-50 transition-all flex items-center justify-center gap-2 shadow shrink-0">
          <Plus size={20} /> Rate New Supplier
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading vendor evaluation scorecards...</div>
      ) : (
        <DataTable columns={columns} data={vendors} searchKeys={['vendorName', 'category', 'grade']} title="Vendor Scorecards"
          actions={(row) => (
            <>
              <button onClick={() => openEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
              <button onClick={() => setDeleteConfirm(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </>
          )} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Vendor Scorecard' : 'Rate Supplier Quality'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Vendor Name</label>
              <input type="text" required value={form.vendorName} onChange={e => setForm({ ...form, vendorName: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                <option value="Yarn Supplier">Yarn Supplier</option>
                <option value="Fabric Mill">Fabric Mill</option>
                <option value="Dye Chemical">Dye Chemical</option>
                <option value="Trims & Accessories">Trims & Accessories</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">On-Time Delivery %</label>
              <input type="number" value={form.onTimeDeliveryPercent} onChange={e => setForm({ ...form, onTimeDeliveryPercent: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Quality Pass %</label>
              <input type="number" value={form.qualityAcceptancePercent} onChange={e => setForm({ ...form, qualityAcceptancePercent: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Overall Score /100</label>
              <input type="number" value={form.overallScore} onChange={e => setForm({ ...form, overallScore: Number(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Orders Fulfilled</label>
              <input type="number" value={form.totalOrdersFulfilled} onChange={e => setForm({ ...form, totalOrdersFulfilled: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Vendor Grade</label>
              <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} className="input-field">
                <option value="Preferred (A+)">Preferred (A+)</option>
                <option value="Approved (A)">Approved (A)</option>
                <option value="Conditional (B)">Conditional (B)</option>
                <option value="Blacklisted (C)">Blacklisted (C)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingItem ? 'Update' : 'Save'} Scorecard</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-600">Delete vendor scorecard for <strong>{deleteConfirm?.vendorName}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
