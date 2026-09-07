import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Package, Factory, Users, FileText,
  Truck, ShoppingCart, ShoppingBag, Wallet, Zap, Bot,
  Camera, Building2, Activity, LogOut, Menu, X, Factory as FactoryIcon,
  FileCode, PackageCheck, ShieldCheck, Calculator, Award, Cpu, Palette,
  Ruler, Calendar, Scissors, ExternalLink, QrCode, Star, Warehouse, DollarSign, Network, Layers, Sparkles
} from 'lucide-react';

const basicNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
  { path: '/sales-orders', label: 'Sales Orders', icon: ShoppingBag, roles: ['admin', 'manager'] },
  { path: '/production', label: 'Mill Production', icon: Factory, roles: ['admin', 'manager'] },
  { path: '/inventory', label: 'Material Inventory', icon: Package, roles: ['admin', 'manager'] },
  { path: '/purchases', label: 'Purchases & POs', icon: ShoppingCart, roles: ['admin', 'manager'] },
  { path: '/quality-control', label: 'Garment QC Audit', icon: ShieldCheck, roles: ['admin', 'manager'] },
  { path: '/accounts', label: 'Accounts & Finance', icon: Wallet, roles: ['admin', 'manager'] },
  { path: '/reports', label: 'Reports & Summaries', icon: FileText, roles: ['admin', 'manager'] },
];

const advancedNavGroups = [
  {
    title: 'Core & Executive AI',
    items: [
      { path: '/traceability', label: 'Traceability Lineage Graph', icon: Network, roles: ['admin', 'manager'] },
      { path: '/factory-map', label: 'Digital Factory Floor Map', icon: Activity, roles: ['admin', 'manager'] },
      { path: '/ai-assistant', label: 'AI Copilot Assistant', icon: Bot, roles: ['admin', 'manager'] },
      { path: '/financial-ledger', label: 'Financial Ledger & P&L', icon: DollarSign, roles: ['admin', 'manager'] },
    ]
  },
  {
    title: 'Design, Tech Pack & Sampling',
    items: [
      { path: '/tech-pack-bom', label: 'Tech Pack (BOM Recipe)', icon: FileCode, roles: ['admin', 'manager'] },
      { path: '/tech-pack-specs', label: 'Size Spec & Sampling', icon: Ruler, roles: ['admin', 'manager'] },
      { path: '/lab-dip-shades', label: 'Lab Dip & Shade Bank', icon: Palette, roles: ['admin', 'manager'] },
      { path: '/garment-costing', label: 'FOB Costing Sheet', icon: Calculator, roles: ['admin', 'manager'] },
    ]
  },
  {
    title: 'Planning & MRP',
    items: [
      { path: '/mrp-calculator', label: 'MRP Material Calculator', icon: Cpu, roles: ['admin', 'manager'] },
      { path: '/capacity-planning', label: 'Sewing Line Capacity', icon: Calendar, roles: ['admin', 'manager'] },
      { path: '/vendor-ratings', label: 'Vendor Scorecards', icon: Star, roles: ['admin', 'manager'] },
    ]
  },
  {
    title: 'Floor Operations & QC',
    items: [
      { path: '/cut-planning', label: 'Cut Planning & Marker', icon: Scissors, roles: ['admin', 'manager'] },
      { path: '/subcontracting', label: 'Outsource Subcontracts', icon: ExternalLink, roles: ['admin', 'manager'] },
      { path: '/bundle-wip', label: 'Bundle WIP & Barcodes', icon: QrCode, roles: ['admin', 'manager'] },
      { path: '/fabric-qc-4point', label: '4-Point Fabric QC', icon: ShieldCheck, roles: ['admin', 'manager'] },
      { path: '/batch-tracking', label: 'Roll & Lot Batches', icon: PackageCheck, roles: ['admin', 'manager'] },
    ]
  },
  {
    title: 'WMS, Export & Settings',
    items: [
      { path: '/warehouse-bins', label: 'WMS Rack & Bin Storage', icon: Warehouse, roles: ['admin', 'manager'] },
      { path: '/export-docs', label: 'Commercial Export Docs', icon: FileText, roles: ['admin', 'manager'] },
      { path: '/suppliers', label: 'Supplier Directory', icon: Truck, roles: ['admin', 'manager'] },
      { path: '/employees', label: 'Employee Roster', icon: Users, roles: ['admin', 'manager'] },
      { path: '/automations', label: 'Automations Hub', icon: Zap, roles: ['admin', 'manager'] },
      { path: '/sustainability-compliance', label: 'Compliance & Audits', icon: Award, roles: ['admin', 'manager'] },
      { path: '/portals', label: 'Buyer & Supplier Portals', icon: Building2, roles: ['admin', 'manager'] },
      { path: '/scanner', label: 'Mobile PWA Scanner', icon: Camera, roles: ['admin', 'manager', 'employee'] },
    ]
  }
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'advanced' | 'all'
  const { logout, user, hasRole } = useApp();
  const location = useLocation();

  return (
    <>
      <button onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-textile-600 text-white rounded-lg shadow-lg">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow text-white">
              <FactoryIcon size={22} />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-gray-900 leading-tight">TextileFlow ERP</h1>
              <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">v3.0 Enterprise</p>
            </div>
          </div>

          {/* Basic / Advanced View Mode Switcher */}
          <div className="mt-4 p-1 bg-gray-100 rounded-xl flex items-center justify-between text-xs font-bold">
            <button 
              onClick={() => setActiveTab('basic')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${activeTab === 'basic' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Sparkles size={13} /> Basic
            </button>
            <button 
              onClick={() => setActiveTab('advanced')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${activeTab === 'advanced' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Layers size={13} /> Advanced
            </button>
            <button 
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${activeTab === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              All
            </button>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {/* BASIC MODE */}
          {(activeTab === 'basic' || activeTab === 'all') && (
            <div className="space-y-1">
              <h3 className="px-3 text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} /> Basic Essentials (Day-to-Day)
              </h3>
              {basicNavItems.filter(item => hasRole(item.roles)).map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}>
                    <Icon size={16} />
                    <span className="font-medium text-xs">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          )}

          {/* ADVANCED MODE */}
          {(activeTab === 'advanced' || activeTab === 'all') && (
            <div className="space-y-4 pt-2">
              <h3 className="px-3 text-[10px] font-extrabold text-purple-600 uppercase tracking-wider flex items-center gap-1">
                <Layers size={12} /> Advanced Power Modules
              </h3>
              {advancedNavGroups.map((group, gIdx) => {
                const filteredItems = group.items.filter(item => hasRole(item.roles));
                if (!filteredItems.length) return null;
                return (
                  <div key={gIdx} className="space-y-1">
                    <h4 className="px-3 text-[9px] font-bold text-gray-400 uppercase tracking-wider">{group.title}</h4>
                    {filteredItems.map(item => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                          className={`sidebar-link ${isActive ? 'active' : ''}`}>
                          <Icon size={16} />
                          <span className="font-medium text-xs">{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer User Card */}
        <div className="p-4 border-t border-gray-100">
          <div className="mb-3 px-3 py-2 bg-gray-50 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-500 capitalize">{user?.role || 'Employee'}</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 text-xs font-bold">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}