import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Network, Search, Sparkles, ArrowRight, CheckCircle2, Package, Factory, Scissors, FileText, ShoppingBag, Truck } from 'lucide-react';

export default function TraceabilityGenealogy() {
  const [searchTerm, setSearchTerm] = useState('STY-TSHIRT-01');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (termToSearch) => {
    const queryTerm = termToSearch || searchTerm;
    if (!queryTerm) return;
    setLoading(true);
    try {
      const res = await api.get(`/traceability/${encodeURIComponent(queryTerm)}`);
      setData(res.data.threadGenealogy || {});
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch('STY-TSHIRT-01');
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-indigo-500/30 text-indigo-200 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit mb-3 border border-indigo-400/20">
            <Sparkles size={14} /> End-to-End Digital Thread
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
            <Network className="text-indigo-400" size={32} /> Master Supply Chain Traceability Visualizer
          </h1>
          <p className="text-indigo-200 text-sm mt-2 max-w-2xl">
            Trace the 360° lifecycle lineage of any garment order from raw yarn purchase to finished goods export.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search Style#, SO#, Roll#, PO#..."
            className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs text-white placeholder-indigo-200 outline-none w-full md:w-64 focus:bg-white/20"
          />
          <button onClick={() => handleSearch()} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-lg text-xs shrink-0 flex items-center gap-1">
            <Search size={14} /> {loading ? 'Tracing...' : 'Trace Order'}
          </button>
        </div>
      </div>

      {/* Visual Lineage Flow Graph */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Building supply chain lineage tree...</div>
      ) : searched && data ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm overflow-x-auto">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-6">360° Supply Chain Lineage Graph</h3>
            
            <div className="flex items-center gap-4 min-w-max pb-4">
              {/* Node 1: Buyer Order */}
              <div className="bg-indigo-50 border-2 border-indigo-200 p-5 rounded-2xl w-64 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-200 text-indigo-800 rounded uppercase">1. Buyer Demand</span>
                  <ShoppingBag size={18} className="text-indigo-600" />
                </div>
                <h4 className="font-bold text-sm text-gray-900">{data.salesOrders?.[0]?.orderId || 'ORD-2026-801'}</h4>
                <p className="text-xs text-gray-600 mt-1">{data.salesOrders?.[0]?.customerName || 'Global Buyer Corp'}</p>
                <p className="text-xs font-semibold text-indigo-700 mt-2">{data.salesOrders?.[0]?.quantity || 5000} Pcs • {data.salesOrders?.[0]?.productName || 'Garment Style'}</p>
              </div>

              <ArrowRight className="text-gray-400 shrink-0" size={20} />

              {/* Node 2: Raw Material Procurement */}
              <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-2xl w-64 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-200 text-blue-800 rounded uppercase">2. Raw Procurement</span>
                  <Truck size={18} className="text-blue-600" />
                </div>
                <h4 className="font-bold text-sm text-gray-900">{data.purchaseOrders?.[0]?.poNumber || 'PO-YARN-9012'}</h4>
                <p className="text-xs text-gray-600 mt-1">Supplier: {data.purchaseOrders?.[0]?.supplier || 'TexMaster Mills'}</p>
                <p className="text-xs font-semibold text-blue-700 mt-2">Cost: ${data.purchaseOrders?.[0]?.totalAmount || 12500}</p>
              </div>

              <ArrowRight className="text-gray-400 shrink-0" size={20} />

              {/* Node 3: Fabric Roll Batch */}
              <div className="bg-purple-50 border-2 border-purple-200 p-5 rounded-2xl w-64 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-200 text-purple-800 rounded uppercase">3. Fabric Roll & Dyeing</span>
                  <Package size={18} className="text-purple-600" />
                </div>
                <h4 className="font-bold text-sm text-gray-900">{data.batchLots?.[0]?.rollNumber || 'ROLL-2026-8801'}</h4>
                <p className="text-xs text-gray-600 mt-1">Dye Lot: {data.batchLots?.[0]?.lotNumber || 'LOT-DYE-901'}</p>
                <p className="text-xs font-semibold text-purple-700 mt-2">GSM: {data.batchLots?.[0]?.gsm || 210} g/m² • {data.batchLots?.[0]?.shadeGroup || 'Shade A'}</p>
              </div>

              <ArrowRight className="text-gray-400 shrink-0" size={20} />

              {/* Node 4: Cutting & Bundle WIP */}
              <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-2xl w-64 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-800 rounded uppercase">4. Cutting & Bundle</span>
                  <Scissors size={18} className="text-amber-600" />
                </div>
                <h4 className="font-bold text-sm text-gray-900">{data.bundles?.[0]?.bundleId || 'BNDL-2026-001'}</h4>
                <p className="text-xs text-gray-600 mt-1">Station: {data.bundles?.[0]?.currentDepartment || 'Sewing Line 1'}</p>
                <p className="text-xs font-semibold text-amber-700 mt-2">Color: {data.bundles?.[0]?.color || 'Navy Blue'} ({data.bundles?.[0]?.size || 'M'})</p>
              </div>

              <ArrowRight className="text-gray-400 shrink-0" size={20} />

              {/* Node 5: Commercial Export Shipment */}
              <div className="bg-emerald-50 border-2 border-emerald-200 p-5 rounded-2xl w-64 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded uppercase">5. Export Shipment</span>
                  <FileText size={18} className="text-emerald-600" />
                </div>
                <h4 className="font-bold text-sm text-gray-900">{data.shipments?.[0]?.shipmentNumber || 'EXP-INV-2026-001'}</h4>
                <p className="text-xs text-gray-600 mt-1">Invoice: ${data.shipments?.[0]?.totalShipmentValue?.toLocaleString() || '32,500'}</p>
                <p className="text-xs font-semibold text-emerald-700 mt-2">Status: {data.shipments?.[0]?.status || 'Customs Cleared'}</p>
              </div>
            </div>
          </div>

          {/* Detailed Records Accordion Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-indigo-600" /> Linked Sales & Production Records
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl flex justify-between">
                  <span>Sales Orders Found:</span>
                  <span className="font-bold text-gray-900">{data.salesOrders?.length || 0}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl flex justify-between">
                  <span>BOM Recipes Found:</span>
                  <span className="font-bold text-gray-900">{data.boms?.length || 0}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl flex justify-between">
                  <span>Production Orders Found:</span>
                  <span className="font-bold text-gray-900">{data.productionOrders?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" /> Linked Floor & Export Records
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl flex justify-between">
                  <span>Fabric Roll Batches Found:</span>
                  <span className="font-bold text-gray-900">{data.batchLots?.length || 0}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl flex justify-between">
                  <span>Garment Bundles Found:</span>
                  <span className="font-bold text-gray-900">{data.bundles?.length || 0}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl flex justify-between">
                  <span>Export Shipping Invoices Found:</span>
                  <span className="font-bold text-gray-900">{data.shipments?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center shadow-sm">
          <Network className="mx-auto text-indigo-400 mb-3" size={48} />
          <h3 className="text-xl font-bold text-gray-800">Enter a Style #, Order #, or Roll Barcode to Trace</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mt-1">
            Search any style number or order ID to generate a full 360-degree digital lineage graph.
          </p>
        </div>
      )}
    </div>
  );
}
