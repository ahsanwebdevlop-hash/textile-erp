import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { DollarSign, Plus, Sparkles, TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react';

export default function FinancialLedgerPnl() {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    voucherNumber: 'VOUCH-2026-001',
    accountType: 'Revenue / Export Sales',
    transactionType: 'Credit',
    currency: 'USD',
    amountOriginal: 32500,
    exchangeRateToUSD: 1.0,
    amountInUSD: 32500,
    partyName: 'Global Garment Apparel USA Inc',
    referenceDocNumber: 'INV-EXPORT-9041',
    description: 'Export commercial invoice payment received via Bank LC Wire.'
  });

  const fetchLedgers = async () => {
    try {
      const res = await api.get('/financial-ledgers');
      setLedgers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgers();
  }, []);

  const resetForm = () => {
    setForm({
      voucherNumber: `VOUCH-2026-${Math.floor(100 + Math.random() * 900)}`,
      accountType: 'Raw Material Expense',
      transactionType: 'Debit',
      currency: 'USD',
      amountOriginal: 12500,
      exchangeRateToUSD: 1.0,
      amountInUSD: 12500,
      partyName: 'TexMaster Cotton Mills',
      referenceDocNumber: 'PO-RAW-9012',
      description: 'Raw yarn procurement payment.'
    });
    setEditingItem(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      voucherNumber: item.voucherNumber,
      accountType: item.accountType || 'Revenue / Export Sales',
      transactionType: item.transactionType || 'Credit',
      currency: item.currency || 'USD',
      amountOriginal: item.amountOriginal || 0,
      exchangeRateToUSD: item.exchangeRateToUSD || 1,
      amountInUSD: item.amountInUSD || 0,
      partyName: item.partyName || '',
      referenceDocNumber: item.referenceDocNumber || '',
      description: item.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const amountInUSD = form.amountOriginal * form.exchangeRateToUSD;
      const payload = { ...form, amountInUSD };
      if (editingItem) {
        await api.put(`/financial-ledgers/${editingItem._id}`, payload);
      } else {
        await api.post('/financial-ledgers', payload);
      }
      setShowModal(false);
      fetchLedgers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving ledger voucher');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/financial-ledgers/${id}`);
      setDeleteConfirm(null);
      fetchLedgers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting ledger voucher');
    }
  };

  const totalRevenue = ledgers.filter(l => l.transactionType === 'Credit').reduce((acc, curr) => acc + (curr.amountInUSD || 0), 0);
  const totalExpenses = ledgers.filter(l => l.transactionType === 'Debit').reduce((acc, curr) => acc + (curr.amountInUSD || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  const columns = [
    { key: 'voucherNumber', label: 'Voucher #', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
    { key: 'accountType', label: 'Account Classification' },
    { key: 'partyName', label: 'Party / Customer / Vendor' },
    { key: 'currency', label: 'Currency', render: (val) => <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold">{val}</span> },
    { key: 'amountInUSD', label: 'Amount (USD)', render: (val, row) => (
      <span className={`font-extrabold ${row.transactionType === 'Credit' ? 'text-emerald-600' : 'text-red-600'}`}>
        {row.transactionType === 'Credit' ? `+$${val?.toLocaleString()}` : `-$${val?.toLocaleString()}`}
      </span>
    )},
    { key: 'transactionType', label: 'Type', render: (val) => (
      <span className={`px-2 py-0.5 rounded text-xs font-bold ${val === 'Credit' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
        {val}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-emerald-500/30 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
            <Sparkles size={14} /> Multi-Currency General Ledger
          </span>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <DollarSign /> Enterprise Financial Ledger & P&L
          </h1>
          <p className="text-emerald-200 text-sm mt-1">
            Track multi-currency revenue export vouchers, raw material purchases, factory CPM, and P&L performance.
          </p>
        </div>
        <button onClick={openAdd} className="bg-white text-emerald-950 font-bold px-5 py-3 rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow shrink-0">
          <Plus size={20} /> Post Ledger Voucher
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-emerald-50 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase">Export Revenue (Credit)</p>
              <p className="text-2xl font-black text-emerald-700">${totalRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="text-emerald-500" size={32} />
          </div>
        </div>
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase">Total Operating Expenses (Debit)</p>
              <p className="text-2xl font-black text-red-700">${totalExpenses.toLocaleString()}</p>
            </div>
            <TrendingDown className="text-red-500" size={32} />
          </div>
        </div>
        <div className="card bg-indigo-50 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase">Net Profit Margin</p>
              <p className="text-2xl font-black text-indigo-700">${netProfit.toLocaleString()}</p>
            </div>
            <DollarSign className="text-indigo-500" size={32} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Loading financial ledger vouchers...</div>
      ) : (
        <DataTable columns={columns} data={ledgers} searchKeys={['voucherNumber', 'accountType', 'partyName', 'transactionType']} title="Financial Vouchers"
          actions={(row) => (
            <>
              <button onClick={() => openEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
              <button onClick={() => setDeleteConfirm(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </>
          )} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Financial Voucher' : 'Post Financial Ledger Voucher'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Voucher Number</label>
              <input type="text" required value={form.voucherNumber} onChange={e => setForm({ ...form, voucherNumber: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Account Classification</label>
              <select value={form.accountType} onChange={e => setForm({ ...form, accountType: e.target.value })} className="input-field">
                <option value="Revenue / Export Sales">Revenue / Export Sales</option>
                <option value="Raw Material Expense">Raw Material Expense</option>
                <option value="Direct Labor Payroll">Direct Labor Payroll</option>
                <option value="Factory Overhead">Factory Overhead</option>
                <option value="Logistics & Freight">Logistics & Freight</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Type</label>
              <select value={form.transactionType} onChange={e => setForm({ ...form, transactionType: e.target.value })} className="input-field">
                <option value="Credit">Credit (Income)</option>
                <option value="Debit">Debit (Expense)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Currency</label>
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="input-field">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="BDT">BDT (৳)</option>
                <option value="PKR">PKR (Rs)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Original Amount</label>
              <input type="number" value={form.amountOriginal} onChange={e => setForm({ ...form, amountOriginal: Number(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">Party / Customer / Vendor Name</label>
            <input type="text" required value={form.partyName} onChange={e => setForm({ ...form, partyName: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">Voucher Description</label>
            <textarea rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingItem ? 'Update' : 'Post'} Voucher</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-600">Delete financial voucher <strong>{deleteConfirm?.voucherNumber}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
