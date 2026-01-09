
import React, { useState, useCallback } from 'react';
import { Inquiry, AppConfig, Service, User, PortfolioItem, SliderItem } from '../types';
import { geminiService } from '../services/geminiService';

interface AdminPortalProps {
  inquiries: Inquiry[];
  config: AppConfig;
  currentUser: User;
  onUpdateStatus: (id: string, updates: Partial<Inquiry>) => void;
  onUpdateConfig: (newConfig: AppConfig | ((prev: AppConfig) => AppConfig)) => void;
  onRestoreSystem: (config: AppConfig, inquiries: Inquiry[]) => void;
  onLogout: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ inquiries, config, currentUser, onUpdateStatus, onUpdateConfig, onRestoreSystem, onLogout }) => {
  const isMaster = currentUser.role === 'MASTER';
  const [activeTab, setActiveTab] = useState<'inquiries' | 'branding' | 'services' | 'users' | 'portfolio' | 'slider' | 'system'>('inquiries');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // User creation states
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  // Portfolio creation states
  const [newPortfolioTitle, setNewPortfolioTitle] = useState('');
  const [newPortfolioCategory, setNewPortfolioCategory] = useState('');
  const [newPortfolioImage, setNewPortfolioImage] = useState('');
  const [newPortfolioLink, setNewPortfolioLink] = useState('');
  const [newPortfolioAppName, setNewPortfolioAppName] = useState('');

  // Service creation states
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(0);
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Slider creation states
  const [newSliderText, setNewSliderText] = useState('');
  const [newSliderImage, setNewSliderImage] = useState('');

  const handleProcessWork = async (inquiry: Inquiry) => {
    setProcessingId(inquiry.id);
    const service = config.services.find(s => s.id === inquiry.serviceId);
    
    try {
      const solution = await geminiService.solveInquiry(inquiry.description, service?.name || "Service");
      onUpdateStatus(inquiry.id, { status: 'In Progress', solutionText: solution });
      alert("AI Analysis complete. Solution strategy saved.");
    } catch (error: any) {
      console.error("Error processing work:", error);
      alert("An error occurred during AI analysis.");
    } finally {
      setProcessingId(null);
    }
  };

  const commitChanges = useCallback(() => {
    setIsSaving(true);
    // Explicitly re-save everything in memory
    onUpdateConfig(prev => ({ ...prev }));
    setTimeout(() => {
      setIsSaving(false);
      alert("All system changes committed and persisted successfully.");
    }, 800);
  }, [onUpdateConfig]);

  const updateBranding = (field: keyof AppConfig, value: string) => {
    if (!isMaster) return;
    onUpdateConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMaster) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateConfig(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateService = (id: string, field: keyof Service, value: any) => {
    if (!isMaster) return;
    onUpdateConfig(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaster) return;
    const newService: Service = {
      id: 'svc-' + Math.random().toString(36).substr(2, 9),
      name: newServiceName,
      category: newServiceCategory || 'General',
      price: newServicePrice,
      description: newServiceDesc
    };
    onUpdateConfig(prev => ({ ...prev, services: [...prev.services, newService] }));
    setNewServiceName('');
    setNewServiceCategory('');
    setNewServicePrice(0);
    setNewServiceDesc('');
  };

  const handleRemoveService = (id: string) => {
    if (!isMaster) return;
    if (confirm("Are you sure you want to remove this service?")) {
      onUpdateConfig(prev => ({ ...prev, services: prev.services.filter(s => s.id !== id) }));
    }
  };

  // Portfolio
  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPortfolioImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioImage || !newPortfolioTitle) {
      alert("Title and Image are required");
      return;
    }
    const newItem: PortfolioItem = {
      id: 'p-' + Math.random().toString(36).substr(2, 9),
      title: newPortfolioTitle,
      category: newPortfolioCategory || 'Work',
      image: newPortfolioImage,
      link: newPortfolioLink,
      appName: newPortfolioAppName
    };
    onUpdateConfig(prev => ({ ...prev, portfolio: [...prev.portfolio, newItem] }));
    setNewPortfolioTitle('');
    setNewPortfolioCategory('');
    setNewPortfolioImage('');
    setNewPortfolioLink('');
    setNewPortfolioAppName('');
    alert("New work sample added to previous work section!");
  };

  const handleRemovePortfolio = (id: string) => {
    if (confirm("Delete this previous work item?")) {
      onUpdateConfig(prev => ({ ...prev, portfolio: prev.portfolio.filter(p => p.id !== id) }));
    }
  };

  // Slider
  const handleSliderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSliderImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSlider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSliderImage || !newSliderText) {
      alert("Text and Image are required for the slide.");
      return;
    }
    const newItem: SliderItem = {
      id: 'slide-' + Math.random().toString(36).substr(2, 9),
      text: newSliderText,
      image: newSliderImage
    };
    onUpdateConfig(prev => ({ ...prev, sliderItems: [...(prev.sliderItems || []), newItem] }));
    setNewSliderText('');
    setNewSliderImage('');
    alert("Home slide added successfully!");
  };

  const handleRemoveSlider = (id: string) => {
    if (confirm("Remove this home slide?")) {
      onUpdateConfig(prev => ({ ...prev, sliderItems: prev.sliderItems.filter(s => s.id !== id) }));
    }
  };

  // Users
  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserUsername || !newUserPassword) return;
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUserName,
      username: newUserUsername,
      password: newUserPassword,
      role: 'ADMIN'
    };
    onUpdateConfig(prev => ({ ...prev, users: [...prev.users, newUser] }));
    setNewUserName('');
    setNewUserUsername('');
    setNewUserPassword('');
    alert('Admin account created successfully.');
  };

  const shareCredentials = (user: User) => {
    const message = `*ADMIN LOGIN CREDENTIALS*%0A%0A` +
      `*Name:* ${user.name}%0A` +
      `*Admin ID:* ${user.username}%0A` +
      `*Password:* ${user.password}%0A%0A` +
      `Please use these to login to the ${config.companyName || 'EGINTECH'} Admin Portal.`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const removeUser = (id: string) => {
    if (id === currentUser.id) {
      alert("You cannot remove yourself");
      return;
    }
    onUpdateConfig(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
  };

  const handleExportData = () => {
    const exportData = {
      config,
      inquiries,
      version: '1.0',
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.companyName.toLowerCase().replace(/\s/g, '_')}_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("This will overwrite all current settings and inquiries. Are you sure?")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.config && data.inquiries) {
          onRestoreSystem(data.config, data.inquiries);
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Error reading file. Please ensure it is a valid JSON backup.");
      }
    };
    reader.readAsText(file);
  };

  const sendToWhatsApp = (inquiry: Inquiry) => {
    const total = config.services.find(s => s.id === inquiry.serviceId)?.price || 0;
    const remaining = total - inquiry.paymentDone;
    const message = `*ADMIN UPDATE FROM ${config.companyName || 'EGINTECH'}*%0A%0A` +
      `*Status:* Work in Progress%0A` +
      `*Plan:* ${inquiry.solutionText}%0A%0A` +
      `Your project is being handled. Please clear the remaining ₹${remaining} for final delivery.`;
    window.open(`https://wa.me/${inquiry.phone}?text=${message}`, '_blank');
  };

  const inputClass = "w-full bg-gray-800 border-gray-700 text-yellow-400 placeholder-gray-500 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none transition-all";

  return (
    <div className="bg-white rounded-3xl shadow-xl min-h-[700px] flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Console</h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{currentUser.role} SESSION</span>
          </div>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <button onClick={() => setActiveTab('inquiries')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'inquiries' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>Inquiries</button>
          
          {isMaster && (
            <>
              <button onClick={() => setActiveTab('branding')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'branding' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>Branding</button>
              <button onClick={() => setActiveTab('services')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'services' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>Service Catalog</button>
              <button onClick={() => setActiveTab('portfolio')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'portfolio' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>Previous Work</button>
              <button onClick={() => setActiveTab('slider')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'slider' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>Home Slider</button>
              <button onClick={() => setActiveTab('users')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>Admin Management</button>
              <button onClick={() => setActiveTab('system')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'system' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>System Maintenance</button>
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-800 space-y-2">
          {isMaster && (
            <button 
              onClick={commitChanges} 
              disabled={isSaving}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${isSaving ? 'bg-gray-700 text-gray-500 border-gray-600' : 'bg-green-600/20 text-green-400 border-green-500/30 hover:bg-green-600/30'}`}
            >
              {isSaving ? 'Saving...' : 'Save All System Changes'}
            </button>
          )}
          <div className="mb-2 text-xs font-bold text-gray-500 px-4">User: {currentUser.name}</div>
          <button onClick={onLogout} className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 text-sm font-bold py-3 rounded-xl transition-all border border-red-900/50">Sign Out</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow p-8 overflow-y-auto h-[700px]">
        {activeTab === 'inquiries' && (
          <div>
            <h1 className="text-2xl font-bold mb-8">Client Inquiries</h1>
            <div className="space-y-6">
              {inquiries.length === 0 ? <div className="text-center py-20 text-gray-400 italic">No inquiries submitted yet.</div> : inquiries.map(inq => {
                  const s = config.services.find(x => x.id === inq.serviceId);
                  return (
                    <div key={inq.id} className="border border-gray-100 rounded-2xl p-6 bg-gray-50 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{inq.clientName}</h3>
                          <p className="text-sm font-semibold text-blue-600 uppercase tracking-tighter">{s?.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{inq.phone} • {inq.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${inq.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : inq.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {inq.status}
                        </span>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
                        <p className="text-sm text-gray-700 leading-relaxed italic">"{inq.description}"</p>
                        {inq.images.length > 0 && <div className="flex gap-2 mt-4 overflow-x-auto pb-2">{inq.images.map((img, i) => <img key={i} src={img} className="w-16 h-16 rounded-lg object-cover border border-gray-100 shadow-sm" alt="Asset" />)}</div>}
                      </div>
                      {inq.solutionText && <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100"><h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">AI Solution Strategy</h4><p className="text-sm text-blue-900 leading-tight">{inq.solutionText}</p></div>}
                      <div className="flex items-center gap-3">
                        {inq.status === 'Pending' && <button onClick={() => handleProcessWork(inq)} disabled={processingId === inq.id} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-blue-100 transition-all disabled:opacity-50">{processingId === inq.id ? 'Analyzing...' : 'Analyze with AI'}</button>}
                        {inq.status === 'In Progress' && <><button onClick={() => sendToWhatsApp(inq)} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-green-100 transition-all">Update via WhatsApp</button><button onClick={() => onUpdateStatus(inq.id, { status: 'Completed' })} className="bg-gray-800 hover:bg-black text-white px-5 py-2 rounded-xl text-sm font-bold transition-all">Final Delivery Done</button></>}
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>
        )}

        {isMaster && activeTab === 'slider' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Home Slider Management</h1>
              <button onClick={commitChanges} className="text-xs font-black bg-green-600 text-white px-4 py-2 rounded-lg uppercase">Commit Slider Changes</button>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10">
              <h2 className="text-lg font-bold mb-4">Add New Slide</h2>
              <form onSubmit={handleAddSlider} className="space-y-4">
                <input required className={inputClass} placeholder="Promotional Text (e.g. 5+1 Free Scheme)" value={newSliderText} onChange={e => setNewSliderText(e.target.value)} />
                <div className="flex items-center gap-4">
                  <input type="file" accept="image/*" onChange={handleSliderImageUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700" />
                  {newSliderImage && <img src={newSliderImage} className="w-24 h-12 object-cover rounded-lg border" alt="Preview" />}
                </div>
                <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2 rounded-xl">Add to Slider</button>
              </form>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {config.sliderItems.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative group">
                  <img src={item.image} className="w-full h-32 object-cover opacity-80" alt={item.text} />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-900 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">{item.text}</div>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveSlider(item.id)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isMaster && activeTab === 'system' && (
          <div>
            <h1 className="text-2xl font-bold mb-8">System Maintenance</h1>
            <div className="max-w-xl space-y-8">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h2 className="text-lg font-bold text-blue-900 mb-2">Backup Database</h2>
                <p className="text-sm text-blue-700 mb-6">Download your entire app configuration, admin list, slider items, portfolio samples, and inquiry history as a secure JSON file.</p>
                <button onClick={handleExportData} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all">
                  Export backup.json
                </button>
              </div>

              <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                <h2 className="text-lg font-bold text-orange-900 mb-2">Restore Database</h2>
                <p className="text-sm text-orange-700 mb-6">Upload a previously exported backup file to restore all your data. Warning: Current data will be replaced.</p>
                <div className="flex items-center gap-4">
                  <input type="file" accept=".json" onChange={handleImportData} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200" />
                </div>
              </div>
            </div>
          </div>
        )}

        {isMaster && activeTab === 'branding' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Branding Settings</h1>
              <button onClick={commitChanges} className="text-xs font-black bg-green-600 text-white px-4 py-2 rounded-lg uppercase">Commit Branding Changes</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300">
                <label className="block text-sm font-bold mb-3 text-gray-700 uppercase tracking-wider">Logo Attachment</label>
                <div className="flex items-center gap-6">
                  {config.logoUrl ? <img src={config.logoUrl} className="w-20 h-20 object-contain rounded-xl bg-white border shadow-sm" alt="Logo" /> : <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 font-bold text-2xl">{config.logoInitial}</div>}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
              </div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Company Name</label><input className={inputClass} placeholder="e.g. EGINTECH" value={config.companyName} onChange={e => updateBranding('companyName', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Logo Initial (Fallback)</label><input className={inputClass} placeholder="e.g. E" maxLength={2} value={config.logoInitial} onChange={e => updateBranding('logoInitial', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Registration No.</label><input className={inputClass} placeholder="Reg. ID" value={config.regNo} onChange={e => updateBranding('regNo', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Trade Mark (If any)</label><input className={inputClass} placeholder="T/M Reference" value={config.tradeMark} onChange={e => updateBranding('tradeMark', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Business Head Name</label><input className={inputClass} placeholder="CEO / Proprietor" value={config.businessHead} onChange={e => updateBranding('businessHead', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Master Admin Phone</label><input className={inputClass} placeholder="99xxxxxxxx" value={config.adminPhone} onChange={e => updateBranding('adminPhone', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Tech Head Name</label><input className={inputClass} placeholder="CTO / Lead Developer" value={config.techHead} onChange={e => updateBranding('techHead', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Tech Head Contact</label><input className={inputClass} placeholder="Phone number" value={config.techHeadPhone} onChange={e => updateBranding('techHeadPhone', e.target.value)} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium mb-1 text-gray-700">Registered Office Address</label><textarea className={inputClass} rows={2} placeholder="Full Legal Address" value={config.regAddress} onChange={e => updateBranding('regAddress', e.target.value)} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium mb-1 text-gray-700">Service/Support Address</label><textarea className={inputClass} rows={2} placeholder="Office for Service Delivery" value={config.serviceAddress} onChange={e => updateBranding('serviceAddress', e.target.value)} /></div>
            </div>
          </div>
        )}

        {isMaster && activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Manage Services</h1>
              <button onClick={commitChanges} className="text-xs font-black bg-green-600 text-white px-4 py-2 rounded-lg uppercase">Commit Catalog Changes</button>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10">
              <h2 className="text-lg font-bold mb-4">Add New Service</h2>
              <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required className={inputClass} placeholder="Service Name" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} />
                <input className={inputClass} placeholder="Category" value={newServiceCategory} onChange={e => setNewServiceCategory(e.target.value)} />
                <input type="number" className={inputClass} placeholder="Price (₹)" value={newServicePrice} onChange={e => setNewServicePrice(parseInt(e.target.value) || 0)} />
                <textarea className={`${inputClass} md:col-span-3`} placeholder="Description" rows={2} value={newServiceDesc} onChange={e => setNewServiceDesc(e.target.value)} />
                <div className="md:col-span-3"><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl">Add Service</button></div>
              </form>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {config.services.map(service => (
                <div key={service.id} className="border border-gray-100 rounded-2xl p-6 flex items-center gap-6 bg-gray-50 hover:bg-white transition-all shadow-sm">
                  <div className="flex-grow">
                    <input className="font-bold bg-transparent w-full mb-1 text-gray-800 outline-none text-lg" placeholder="Service Name" value={service.name} onChange={e => updateService(service.id, 'name', e.target.value)} />
                    <input className="text-sm text-gray-500 bg-transparent w-full outline-none" placeholder="Description" value={service.description} onChange={e => updateService(service.id, 'description', e.target.value)} />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</label>
                      <input type="number" className="w-28 bg-gray-800 text-yellow-400 border-none rounded-lg px-3 py-2 font-bold outline-none text-right" value={service.price} onChange={e => updateService(service.id, 'price', parseInt(e.target.value) || 0)} />
                    </div>
                    <button onClick={() => handleRemoveService(service.id)} className="text-red-500 hover:text-red-700 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isMaster && activeTab === 'portfolio' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Previous Work Management</h1>
              <button onClick={commitChanges} className="text-xs font-black bg-green-600 text-white px-4 py-2 rounded-lg uppercase">Commit Work Changes</button>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10">
              <h2 className="text-lg font-bold mb-4">Upload New Sample Work</h2>
              <form onSubmit={handleAddPortfolio} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required className={inputClass} placeholder="Project Title" value={newPortfolioTitle} onChange={e => setNewPortfolioTitle(e.target.value)} />
                  <input className={inputClass} placeholder="Category (Web, Software, etc.)" value={newPortfolioCategory} onChange={e => setNewPortfolioCategory(e.target.value)} />
                  <input className={inputClass} placeholder="Web Link (Optional)" value={newPortfolioLink} onChange={e => setNewPortfolioLink(e.target.value)} />
                  <input className={inputClass} placeholder="App Name (Optional)" value={newPortfolioAppName} onChange={e => setNewPortfolioAppName(e.target.value)} />
                </div>
                <div className="flex items-center gap-4">
                  <input type="file" accept="image/*" onChange={handlePortfolioUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700" />
                  {newPortfolioImage && <img src={newPortfolioImage} className="w-16 h-16 object-cover rounded-lg border" alt="Preview" />}
                </div>
                <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2 rounded-xl">Publish Work</button>
              </form>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.portfolio.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group">
                  <img src={item.image} className="w-full h-40 object-cover" alt={item.title} />
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex-grow">
                      <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">{item.category}</div>
                      <div className="font-bold text-gray-800">{item.title}</div>
                    </div>
                    <button onClick={() => handleRemovePortfolio(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isMaster && activeTab === 'users' && (
          <div>
            <h1 className="text-2xl font-bold mb-8">Admin User Management</h1>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10">
              <h2 className="text-lg font-bold mb-4">Register New Admin</h2>
              <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required className={inputClass} placeholder="Admin Full Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                <input required className={inputClass} placeholder="Admin User ID" value={newUserUsername} onChange={e => setNewUserUsername(e.target.value)} />
                <input required type="password" className={inputClass} placeholder="Admin Password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} />
                <div className="md:col-span-3"><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-100">Create Admin ID</button></div>
              </form>
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Manage Active Admin IDs</h2>
              <div className="overflow-hidden border rounded-2xl bg-white shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 border-b">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Admin ID</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">{config.users.map(u => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 font-bold text-gray-800">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{u.username}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          {u.role !== 'MASTER' && (
                            <>
                              <button onClick={() => shareCredentials(u)} className="text-green-600 hover:text-green-800 font-bold text-xs bg-green-50 px-3 py-1 rounded-lg transition-colors">Share Admin ID</button>
                              <button onClick={() => removeUser(u.id)} className="text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 px-3 py-1 rounded-lg transition-colors">Remove</button>
                            </>
                          )}
                        </td>
                      </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
