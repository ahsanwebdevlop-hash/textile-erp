import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { ShieldCheck, Plus, Sparkles, CheckCircle2, AlertTriangle, Pencil, Trash2 } from 'lucide-react';

export default function FabricQC4PointPage() {
  const [qcList, setQcList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    inspectionNumber: '4PT-2026-001',
    rollNumber: 'ROLL-2026-8801',
    lotNumber: 'LOT-DYE-901',
    fabricName: '100% Combed Cotton Single Jersey',
    supplierName: 'TexMaster Mills',
    rollWidthInches: 60,
    rollLengthYards: 100,
    totalDefectPoints: 12,
    pointsPer100SqYards: 14.4,
    gradeVerdict: 'Grade A',
    inspectorName: 'Senior Fabric Auditor'
  });

  const fetchQC = async () => {
    try {
      const res = await api.get('/fabric-qc-4point');
      setQcList(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQC();
  }, []);

  const resetForm = () => {
    setForm({
      inspectionNumber: `4PT-2026-${Math.floor(100 + Math.random() * 900)}`,
      rollNumber: `ROLL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      lotNumber: `LOT-DYE-${Math.floor(100 + Math.random() * 900)}`,
      fabricName: 'Organic Denim Twill',
      supplierName: 'Global Denim Mills',
      rollWidthInches: 58,
      rollLengthYards: 120,
      totalDefectPoints: 18,
      pointsPer100SqYards: 18.6,
      gradeVerdict: 'Grade A',
      inspectorName: 'Chief QC Inspector'
    });
    setEditingItem(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      inspectionNumber: item.inspectionNumber,
      rollNumber: item.rollNumber,
      lotNumber: item.lotNumber,
      fabricName: item.fabricName,
      supplierName: item.supplierName,
      rollWidthInches: item.rollWidthInches || 60,
      rollLengthYards: item.rollLengthYards || 100,
      totalDefectPoints: item.totalDefectPoints || 0,
      pointsPer100SqYards: item.pointsPer100SqYards || 0,
      gradeVerdict: item.gradeVerdict || 'Grade A',
      inspectorName: item.inspectorName || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/fabric-qc-4point/${editingItem._id}`, form);
      } else {
        await api.post('/fabric-qc-4point', form);
      }
      setShowModal(false);
      fetchQC();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving fabric 4-point inspection');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/fabric-qc-4point/${id}`);
      setDeleteConfirm(null);
      fetchQC();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting inspection');
    }
  };

  const columns = [
    { key: 'inspectionNumber', label: 'Audit #', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
    { key: 'rollNumber', label: 'Roll Barcode' },
    { key: 'fabricName', label: 'Fabric Description' },
    { key: 'totalDefectPoints', label: 'Penalty Points', render: (val) => <span className="font-mono text-xs font-bold text-amber-700">{val} pts</span> },
    { key: 'pointsPer100SqYards', label: 'Pts / 100 Sq Yds', render: (val) => <span className="font-extrabold text-indigo-700">{val}</span> },
    { key: 'gradeVerdict', label: 'Roll Grade', render: (val) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${val === 'Grade A' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
        {val}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-emerald-500/30 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
            <Sparkles size={14} /> ASTM D5430 Standard
          </span>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <ShieldCheck /> 4-Point System Fabric Inspection
          </h1>
          <p className="text-emerald-200 text-sm mt-1">
            Calculate fabric roll penalty score (points per 100 sq yds) and assign Grade A/B/C/Reject quality tags.
          </p>
        </div>
        <button onClick={openAdd} className="bg-white text-emerald-950 font-bold px-5 py-3 rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow shrink-0">
          <Plus size={20} /> Log 4-Point Audit
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading 4-point fabric roll audits...</div>
      ) : (
        <DataTable columns={columns} data={qcList} searchKeys={['inspectionNumber', 'rollNumber', 'fabricName', 'gradeVerdict']} title="4-Point QC Audits"
          actions={(row) => (
            <>
              <button onClick={() => openEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
              <button onClick={() => setDeleteConfirm(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </>
          )} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit 4-Point Audit' : 'Log 4-Point Fabric Inspection'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Inspection #</label>
              <input type="text" required value={form.inspectionNumber} onChange={e => setForm({ ...form, inspectionNumber: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Roll Barcode #</label>
              <input type="text" required value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Fabric Name</label>
              <input type="text" required value={form.fabricName} onChange={e => setForm({ ...form, fabricName: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Supplier Name</label>
              <input type="text" required value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Width (Inches)</label>
              <input type="number" value={form.rollWidthInches} onChange={e => setForm({ ...form, rollWidthInches: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Length (Yards)</label>
              <input type="number" value={form.rollLengthYards} onChange={e => setForm({ ...form, rollLengthYards: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Penalty Points</label>
              <input type="number" value={form.totalDefectPoints} onChange={e => {
                const pts = Number(e.target.value);
                const pts100 = Number(((pts * 3600) / (form.rollLengthYards * form.rollWidthInches)).toFixed(1));
                setForm({ ...form, totalDefectPoints: pts, pointsPer100SqYards: pts100, gradeVerdict: pts100 <= 20 ? 'Grade A' : 'Grade B' });
              }} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Calculated Pts / 100 Sq Yds</label>
              <input type="number" readOnly value={form.pointsPer100SqYards} className="input-field bg-gray-50 font-bold text-indigo-700" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Roll Grade Verdict</label>
              <select value={form.gradeVerdict} onChange={e => setForm({ ...form, gradeVerdict: e.target.value })} className="input-field">
                <option value="Grade A">Grade A (&lt; 20 pts)</option>
                <option value="Grade B">Grade B (20 - 28 pts)</option>
                <option value="Grade C">Grade C (&gt; 28 pts)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingItem ? 'Update' : 'Save'} Audit</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-600">Delete 4-Point audit <strong>{deleteConfirm?.inspectionNumber}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
