import { useState } from 'react';
import api from '../utils/api';
import { Camera, QrCode, ScanLine, CheckCircle2, Search, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export default function MobileScanner() {
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedType, setScannedType] = useState('Bundle Barcode Tag');

  const simulateScan = async (codeToUse) => {
    const code = codeToUse || scannedCode || 'BUN-2026-0042';
    setScanning(true);
    setScanResult(null);

    try {
      // Query digital thread API
      const res = await api.get(`/traceability/${code}`);
      setScanResult({
        code,
        timestamp: new Date().toLocaleTimeString(),
        type: scannedType,
        details: res.data.threadGenealogy
      });
    } catch (err) {
      alert('Error fetching scan data');
    } finally {
      setScanning(false);
    }
  };

  const sampleCodes = [
    { label: 'Garment Bundle Tag', code: 'BUN-2026-0001', type: 'Bundle Barcode Tag' },
    { label: 'Raw Fabric Roll', code: 'ROLL-102', type: 'Fabric Roll Barcode' },
    { label: 'Sales Order Tag', code: 'SO-2026-0001', type: 'Sales Order Tag' },
    { label: 'Sewing Machine QR', code: 'MCH-SEW-04', type: 'Machine QR Code' },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-6 rounded-3xl shadow-xl text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 mb-2 border border-indigo-400/20">
          <QrCode size={12} /> Factory Mobile PWA Scanner
        </span>
        <h1 className="text-2xl font-extrabold flex items-center justify-center gap-2">
          <Camera className="text-amber-400" size={28} /> Barcode & QR Floor Scanner
        </h1>
        <p className="text-xs text-indigo-200 mt-1">
          Scan garment bundle tags, fabric rolls, lot numbers, or machine QR codes on the factory floor.
        </p>
      </div>

      {/* Camera Viewfinder Mock */}
      <div className="bg-slate-950 rounded-3xl p-8 border-4 border-slate-900 shadow-2xl relative flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
        {/* Animated Scanning Line */}
        <div className="absolute inset-x-8 top-12 bottom-12 border-2 border-indigo-500/40 rounded-2xl flex items-center justify-center">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#fbbf24] animate-pulse" />
        </div>

        <ScanLine className="text-indigo-400/60 mb-3 animate-bounce" size={48} />
        <p className="text-xs font-bold text-slate-300 z-10">Point Camera at Barcode or QR Code</p>

        {/* Quick Sample Buttons */}
        <div className="z-10 mt-6 flex flex-wrap justify-center gap-2">
          {sampleCodes.map(sample => (
            <button key={sample.code} onClick={() => { setScannedCode(sample.code); setScannedType(sample.type); simulateScan(sample.code); }} className="bg-slate-900/90 hover:bg-indigo-600 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold border border-slate-800 transition-all flex items-center gap-1 shadow-sm">
              <Zap size={12} className="text-amber-400" /> {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Code Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-2">
        <QrCode className="text-gray-400" size={20} />
        <input 
          type="text" 
          value={scannedCode} 
          onChange={e => setScannedCode(e.target.value)} 
          placeholder="Or type Barcode / QR ID (e.g. BUN-2026-0001)..." 
          className="w-full text-xs outline-none text-gray-800"
        />
        <button onClick={() => simulateScan()} disabled={scanning} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shrink-0 flex items-center gap-1">
          {scanning ? <RefreshCw size={14} className="animate-spin" /> : 'Scan Code'}
        </button>
      </div>

      {/* Scan Results Card */}
      {scanResult && (
        <div className="bg-white rounded-3xl border border-emerald-300 p-6 shadow-lg space-y-4 animate-fade-in">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={20} />
              <h3 className="font-bold text-gray-900 text-sm">Scan Verification Success</h3>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
              {scanResult.timestamp}
            </span>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400">Scanned Tag Code</p>
            <p className="text-lg font-mono font-bold text-amber-400">{scanResult.code}</p>
            <p className="text-xs text-slate-300">Type: {scanResult.type}</p>
          </div>

          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex justify-between p-2 bg-gray-50 rounded-xl">
              <span className="font-semibold">Matching Sales Orders:</span>
              <span className="font-bold text-gray-900">{scanResult.details?.salesOrders?.length || 0} Records</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-xl">
              <span className="font-semibold">Matching Production Orders:</span>
              <span className="font-bold text-gray-900">{scanResult.details?.productionOrders?.length || 0} Records</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-xl">
              <span className="font-semibold">Matching Garment Bundles:</span>
              <span className="font-bold text-gray-900">{scanResult.details?.bundles?.length || 0} Records</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
