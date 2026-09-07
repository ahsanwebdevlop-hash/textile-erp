import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Warehouse, Plus, Sparkles, Pencil, Trash2 } from 'lucide-react';

export default function WarehouseBins() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    warehouseName: 'Yarn Store Unit 1',
    zone: 'Zone A (Raw Cotton)',
    rackCode: 'Rack-04',
    binCode: 'Bin A-02-04',
    capacityKgOrUnits: 500,
    currentStockKgOrUnits: 320,
    storedMaterialName: '30s/1 Combed Cotton Yarn',
    status: 'Occupied'
  });

  const fetchBins = async () => {
    try {
      const res = await api.get('/warehouse-bins');
      setBins(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();
  }, []);

  const resetForm = () => {
    setForm({
      warehouseName: 'Fabric Roll Store',
      zone: 'Zone B (Finished Fabric)',
      rackCode: 'Rack-12',
      binCode: 'Bin B-04-01',
      capacityKgOrUnits: 800,
      currentStockKgOrUnits: 0,
      storedMaterialName: '',
      status: 'Available'
    });
    setEditingItem(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      warehouseName: item.warehouseName,
      zone: item.zone,
      rackCode: item.rackCode,
      binCode: item.binCode,
      capacityKgOrUnits: item.capacityKgOrUnits || 500,
      currentStockKgOrUnits: item.currentStockKgOrUnits || 0,
      storedMaterialName: item.storedMaterialName || '',
      status: item.status || 'Available'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/warehouse-bins/${editingItem._id}`, form);
      } else {
        await api.post('/warehouse-bins', form);
      }
      setShowModal(false);
      fetchBins();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving warehouse bin');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/warehouse-bins/${id}`);
      setDeleteConfirm(null);
      fetchBins();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting warehouse bin');
    }
  };

  const columns = [
    { key: 'binCode', label: 'Bin Location Code', render: (val) => <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded">{val}</span> },
    { key: 'warehouseName', label: 'Warehouse' },
    { key: 'zone', label: 'Zone & Rack', render: (_, row) => `${row.zone} (${row.rackCode})` },
    { key: 'storedMaterialName', label: 'Stored Material', render: (val) => val || <span className="text-gray-400 italic">Empty</span> },
    { key: 'currentStockKgOrUnits', label: 'Current Stock', render: (val, row) => <span className="font-bold text-indigo-700">{val} / {row.capacityKgOrUnits} kg</span> },
    { key: 'status', label: 'Status', render: (val) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${val === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
        {val}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-blue-500/30 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
            <Sparkles size={14} /> WMS Multi-Warehouse Storage
          </span>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Warehouse /> Warehouse Rack & Bin Location Storage
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            Organize raw cotton, yarn cones, fabric rolls, and trims in designated Rack, Aisle, and Bin storage locations.
          </p>
        </div>
        <button onClick={openAdd} className="bg-white text-blue-950 font-bold px-5 py-3 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow shrink-0">
          <Plus size={20} /> Create Bin Location
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading warehouse bin locations...</div>
      ) : (
        <DataTable columns={columns} data={bins} searchKeys={['binCode', 'warehouseName', 'zone', 'storedMaterialName', 'status']} title="Warehouse Bins"
          actions={(row) => (
            <>
              <button onClick={() => openEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
              <button onClick={() => setDeleteConfirm(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </>
          )} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Bin Location' : 'Create Warehouse Bin Location'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Warehouse Name</label>
              <input type="text" required value={form.warehouseName} onChange={e => setForm({ ...form, warehouseName: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Zone Name</label>
              <input type="text" required value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Rack Code</label>
              <input type="text" required value={form.rackCode} onChange={e => setForm({ ...form, rackCode: e.target.value })} className="input-field" placeholder="e.g. Rack-04" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Bin Location Code</label>
              <input type="text" required value={form.binCode} onChange={e => setForm({ ...form, binCode: e.target.value })} className="input-field" placeholder="e.g. Bin A-02-04" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Capacity (kg/units)</label>
              <input type="number" value={form.capacityKgOrUnits} onChange={e => setForm({ ...form, capacityKgOrUnits: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Current Stock</label>
              <input type="number" value={form.currentStockKgOrUnits} onChange={e => setForm({ ...form, currentStockKgOrUnits: Number(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">Stored Material Name</label>
            <input type="text" value={form.storedMaterialName} onChange={e => setForm({ ...form, storedMaterialName: e.target.value })} className="input-field" placeholder="e.g. Cotton Yarn 30s/1" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingItem ? 'Update' : 'Save'} Bin</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-600">Delete bin location <strong>{deleteConfirm?.binCode}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
