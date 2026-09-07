import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Zap, CheckSquare, Square, Save, Sparkles, Filter, RefreshCw, 
  MessageSquare, ShoppingBag, DollarSign, Truck, Radio, Mail, 
  Key, Settings, ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, X
} from 'lucide-react';

const MARKET_AUTOMATIONS_CATALOG = [
  {
    key: 'WHATSAPP_BUSINESS_API',
    title: 'WhatsApp Order & Delivery Notifications',
    provider: 'Meta WhatsApp Cloud API',
    category: 'Messaging & WhatsApp',
    icon: MessageSquare,
    color: 'emerald',
    description: 'Send automated WhatsApp notifications to buyers when Sales Orders reach Confirmed, In Sewing, QC Passed, or Shipped status.',
    credentialFields: [
      { name: 'phoneId', label: 'WhatsApp Phone Number ID', type: 'text', placeholder: '109823472918234' },
      { name: 'apiKey', label: 'Meta Access Token / API Key', type: 'password', placeholder: 'EAAG...' },
      { name: 'templateName', label: 'Approved Template Name', type: 'text', placeholder: 'order_status_update' }
    ]
  },
  {
    key: 'SHOPIFY_B2B_SYNC',
    title: 'Shopify B2B & E-Commerce Order Sync',
    provider: 'Shopify Admin API',
    category: 'E-Commerce & B2B',
    icon: ShoppingBag,
    color: 'green',
    description: 'Automatically pull B2B orders from Shopify into TextileFlow Sales Orders and sync finished goods inventory in real time.',
    credentialFields: [
      { name: 'storeUrl', label: 'Shopify Store URL', type: 'text', placeholder: 'my-textile-brand.myshopify.com' },
      { name: 'accessToken', label: 'Admin API Access Token', type: 'password', placeholder: 'shpat_...' },
      { name: 'webhookSecret', label: 'Webhook Secret Key', type: 'password', placeholder: 'whsec_...' }
    ]
  },
  {
    key: 'QUICKBOOKS_ACCOUNTING_SYNC',
    title: 'QuickBooks Online Financial Sync',
    provider: 'Intuit QuickBooks API',
    category: 'Finance & Accounting',
    icon: DollarSign,
    color: 'blue',
    description: 'Sync TextileFlow Invoices, Payments, Accounts Payable, and Accounts Receivable with QuickBooks automatically.',
    credentialFields: [
      { name: 'realmId', label: 'QuickBooks Company ID (Realm ID)', type: 'text', placeholder: '46208149204912' },
      { name: 'clientId', label: 'OAuth Client ID', type: 'text', placeholder: 'AB12345...' },
      { name: 'clientSecret', label: 'OAuth Client Secret', type: 'password', placeholder: 'secret_...' }
    ]
  },
  {
    key: 'DHL_FEDEX_SHIPPING_TRACKING',
    title: 'DHL / FedEx Live Shipment & Tracking',
    provider: 'DHL Express & FedEx API',
    category: 'Logistics & Shipping',
    icon: Truck,
    color: 'amber',
    description: 'Auto-create shipment manifests, generate commercial shipping labels, and track container/courier ETA automatically.',
    credentialFields: [
      { name: 'carrier', label: 'Primary Carrier', type: 'select', options: ['DHL Express', 'FedEx International', 'UPS Freight'] },
      { name: 'accountNumber', label: 'Carrier Account Number', type: 'text', placeholder: '962041920' },
      { name: 'apiKey', label: 'Developer API Key', type: 'password', placeholder: 'key_...' }
    ]
  },
  {
    key: 'EMAIL_SMTP_REPORTS_DIGEST',
    title: 'Automated Daily Executive Email Digest',
    provider: 'SMTP / SendGrid Email',
    category: 'Messaging & WhatsApp',
    icon: Mail,
    color: 'indigo',
    description: 'Send automated PDF/Excel summaries every evening highlighting today\'s total production, line efficiency %, and pending POs.',
    credentialFields: [
      { name: 'smtpHost', label: 'SMTP Server Host', type: 'text', placeholder: 'smtp.sendgrid.net' },
      { name: 'smtpPort', label: 'SMTP Port', type: 'text', placeholder: '587' },
      { name: 'smtpUser', label: 'Sender Email Address', type: 'text', placeholder: 'reports@textileflow.com' },
      { name: 'smtpPass', label: 'SMTP Password / API Key', type: 'password', placeholder: '••••••••' }
    ]
  },
  {
    key: 'CUSTOM_REST_WEBHOOKS',
    title: 'Custom REST Webhook & Factory IoT',
    provider: 'TextileFlow Webhooks',
    category: 'Factory & IoT',
    icon: Radio,
    color: 'purple',
    description: 'Trigger external REST webhooks when critical events occur (e.g., Material Shortage, Machine Breakdown, Quality Hold).',
    credentialFields: [
      { name: 'webhookUrl', label: 'Webhook Endpoint URL', type: 'text', placeholder: 'https://api.yourfactory.com/webhooks/erp' },
      { name: 'secretToken', label: 'HMAC Signature Secret', type: 'password', placeholder: 'whsec_token_...' },
      { name: 'events', label: 'Subscribed Events', type: 'text', placeholder: 'ORDER_CONFIRMED, QUALITY_HOLD, LOW_STOCK' }
    ]
  }
];

export default function Automations() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusMessage, setStatusMessage] = useState('');
  const [activeSetupModal, setActiveSetupModal] = useState(null);
  const [credentialsForm, setCredentialsForm] = useState({});

  const fetchAutomations = async () => {
    try {
      const res = await api.get('/automations');
      setAutomations(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleToggleSelect = (key) => {
    setAutomations(prev => prev.map(item => {
      if (item.automationKey === key) {
        return { ...item, enabled: !item.enabled };
      }
      return item;
    }));
  };

  const openSetupModal = (catalogItem) => {
    const existing = automations.find(a => a.automationKey === catalogItem.key);
    setActiveSetupModal(catalogItem);
    setCredentialsForm(existing?.config || {});
  };

  const handleSaveModalCredentials = async (e) => {
    e.preventDefault();
    if (!activeSetupModal) return;

    const key = activeSetupModal.key;
    setAutomations(prev => prev.map(item => {
      if (item.automationKey === key) {
        return { ...item, enabled: true, config: credentialsForm };
      }
      return item;
    }));

    setActiveSetupModal(null);
    setStatusMessage(`Credentials saved for ${activeSetupModal.title}`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setStatusMessage('');
    try {
      const selections = automations.map(a => ({ 
        automationKey: a.automationKey, 
        enabled: a.enabled,
        config: a.config 
      }));
      await api.post('/automations/toggle-multiple', { selections });
      setStatusMessage('All selected automations & credentials saved successfully to database!');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving automations');
    } finally {
      setSaving(false);
    }
  };

  const categories = ['All', 'Messaging & WhatsApp', 'E-Commerce & B2B', 'Finance & Accounting', 'Logistics & Shipping', 'Factory & IoT'];

  const filteredCatalog = selectedCategory === 'All' 
    ? MARKET_AUTOMATIONS_CATALOG 
    : MARKET_AUTOMATIONS_CATALOG.filter(a => a.category === selectedCategory);

  const selectedCount = automations.filter(a => a.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-indigo-500/30 text-indigo-200 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit mb-3 border border-indigo-400/20">
            <Sparkles size={14} /> Market Integration & Automation Hub
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
            <Zap className="text-amber-400 fill-amber-400/20" size={32} /> ERP Automations & Integration Setup
          </h1>
          <p className="text-indigo-200 text-sm mt-2 max-w-2xl">
            Select the market automations you want for your factory, provide your API credentials, and our system will run them seamlessly.
          </p>
        </div>

        <button onClick={handleSaveAll} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 shrink-0">
          <Save size={18} /> {saving ? 'Saving Setup...' : `Save Active Rules (${selectedCount})`}
        </button>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-2xl text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <span className="flex items-center gap-2"><CheckCircle2 className="text-emerald-600" size={18} /> {statusMessage}</span>
          <span className="text-xs bg-emerald-100 px-2.5 py-1 rounded-lg">Active Rules: {selectedCount} Selected</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-2">
            <Filter size={14} /> Category:
          </span>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Automations Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCatalog.map(item => {
          const Icon = item.icon;
          const userAutoState = automations.find(a => a.automationKey === item.key);
          const isEnabled = userAutoState?.enabled || false;
          const hasConfig = userAutoState?.config && Object.keys(userAutoState.config).length > 0;

          return (
            <div key={item.key} className={`bg-white rounded-3xl border transition-all p-6 flex flex-col justify-between shadow-sm hover:shadow-md ${isEnabled ? 'border-indigo-400 ring-2 ring-indigo-500/20' : 'border-gray-200'}`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${item.color}-50 text-${item.color}-600 border border-${item.color}-100`}>
                    <Icon size={24} />
                  </div>
                  <button onClick={() => handleToggleSelect(item.key)} className="flex items-center gap-1.5 text-xs font-bold">
                    {isEnabled ? (
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckSquare size={14} /> Selected
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-gray-200">
                        <Square size={14} /> Select
                      </span>
                    )}
                  </button>
                </div>

                <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full uppercase tracking-wider">
                  {item.provider}
                </span>
                <h3 className="font-bold text-gray-900 text-lg mt-2 mb-2 leading-snug">{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  {hasConfig ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-amber-500" />}
                  {hasConfig ? 'Credentials Added' : 'Setup Required'}
                </span>

                <button onClick={() => openSetupModal(item)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1">
                  <Key size={14} /> Setup & Credentials
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Setup Credentials Modal */}
      {activeSetupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl my-auto animate-scale-up">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{activeSetupModal.title}</h3>
                  <p className="text-xs text-gray-500">Provide integration credentials & settings</p>
                </div>
              </div>
              <button onClick={() => setActiveSetupModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModalCredentials} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-2xl text-xs flex items-start gap-2">
                <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>Credentials are encrypted and saved securely for your company's automated background tasks.</span>
              </div>

              {activeSetupModal.credentialFields.map((field, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{field.label}</label>
                  {field.type === 'select' ? (
                    <select value={credentialsForm[field.name] || ''} onChange={e => setCredentialsForm({ ...credentialsForm, [field.name]: e.target.value })} className="input-field text-xs">
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} required value={credentialsForm[field.name] || ''} onChange={e => setCredentialsForm({ ...credentialsForm, [field.name]: e.target.value })} className="input-field text-xs" placeholder={field.placeholder} />
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setActiveSetupModal(null)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs flex items-center gap-1.5">
                  <Save size={14} /> Save Credentials & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
