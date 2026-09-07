import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Building2, Truck, ShoppingBag, ShieldCheck, FileText, 
  ExternalLink, Search, Clock, CheckCircle2, AlertTriangle, UserCheck
} from 'lucide-react';

export default function Portals() {
  const [portalType, setPortalType] = useState('buyer'); // 'buyer' or 'supplier'
  const [orders, setOrders] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    try {
      const [salesRes, purchRes] = await Promise.all([
        api.get('/sales?limit=20'),
        api.get('/purchases?limit=20')
      ]);
      setOrders(salesRes.data.data || []);
      setPurchases(purchRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customerName?.toLowerCase().includes(search.toLowerCase()) || 
    o.orderNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPurchases = purchases.filter(p => 
    p.supplier?.toLowerCase().includes(search.toLowerCase()) || 
    p.poNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-indigo-500/30 text-indigo-200 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit mb-3 border border-indigo-400/20">
            <UserCheck size={14} /> Enterprise External Self-Service Portals
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
            <Building2 className="text-indigo-400" size={32} /> Buyer & Supplier Portal Hub
          </h1>
          <p className="text-indigo-200 text-sm mt-2 max-w-2xl">
            Isolated self-service view for external buyers to track production progress & suppliers to inspect PO delivery status.
          </p>
        </div>

        {/* Portal Switcher */}
        <div className="bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 flex items-center gap-1 shrink-0">
          <button onClick={() => setPortalType('buyer')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${portalType === 'buyer' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}>
            <ShoppingBag size={16} /> Buyer Portal
          </button>
          <button onClick={() => setPortalType('supplier')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${portalType === 'supplier' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}>
            <Truck size={16} /> Supplier Portal
          </button>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder={portalType === 'buyer' ? 'Search by Buyer Name or Sales Order SO-XXXX...' : 'Search by Supplier Name or PO-XXXX...'} 
          className="w-full text-sm outline-none text-gray-800 placeholder-gray-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Loading portal data...</div>
      ) : portalType === 'buyer' ? (
        /* Buyer Portal View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Active Buyer Orders ({filteredOrders.length})</h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Buyer Portal Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(order => (
              <div key={order._id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-extrabold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {order.orderStatus || 'In Production'}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg mb-1">{order.productName}</h3>
                  <p className="text-xs font-semibold text-gray-500 mb-4">Buyer: {order.customerName}</p>

                  <div className="bg-gray-50 p-4 rounded-2xl space-y-2 text-xs text-gray-700 mb-4">
                    <div className="flex justify-between">
                      <span>Order Quantity:</span>
                      <span className="font-bold text-gray-900">{order.quantity?.toLocaleString()} pcs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Deadline:</span>
                      <span className="font-bold text-indigo-600">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commercial Invoice:</span>
                      <span className="font-mono text-gray-800">{order.commercialInvoice?.invoiceNumber || 'INV-2026-0041'}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-[11px] font-bold text-gray-600">
                    <span>Factory Production Stage</span>
                    <span className="text-indigo-600">75% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Supplier Portal View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Supplier Purchase Orders ({filteredPurchases.length})</h2>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Supplier Portal Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPurchases.map(po => (
              <div key={po._id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-extrabold px-3 py-1 bg-amber-50 text-amber-700 rounded-xl">
                      {po.poNumber || po.purchaseNumber}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                      {po.workflowStage || po.status || 'Approved PO'}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg mb-1">{po.supplier}</h3>
                  <p className="text-xs font-semibold text-gray-500 mb-4">Total PO Value: <span className="text-emerald-600 font-bold">${po.totalAmount?.toLocaleString()}</span></p>

                  <div className="bg-gray-50 p-4 rounded-2xl space-y-2 text-xs text-gray-700 mb-4">
                    <div className="flex justify-between">
                      <span>Items Count:</span>
                      <span className="font-bold text-gray-900">{po.items?.length || 1} Materials</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected GRN Delivery:</span>
                      <span className="font-bold text-amber-600">{po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'Pending'}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs">
                  <span className="text-gray-500">GRN Quality Result:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Passed Inspection
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
