import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { FileText, Plus, Sparkles, Printer, Pencil, Trash2 } from 'lucide-react';

export default function ExportDocumentation() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [printDoc, setPrintDoc] = useState(null);

  const [form, setForm] = useState({
    shipmentNumber: 'EXP-INV-2026-001',
    customerName: 'Global Garment Apparel USA Inc',
    destinationCountry: 'USA',
    portOfLoading: 'Chittagong / Karachi Port',
    portOfDischarge: 'Port of New York / Newark',
    containerNumber: 'MSCU-9041284',
    sealNumber: 'SEAL-90412',
    vesselName: 'Maersk Horizon v.204',
    incoterms: 'FOB',
    totalQuantity: 5000,
    totalCartons: 250,
    totalGrossWeightKg: 1250,
    totalShipmentValue: 32500,
    commercialInvoiceNumber: 'INV-EXPORT-9041',
    lcNumber: 'LC-BANK-904128',
    status: 'Customs Cleared'
  });

  const fetchShipments = async () => {
    try {
      const res = await api.get('/shipments');
      setShipments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const resetForm = () => {
    setForm({
      shipmentNumber: `EXP-INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName: 'Zara Apparel Europe B.V.',
      destinationCountry: 'Germany',
      portOfLoading: 'Chittagong Port',
      portOfDischarge: 'Port of Hamburg',
      containerNumber: 'CMAU-8012491',
      sealNumber: 'SEAL-80124',
      vesselName: 'MSC Isabella v.102',
      incoterms: 'CIF',
      totalQuantity: 8000,
      totalCartons: 400,
      totalGrossWeightKg: 2100,
      totalShipmentValue: 56000,
      commercialInvoiceNumber: `INV-EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      lcNumber: `LC-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Planned'
    });
    setEditingItem(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      shipmentNumber: item.shipmentNumber,
      customerName: item.customerName,
      destinationCountry: item.destinationCountry || 'USA',
      portOfLoading: item.portOfLoading || '',
      portOfDischarge: item.portOfDischarge || '',
      containerNumber: item.containerNumber || '',
      sealNumber: item.sealNumber || '',
      vesselName: item.vesselName || '',
      incoterms: item.incoterms || 'FOB',
      totalQuantity: item.totalQuantity || 0,
      totalCartons: item.totalCartons || 0,
      totalGrossWeightKg: item.totalGrossWeightKg || 0,
      totalShipmentValue: item.totalShipmentValue || 0,
      commercialInvoiceNumber: item.commercialInvoiceNumber || '',
      lcNumber: item.lcNumber || '',
      status: item.status || 'Planned'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/shipments/${editingItem._id}`, form);
      } else {
        await api.post('/shipments', form);
      }
      setShowModal(false);
      fetchShipments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving export shipment document');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/shipments/${id}`);
      setDeleteConfirm(null);
      fetchShipments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting export shipment document');
    }
  };

  const columns = [
    { key: 'shipmentNumber', label: 'Commercial Invoice #', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
    { key: 'customerName', label: 'Buyer / Consignee' },
    { key: 'destinationCountry', label: 'Destination', render: (val) => <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">{val}</span> },
    { key: 'totalQuantity', label: 'Export Qty', render: (val) => `${val} pcs` },
    { key: 'totalCartons', label: 'Packing', render: (val) => `${val} Cartons` },
    { key: 'totalShipmentValue', label: 'FOB Invoice Value', render: (val) => <span className="font-extrabold text-emerald-700">${val?.toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: (val) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${val === 'Customs Cleared' || val === 'On Board' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
        {val}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-emerald-500/30 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
            <Sparkles size={14} /> International Shipping Suite
          </span>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText /> Commercial Export Documentation
          </h1>
          <p className="text-emerald-200 text-sm mt-1">
            Generate Commercial Invoices, Export Packing Lists, Certificate of Origin drafts, and Shipping Bills.
          </p>
        </div>
        <button onClick={openAdd} className="bg-white text-emerald-950 font-bold px-5 py-3 rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow shrink-0">
          <Plus size={20} /> Create Export Document
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading commercial export documentation...</div>
      ) : (
        <DataTable columns={columns} data={shipments} searchKeys={['shipmentNumber', 'customerName', 'destinationCountry', 'status']} title="Export Docs"
          actions={(row) => (
            <>
              <button onClick={() => setPrintDoc(row)} className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg" title="Print Invoice & Packing List">
                <Printer size={16} />
              </button>
              <button onClick={() => openEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
              <button onClick={() => setDeleteConfirm(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </>
          )} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Export Document' : 'Generate Export Commercial Invoice & Packing List'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Commercial Invoice #</label>
              <input type="text" required value={form.shipmentNumber} onChange={e => setForm({ ...form, shipmentNumber: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Buyer / Consignee</label>
              <input type="text" required value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Destination</label>
              <input type="text" required value={form.destinationCountry} onChange={e => setForm({ ...form, destinationCountry: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Port of Loading</label>
              <input type="text" value={form.portOfLoading} onChange={e => setForm({ ...form, portOfLoading: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Port of Discharge</label>
              <input type="text" value={form.portOfDischarge} onChange={e => setForm({ ...form, portOfDischarge: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Export Pcs Qty</label>
              <input type="number" value={form.totalQuantity} onChange={e => setForm({ ...form, totalQuantity: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Cartons Count</label>
              <input type="number" value={form.totalCartons} onChange={e => setForm({ ...form, totalCartons: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Invoice FOB ($)</label>
              <input type="number" value={form.totalShipmentValue} onChange={e => setForm({ ...form, totalShipmentValue: Number(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Container #</label>
              <input type="text" value={form.containerNumber} onChange={e => setForm({ ...form, containerNumber: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
                <option value="Planned">Planned</option>
                <option value="Booking Created">Booking Created</option>
                <option value="Packed">Packed</option>
                <option value="Customs Cleared">Customs Cleared</option>
                <option value="On Board">On Board</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingItem ? 'Update' : 'Generate'} Document</button>
          </div>
        </form>
      </Modal>

      {/* Commercial Invoice Printable Modal */}
      {printDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 my-auto text-xs font-sans">
            <div className="flex justify-between items-start border-b pb-4 border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">COMMERCIAL INVOICE & PACKING LIST</h2>
                <p className="text-gray-500 font-semibold">TEXTILEFLOW GARMENT EXPORTS LTD</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-sm text-indigo-700">INVOICE #: {printDoc.shipmentNumber}</p>
                <p className="text-gray-500">DATE: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
              <div>
                <strong className="block text-gray-900 font-bold mb-1">BUYER / CONSIGNEE:</strong>
                <p>{printDoc.customerName}</p>
                <p>DESTINATION: {printDoc.destinationCountry}</p>
              </div>
              <div>
                <strong className="block text-gray-900 font-bold mb-1">SHIPPING SPECS:</strong>
                <p>PORT OF LOADING: {printDoc.portOfLoading}</p>
                <p>PORT OF DISCHARGE: {printDoc.portOfDischarge}</p>
                <p>CONTAINER #: {printDoc.containerNumber || 'MSCU-901248'}</p>
              </div>
            </div>
            <table className="w-full border text-left">
              <thead className="bg-gray-100 text-gray-800 font-bold">
                <tr>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Cartons</th>
                  <th className="p-2 border">Quantity (Pcs)</th>
                  <th className="p-2 border">Total FOB ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border font-medium">Ready Made Apparel Garments</td>
                  <td className="p-2 border">{printDoc.totalCartons} Cartons</td>
                  <td className="p-2 border font-bold">{printDoc.totalQuantity} Pcs</td>
                  <td className="p-2 border font-extrabold text-emerald-700">${printDoc.totalShipmentValue?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setPrintDoc(null)} className="btn-secondary">Close</button>
              <button onClick={() => window.print()} className="btn-primary flex items-center gap-1.5">
                <Printer size={14} /> Print Commercial Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-600">Delete export document <strong>{deleteConfirm?.shipmentNumber}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
