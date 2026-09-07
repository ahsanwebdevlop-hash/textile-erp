import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Production from './pages/Production';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
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
import VerifyEmail from './pages/VerifyEmail';

function RoleRoute({ roles, children }) {
  const { user } = useApp();
  if (!roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

function Layout() {
  const { isAuthenticated, loading } = useApp();
  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/employee-dashboard" element={<Dashboard />} />
            <Route path="/customer-dashboard" element={<Dashboard />} />
            <Route path="/tech-pack-bom" element={<RoleRoute roles={['admin', 'manager']}><TechPackBOM /></RoleRoute>} />
            <Route path="/batch-tracking" element={<RoleRoute roles={['admin', 'manager']}><BatchTracking /></RoleRoute>} />
            <Route path="/quality-control" element={<RoleRoute roles={['admin', 'manager']}><QualityControl /></RoleRoute>} />
            <Route path="/garment-costing" element={<RoleRoute roles={['admin', 'manager']}><GarmentCosting /></RoleRoute>} />
            <Route path="/sustainability-compliance" element={<RoleRoute roles={['admin', 'manager']}><SustainabilityCompliance /></RoleRoute>} />
            <Route path="/inventory" element={<RoleRoute roles={['admin', 'manager']}><Inventory /></RoleRoute>} />
            <Route path="/production" element={<RoleRoute roles={['admin', 'manager']}><Production /></RoleRoute>} />
            <Route path="/employees" element={<RoleRoute roles={['admin', 'manager']}><Employees /></RoleRoute>} />
            <Route path="/departments" element={<RoleRoute roles={['admin']}><Departments /></RoleRoute>} />
            <Route path="/reports" element={<RoleRoute roles={['admin', 'manager']}><Reports /></RoleRoute>} />
            <Route path="/suppliers" element={<RoleRoute roles={['admin', 'manager']}><Suppliers /></RoleRoute>} />
            <Route path="/purchases" element={<RoleRoute roles={['admin', 'manager']}><Purchases /></RoleRoute>} />
            <Route path="/sales-orders" element={<RoleRoute roles={['admin', 'manager']}><SalesOrders /></RoleRoute>} />
            <Route path="/accounts" element={<RoleRoute roles={['admin', 'manager']}><Accounts /></RoleRoute>} />
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
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/admin-dashboard" element={<Layout />} />
      <Route path="/employee-dashboard" element={<Layout />} />
      <Route path="/customer-dashboard" element={<Layout />} />
      <Route path="/*" element={<Layout />} />
    </Routes>
  );
}

export default App;