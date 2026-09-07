import { useEffect, useState } from 'react';
import { Archive, Building2, Pencil, Plus, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../utils/api.js';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

export default function Departments() {
  const { hasRole } = useApp();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [formLoading, setFormLoading] = useState(false);

  const isAdmin = hasRole(['admin']);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments?limit=100');
      setDepartments(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ name: '' });
    setEditingDepartment(null);
  };

  const openAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (department) => {
    setForm({ name: department.name });
    setEditingDepartment(department);
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    try {
      if (editingDepartment) {
        await api.put(`/departments/${editingDepartment._id}`, form);
      } else {
        await api.post('/departments', form);
      }
      await fetchDepartments();
      setModalOpen(false);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving department');
    } finally { setFormLoading(false); }
  };

  const changeStatus = async (department) => {
    try {
      await api.put(`/departments/${department._id}`, {
        status: department.status === 'active' ? 'archived' : 'active'
      });
      await fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating department');
    }
  };

  const columns = [
    { key: 'name', label: 'Department', render: value => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-textile-100 flex items-center justify-center text-textile-700"><Building2 size={18} /></div>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
    )},
    { key: 'status', label: 'Status', render: value => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
        {value}
      </span>
    )},
    { key: 'createdAt', label: 'Created', render: value => value ? new Date(value).toLocaleDateString() : '-' }
  ];

  if (loading) return <div className="text-center py-20 text-gray-500">Loading departments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
          <p className="text-sm text-gray-500 mt-1">Manage departments for this organization</p>
        </div>
        {isAdmin && <button onClick={openAdd} className="btn-primary"><Plus size={18} /> Add Department</button>}
      </div>

      <DataTable
        columns={columns}
        data={departments}
        searchKeys={['name', 'status']}
        actions={isAdmin ? department => (
          <>
            <button onClick={() => openEdit(department)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit department"><Pencil size={16} /></button>
            <button onClick={() => changeStatus(department)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg" title={department.status === 'active' ? 'Archive department' : 'Restore department'}>
              {department.status === 'active' ? <Archive size={16} /> : <RotateCcw size={16} />}
            </button>
          </>
        ) : null}
      />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={editingDepartment ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input type="text" value={form.name} onChange={event => setForm({ name: event.target.value })} className="input-field" placeholder="e.g. Cutting" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); resetForm(); }} className="btn-secondary" disabled={formLoading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={formLoading}>{formLoading ? 'Saving...' : (editingDepartment ? 'Update' : 'Add')} Department</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
