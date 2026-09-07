import { useState, useEffect } from 'react';
import api from '../utils/api';
import { PackageCheck, Plus, QrCode, Sparkles, Pencil, Trash2, X, Printer } from 'lucide-react';

export default function BatchTracking() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [barcodePrintItem, setBarcodePrintItem] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const generateNewForm = () => ({
    rollNumber: `ROLL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    lotNumber: `LOT-DYE-${Math.floor(100 + Math.random() * 900)}`,
    fabricName: '100% Organic Cotton Twill',
    shadeGroup: 'Shade A (Dark)',
    grossWeightKg: 45.5,
    netWeightKg: 44.0,
    lengthMeters: 120,
    widthInches: 58,
    gsm: 210,
    shrinkagePercent: 3.5,
    supplier: 'TexMaster Mills Ltd',
  });

  const [formData, setFormData] = useState(generateNewForm());

  const fetchBatches = async () => {
    try {
      const res = await api.get('/batches');
      setBatches(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const openNewModal = () => {
    setEditingItem(null);
    setFormData(generateNewForm());
    setErrorMessage('');
    setShowModal(true);
  };

  const openEditModal = (batch) => {
    setEditingItem(batch);
    setFormData({
      rollNumber: batch.rollNumber,
      lotNumber: batch.lotNumber,
      fabricName: batch.fabricName,
      shadeGroup: batch.shadeGroup || 'Shade A (Dark)',
      grossWeightKg: batch.grossWeightKg || 0,
      netWeightKg: batch.netWeightKg || 0,
      lengthMeters: batch.lengthMeters || 0,
      widthInches: batch.widthInches || 0,
      gsm: batch.gsm || 0,
      shrinkagePercent: batch.shrinkagePercent || 0,
      supplier: batch.supplier || ''
    });
    setErrorMessage('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      if (editingItem) {
        await api.put(`/batches/${editingItem._id}`, formData);
      } else {
        await api.post('/batches', formData);
      }
      setShowModal(false);
      fetchBatches();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Error saving batch');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/batches/${id}`);
      setDeleteConfirm(null);
      fetchBatches();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting batch');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-700 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-blue-500/30 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
            <Sparkles size={14} /> Barcode & Shade Control
          </span>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <PackageCheck /> Fabric Roll & Dye-Lot Batch Tracking
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            Track individual fabric roll IDs, dye lot numbers, shade groups (Shade A/B/C), GSM, and shrinkage %.
          </p>
        </div>
        <button onClick={openNewModal} className="bg-white text-blue-900 font-bold px-5 py-3 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow w-full md:w-auto shrink-0">
          <Plus size={20} /> Register Fabric Roll
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading fabric roll inventory...</div>
      ) : batches.length === 0 ? (
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
          <QrCode className="mx-auto text-blue-500 mb-3" size={48} />
          <h3 className="text-xl font-bold text-gray-800">No Fabric Rolls Registered Yet</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Register your fabric roll barcodes and dye lots with shade group classification to prevent color mismatches.
          </p>
          <button onClick={openNewModal} className="btn-primary">+ Register Roll Batch</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[750px]">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-4">Roll & Lot #</th>
                <th className="p-4">Fabric Specification</th>
                <th className="p-4">Shade Group</th>
                <th className="p-4">GSM / Width</th>
                <th className="p-4">Weight & Length</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.map((batch) => (
                <tr key={batch._id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-gray-900">
                    <div>{batch.rollNumber}</div>
                    <span className="text-xs text-gray-500 font-normal">{batch.lotNumber}</span>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-800">{batch.fabricName}</div>
                    <div className="text-xs text-gray-500">{batch.supplier}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {batch.shadeGroup}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-700">
                    <div className="font-bold">{batch.gsm} g/m²</div>
                    <div className="text-gray-500">{batch.widthInches}" width (Shrink: {batch.shrinkagePercent}%)</div>
                  </td>
                  <td className="p-4 text-xs font-medium text-gray-800">
                    <div className="font-bold">{batch.netWeightKg} kg (Net)</div>
                    <div className="text-gray-500">{batch.lengthMeters} Meters</div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      {batch.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setBarcodePrintItem(batch)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg" title="Print Barcode Label">
                        <Printer size={16} />
                      </button>
                      <button onClick={() => openEditModal(batch)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteConfirm(batch)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl my-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{editingItem ? 'Edit Fabric Roll Batch' : 'Register Fabric Roll Batch'}</h2>
                <p className="text-xs text-gray-500">Record roll barcode, shade classification, and physical specs.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Roll Barcode #</label>
                  <input type="text" required value={formData.rollNumber} onChange={e => setFormData({ ...formData, rollNumber: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Dyeing Lot #</label>
                  <input type="text" required value={formData.lotNumber} onChange={e => setFormData({ ...formData, lotNumber: e.target.value })} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Fabric Description</label>
                  <input type="text" required value={formData.fabricName} onChange={e => setFormData({ ...formData, fabricName: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Shade Classification</label>
                  <select value={formData.shadeGroup} onChange={e => setFormData({ ...formData, shadeGroup: e.target.value })} className="input-field">
                    <option value="Shade A (Dark)">Shade A (Dark)</option>
                    <option value="Shade B (Medium)">Shade B (Medium)</option>
                    <option value="Shade C (Light)">Shade C (Light)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">GSM (g/m²)</label>
                  <input type="number" value={formData.gsm} onChange={e => setFormData({ ...formData, gsm: Number(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Width (Inches)</label>
                  <input type="number" value={formData.widthInches} onChange={e => setFormData({ ...formData, widthInches: Number(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Shrinkage %</label>
                  <input type="number" step="0.1" value={formData.shrinkagePercent} onChange={e => setFormData({ ...formData, shrinkagePercent: Number(e.target.value) })} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Net Weight (kg)</label>
                  <input type="number" value={formData.netWeightKg} onChange={e => setFormData({ ...formData, netWeightKg: Number(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Length (Meters)</label>
                  <input type="number" value={formData.lengthMeters} onChange={e => setFormData({ ...formData, lengthMeters: Number(e.target.value) })} className="input-field" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingItem ? 'Update Roll' : 'Register Roll'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Label Print Preview Modal */}
      {barcodePrintItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl space-y-4">
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-2xl bg-gray-50 font-mono text-left space-y-2">
              <div className="text-center border-b pb-2 border-gray-200">
                <h4 className="font-extrabold text-base text-gray-900">TEXTILEFLOW FABRIC ROLL</h4>
                <p className="text-xs text-gray-500">INDUSTRIAL BARCODE PASS</p>
              </div>
              <div className="text-xs space-y-1 pt-2">
                <p><strong className="text-gray-900">ROLL ID:</strong> {barcodePrintItem.rollNumber}</p>
                <p><strong className="text-gray-900">LOT #:</strong> {barcodePrintItem.lotNumber}</p>
                <p><strong className="text-gray-900">FABRIC:</strong> {barcodePrintItem.fabricName}</p>
                <p><strong className="text-gray-900">SHADE:</strong> {barcodePrintItem.shadeGroup}</p>
                <p><strong className="text-gray-900">SPECS:</strong> {barcodePrintItem.gsm} GSM | {barcodePrintItem.netWeightKg} KG | {barcodePrintItem.lengthMeters} M</p>
              </div>
              <div className="pt-4 text-center">
                {/* SVG Barcode Mock */}
                <div className="h-12 bg-slate-900 text-white font-bold flex items-center justify-center tracking-widest rounded text-sm">
                  ||| | |||| | ||||| || | {barcodePrintItem.rollNumber}
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <button onClick={() => setBarcodePrintItem(null)} className="btn-secondary text-xs">Close</button>
              <button onClick={() => window.print()} className="btn-primary text-xs flex items-center gap-1.5">
                <Printer size={14} /> Print Label
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <Trash2 className="mx-auto text-red-500 mb-3" size={36} />
            <h3 className="font-bold text-gray-900 text-base mb-2">Delete Fabric Roll?</h3>
            <p className="text-xs text-gray-500 mb-6">Delete roll barcode {deleteConfirm.rollNumber}?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary text-xs">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger text-xs">Delete Roll</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
