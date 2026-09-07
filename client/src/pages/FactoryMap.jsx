import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Factory, Activity, Cpu, CheckCircle2, AlertOctagon, 
  Wrench, Play, Pause, RefreshCw, X, UserCheck, Gauge, Plus, Pencil, Trash2 
} from 'lucide-react';

export default function FactoryMap() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [activeDept, setActiveDept] = useState('All');

  const [form, setForm] = useState({
    machineCode: '',
    name: '',
    category: 'Sewing Machine',
    department: 'Sewing Department',
    locationLine: 'Line-1',
    status: 'Running',
    operatingHours: 0
  });

  const fetchMachines = async () => {
    try {
      const res = await api.get('/machines');
      setMachines(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const resetForm = () => {
    setForm({
      machineCode: '',
      name: '',
      category: 'Sewing Machine',
      department: 'Sewing Department',
      locationLine: 'Line-1',
      status: 'Running',
      operatingHours: 0
    });
    setEditingMachine(null);
  };

  const openAdd = () => { resetForm(); setModalOpen(true); };

  const openEdit = (mch, e) => {
    e.stopPropagation();
    setEditingMachine(mch);
    setForm({
      machineCode: mch.machineCode,
      name: mch.name,
      category: mch.category || 'Sewing Machine',
      department: mch.department || 'Sewing Department',
      locationLine: mch.locationLine || 'Line-1',
      status: mch.status || 'Running',
      operatingHours: mch.operatingHours || 0
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingMachine) {
        await api.put(`/machines/${editingMachine._id}`, form);
      } else {
        await api.post('/machines', form);
      }
      await fetchMachines();
      setModalOpen(false);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving machine');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/machines/${id}`);
      await fetchMachines();
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting machine');
    }
  };

  const departments = ['All', 'Spinning', 'Weaving', 'Dyeing', 'Cutting', 'Sewing Department', 'Finishing'];

  const filteredMachines = activeDept === 'All' 
    ? machines 
    : machines.filter(m => m.department === activeDept || m.category?.includes(activeDept));

  const statusColors = {
    'Running': 'bg-emerald-600 text-white border-emerald-500',
    'Idle': 'bg-amber-500 text-slate-900 border-amber-400',
    'Downtime / Breakdown': 'bg-red-600 text-white border-red-500',
    'Under Maintenance': 'bg-blue-600 text-white border-blue-500'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-indigo-500/30 text-indigo-200 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit mb-3 border border-indigo-400/20">
            <Activity size={14} /> Live Factory Floor Visualizer & IoT
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
            <Factory className="text-indigo-400" size={32} /> Digital Factory Floor Map
          </h1>
          <p className="text-indigo-200 text-sm mt-2 max-w-2xl">
            Real-time machine monitoring, status visualizer, and line OEE tracking across the factory floor.
          </p>
        </div>

        <button onClick={openAdd} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm shrink-0">
          <Plus size={18} /> Add New Machine
        </button>
      </div>

      {/* Department Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 mr-2">Department:</span>
          {departments.map(dept => (
            <button key={dept} onClick={() => setActiveDept(dept)} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${activeDept === dept ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Digital Floor Map Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Loading factory machines...</div>
      ) : (
        <div className="bg-slate-950 rounded-3xl p-6 border-4 border-slate-900 shadow-2xl relative min-h-[480px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
            {filteredMachines.map(mch => (
              <div 
                key={mch._id} 
                className={`p-5 rounded-2xl border transition-all shadow-lg flex flex-col justify-between relative group ${statusColors[mch.status] || 'bg-slate-800 text-white border-slate-700'}`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
                      {mch.machineCode}
                    </span>
                    <div className="flex items-center gap-1 opacity-90">
                      <button onClick={(e) => openEdit(mch, e)} className="p-1 hover:bg-black/30 rounded text-white">
                        <Pencil size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(mch); }} className="p-1 hover:bg-black/30 rounded text-red-200 hover:text-red-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm leading-snug mb-1">{mch.name}</h3>
                  <p className="text-[11px] opacity-90">{mch.locationLine || mch.department}</p>
                </div>

                <div className="border-t border-white/20 pt-3 mt-4 flex justify-between items-center text-[11px]">
                  <span className="font-bold">{mch.status}</span>
                  <span className="font-mono opacity-80">{mch.operatingHours || 0} hrs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Machine Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl my-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="font-bold text-gray-900 text-lg">{editingMachine ? 'Edit Factory Machine' : 'Add New Machine'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Machine Code</label>
                  <input type="text" required value={form.machineCode} onChange={e => setForm({ ...form, machineCode: e.target.value })} className="input-field text-xs" placeholder="e.g. MCH-SEW-01" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Machine Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-xs" placeholder="e.g. Juki Lockstitch" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                  <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="input-field text-xs">
                    <option value="Spinning">Spinning</option>
                    <option value="Weaving">Weaving</option>
                    <option value="Dyeing">Dyeing</option>
                    <option value="Cutting">Cutting</option>
                    <option value="Sewing Department">Sewing Department</option>
                    <option value="Finishing">Finishing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Location Line</label>
                  <input type="text" value={form.locationLine} onChange={e => setForm({ ...form, locationLine: e.target.value })} className="input-field text-xs" placeholder="e.g. Line-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Live Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field text-xs">
                    <option value="Running">Running 🟢</option>
                    <option value="Idle">Idle 🟡</option>
                    <option value="Downtime / Breakdown">Downtime / Breakdown 🔴</option>
                    <option value="Under Maintenance">Under Maintenance 🔵</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Operating Hours</label>
                  <input type="number" value={form.operatingHours} onChange={e => setForm({ ...form, operatingHours: Number(e.target.value) })} className="input-field text-xs" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs" disabled={formLoading}>Cancel</button>
                <button type="submit" className="btn-primary text-xs" disabled={formLoading}>{formLoading ? 'Saving...' : (editingMachine ? 'Update Machine' : 'Create Machine')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <Trash2 className="mx-auto text-red-500 mb-3" size={36} />
            <h3 className="font-bold text-gray-900 text-base mb-2">Delete Machine?</h3>
            <p className="text-xs text-gray-500 mb-6">Remove machine {deleteConfirm.machineCode} from the digital factory map?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary text-xs">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger text-xs">Delete Machine</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
