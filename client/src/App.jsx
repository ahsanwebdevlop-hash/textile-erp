import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Production from './pages/Production';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import SalesOrders from './pages/SalesOrders';
import Accounts from './pages/Accounts';

import TechPackBOM from './pages/TechPackBOM';
import BatchTracking from './pages/BatchTracking';
import QualityControl from './pages/QualityControl';
import GarmentCosting from './pages/GarmentCosting';
import SustainabilityCompliance from './pages/SustainabilityCompliance';
import Automations from './pages/Automations';
import Portals from './pages/Portals';
import MobileScanner from './pages/MobileScanner';
import AiAssistant from './pages/AiAssistant';
import FactoryMap from './pages/FactoryMap';

import MRP from './pages/MRP';
import LabDipShadeBank from './pages/LabDipShadeBank';
import SampleRoomTechPack from './pages/SampleRoomTechPack';
import CapacityPlanningGantt from './pages/CapacityPlanningGantt';
import FabricQC4PointPage from './pages/FabricQC4PointPage';
import CutPlanning from './pages/CutPlanning';
import Subcontracting from './pages/Subcontracting';
import BundleWIPPayroll from './pages/BundleWIPPayroll';
import ExportDocumentation from './pages/ExportDocumentation';
import VendorEvaluation from './pages/VendorEvaluation';
import WarehouseBins from './pages/WarehouseBins';
import FinancialLedgerPnl from './pages/FinancialLedgerPnl';
import TraceabilityGenealogy from './pages/TraceabilityGenealogy';

function Layout() {
  const { isAuthenticated, loading } = useApp();
  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500 font-medium">Loading TextileFlow ERP...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/automations" element={<Automations />} />
            <Route path="/factory-map" element={<FactoryMap />} />
            <Route path="/ai-assistant" element={<AiAssistant />} />
            <Route path="/portals" element={<Portals />} />
            <Route path="/scanner" element={<MobileScanner />} />
            <Route path="/tech-pack-bom" element={<TechPackBOM />} />
            <Route path="/batch-tracking" element={<BatchTracking />} />
            <Route path="/quality-control" element={<QualityControl />} />
            <Route path="/garment-costing" element={<GarmentCosting />} />
            <Route path="/sustainability-compliance" element={<SustainabilityCompliance />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/production" element={<Production />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/sales-orders" element={<SalesOrders />} />
            <Route path="/accounts" element={<Accounts />} />

            {/* Enterprise Module Routes */}
            <Route path="/traceability" element={<TraceabilityGenealogy />} />
            <Route path="/mrp-calculator" element={<MRP />} />
            <Route path="/lab-dip-shades" element={<LabDipShadeBank />} />
            <Route path="/tech-pack-specs" element={<SampleRoomTechPack />} />
            <Route path="/capacity-planning" element={<CapacityPlanningGantt />} />
            <Route path="/fabric-qc-4point" element={<FabricQC4PointPage />} />
            <Route path="/cut-planning" element={<CutPlanning />} />
            <Route path="/subcontracting" element={<Subcontracting />} />
            <Route path="/bundle-wip" element={<BundleWIPPayroll />} />
            <Route path="/export-docs" element={<ExportDocumentation />} />
            <Route path="/vendor-ratings" element={<VendorEvaluation />} />
            <Route path="/warehouse-bins" element={<WarehouseBins />} />
            <Route path="/financial-ledger" element={<FinancialLedgerPnl />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<Layout />} />
    </Routes>
  );
}

export default App;