
import React, { useState, useCallback } from 'react';
import { Inquiry, AppConfig, Service, User, PortfolioItem, SliderItem, Review, FAQItem } from '../types';
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
  const [activeTab, setActiveTab] = useState<'inquiries' | 'branding' | 'services' | 'users' | 'portfolio' | 'slider' | 'reviews' | 'faqs' | 'system'>('inquiries');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Management states
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  const [newPortfolioTitle, setNewPortfolioTitle] = useState('');
  const [newPortfolioCategory, setNewPortfolioCategory] = useState('');
  const [newPortfolioImage, setNewPortfolioImage] = useState('');
  const [newPortfolioLink, setNewPortfolioLink] = useState('');
  const [newPortfolioAppName, setNewPortfolioAppName] = useState('');

  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(0);
  const [newServiceDesc, setNewServiceDesc] = useState('');

  const [newSliderText, setNewSliderText] = useState('');
  const [newSliderImage, setNewSliderImage] = useState('');

  const [newRevName, setNewRevName] = useState('');
  const [newRevComment, setNewRevComment] = useState('');
  const [newRevRating, setNewRevRating] = useState(5);

  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

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
    setNewServiceName(''); setNewServiceCategory(''); setNewServicePrice(0); setNewServiceDesc('');
  };

  const handleRemoveService = (id: string) => {
    if (!isMaster) return;
    if (confirm("Remove service?")) {
      onUpdateConfig(prev => ({ ...prev, services: prev.services.filter(s => s.id !== id) }));
    }
  };

  const handleAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioImage || !newPortfolioTitle) return;
    const newItem: PortfolioItem = {
      id: 'p-' + Math.random().toString(36).substr(2, 9),
      title: newPortfolioTitle,
      category: newPortfolioCategory || 'Work',
      image: newPortfolioImage,
      link: newPortfolioLink,
      appName: newPortfolioAppName
    };
    onUpdateConfig(prev => ({ ...prev, portfolio: [...prev.portfolio, newItem] }));
    setNewPortfolioTitle(''); setNewPortfolioCategory(''); setNewPortfolioImage(''); setNewPortfolioLink(''); setNewPortfolioAppName('');
  };

  const handleAddSlider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSliderImage || !newSliderText) return;
    const newItem: SliderItem = {
      id: 'slide-' + Math.random().toString(36).substr(2, 9),
      text: newSliderText,
      image: newSliderImage
    };
    onUpdateConfig(prev => ({ ...prev, sliderItems: [...(prev.sliderItems || []), newItem] }));
    setNewSliderText(''); setNewSliderImage('');
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRevName || !newRevComment) return;
    const newRev: Review = {
      id: 'rev-' + Math.random().toString(36).substr(2, 9),
      clientName: newRevName,
      comment: newRevComment,
      rating: newRevRating
    };
    onUpdateConfig(prev => ({ ...prev, reviews: [...(prev.reviews || []), newRev] }));
    setNewRevName(''); setNewRevComment(''); setNewRevRating(5);
  };

  const handleRemoveReview = (id: string) => {
    if (confirm("Remove review?")) {
      onUpdateConfig(prev => ({ ...prev, reviews: prev.reviews.filter(r => r.id !== id) }));
    }
  };

  const handleAddFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ || !newFaqA) return;
    const newFaq: FAQItem = {
      id: 'faq-' + Math.random().toString(36).substr(2, 9),
      question: newFaqQ,
      answer: newFaqA
    };
    onUpdateConfig(prev => ({ ...prev, faqs: [...(prev.faqs || []), newFaq] }));
    setNewFaqQ(''); setNewFaqA('');
  };

  const handleRemoveFAQ = (id: string) => {
    if (confirm("Remove FAQ?")) {
      onUpdateConfig(prev => ({ ...prev, faqs: prev.faqs.filter(f => f.id !== id) }));
    }
  };

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
    setNewUserName(''); setNewUserUsername(''); setNewUserPassword('');
  };

  const removeUser = (id: string) => {
    if (id === currentUser.id) return;
    onUpdateConfig(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
  };

  const handleExportData = () => {
    const exportData = { config, inquiries, version: '1.0', timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.companyName.toLowerCase().replace(/\s/g, '_')}_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.config && data.inquiries) onRestoreSystem(data.config, data.inquiries);
      } catch (err) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
  };

  const inputClass = "w-full bg-gray-800 border-gray-700 text-yellow-400 placeholder-gray-500 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none transition-all";

  return (
    <div className="bg-white rounded-3xl shadow-xl min-h-[700px] flex overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Console</h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{currentUser.role} SESSION</span>
          </div>
        </div>
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          <button onClick={() => setActiveTab('inquiries')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'inquiries' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>Inquiries</button>
          {isMaster && (
            <>
              <button onClick={() => setActiveTab('branding')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'branding' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>Branding</button>
              <button onClick={() => setActiveTab('services')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'services' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>Service Catalog</button>
              <button onClick={() => setActiveTab('portfolio')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'portfolio' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>Previous Work</button>
              <button onClick={() => setActiveTab('slider')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'slider' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>Home Slider</button>
              <button onClick={() => setActiveTab('reviews')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'reviews' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>Reviews</button>
              <button onClick={() => setActiveTab('faqs')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'faqs' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>FAQs</button>
              <button onClick={() => setActiveTab('users')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>Admins</button>
              <button onClick={() => setActiveTab('system')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'system' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-sm'}`}>System</button>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-2">
          {isMaster && (
            <button onClick={commitChanges} disabled={isSaving} className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-green-600/20 text-green-400 border border-green-500/30">
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </button>
          )}
          <button onClick={onLogout} className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs font-bold py-3 rounded-xl transition-all border border-red-900/50 uppercase tracking-widest">Sign Out</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-8 overflow-y-auto h-[700px]">
        
        {/* INQUIRIES TAB */}
        {activeTab === 'inquiries' && (
          <div>
            <h1 className="text-2xl font-bold mb-8 text-gray-900 font-outfit">Client Inquiries</h1>
            <div className="space-y-6">
              {inquiries.length === 0 ? <div className="text-center py-20 text-gray-400 italic">No inquiries found.</div> : inquiries.map(inq => {
                  const s = config.services.find(x => x.id === inq.serviceId);
                  return (
                    <div key={inq.id} className="border border-gray-100 rounded-2xl p-6 bg-gray-50 shadow-sm transition-all hover:bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{inq.clientName}</h3>
                          <p className="text-sm font-semibold text-blue-600 uppercase tracking-tighter">{s?.name}</p>
                          <p className="text-xs text-gray-500 mt-1"><span className="font-bold text-gray-800 text-base">{inq.phone}</span> • {inq.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${inq.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : inq.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{inq.status}</span>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4 text-sm text-gray-700 leading-relaxed italic">"{inq.description}"</div>
                      {inq.solutionText && <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-900">{inq.solutionText}</div>}
                      <div className="flex gap-3">
                        {inq.status === 'Pending' && <button onClick={() => handleProcessWork(inq)} disabled={processingId === inq.id} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-blue-100">Analyze with AI</button>}
                        {inq.status === 'In Progress' && <button onClick={() => onUpdateStatus(inq.id, { status: 'Completed' })} className="bg-gray-800 text-white px-5 py-2 rounded-xl text-sm font-bold">Mark Completed</button>}
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>
        )}

        {/* BRANDING TAB */}
        {isMaster && activeTab === 'branding' && (
          <div>
            <h1 className="text-2xl font-bold mb-8 font-outfit text-gray-900">Branding Settings</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Logo Attachment</label>
                <div className="flex items-center gap-6">
                  {config.logoUrl ? <img src={config.logoUrl} className="w-20 h-20 object-contain rounded-xl bg-white border shadow-sm" alt="Logo" /> : <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 font-bold text-2xl">{config.logoInitial}</div>}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm text-gray-500" />
                </div>
              </div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label><input className={inputClass} value={config.companyName} onChange={e => updateBranding('companyName', e.target.value)} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Logo Initial</label><input className={inputClass} maxLength={2} value={config.logoInitial} onChange={e => updateBranding('logoInitial', e.target.value)} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Reg No.</label><input className={inputClass} value={config.regNo} onChange={e => updateBranding('regNo', e.target.value)} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Trade Mark</label><input className={inputClass} value={config.tradeMark} onChange={e => updateBranding('tradeMark', e.target.value)} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Business Head</label><input className={inputClass} value={config.businessHead} onChange={e => updateBranding('businessHead', e.target.value)} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Master Admin Phone</label><input className={inputClass} value={config.adminPhone} onChange={e => updateBranding('adminPhone', e.target.value)} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Tech Head</label><input className={inputClass} value={config.techHead} onChange={e => updateBranding('techHead', e.target.value)} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Tech Head Phone</label><input className={inputClass} value={config.techHeadPhone} onChange={e => updateBranding('techHeadPhone', e.target.value)} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Reg Office Address</label><textarea className={inputClass} rows={2} value={config.regAddress} onChange={e => updateBranding('regAddress', e.target.value)} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Service Address</label><textarea className={inputClass} rows={2} value={config.serviceAddress} onChange={e => updateBranding('serviceAddress', e.target.value)} /></div>
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {isMaster && activeTab === 'services' && (
          <div>
            <h1 className="text-2xl font-bold mb-8 font-outfit text-gray-900">Manage Service Catalog</h1>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
              <h2 className="text-lg font-bold mb-4">Add New Service</h2>
              <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required className={inputClass} placeholder="Name" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} />
                <input className={inputClass} placeholder="Category" value={newServiceCategory} onChange={e => setNewServiceCategory(e.target.value)} />
                <input type="number" className={inputClass} placeholder="Price" value={newServicePrice} onChange={e => setNewServicePrice(parseInt(e.target.value) || 0)} />
                <textarea className={`${inputClass} md:col-span-3`} placeholder="Description" value={newServiceDesc} onChange={e => setNewServiceDesc(e.target.value)} />
                <button type="submit" className="bg-blue-600 text-white font-bold py-2 rounded-xl md:col-span-3 hover:bg-blue-700 transition-all">Add Service</button>
              </form>
            </div>
            <div className="space-y-4">
              {config.services.map(s => (
                <div key={s.id} className="p-6 border rounded-2xl bg-white flex justify-between items-center shadow-sm">
                  <div className="flex-grow pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <input className="font-bold text-gray-900 bg-transparent border-none outline-none text-lg" value={s.name} onChange={e => updateService(s.id, 'name', e.target.value)} />
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{s.category}</span>
                    </div>
                    <input className="text-sm text-gray-500 bg-transparent border-none outline-none w-full" value={s.description} onChange={e => updateService(s.id, 'description', e.target.value)} />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price</div>
                      <input type="number" className="w-24 bg-gray-800 text-yellow-400 border-none rounded-lg px-3 py-1 font-bold text-right" value={s.price} onChange={e => updateService(s.id, 'price', parseInt(e.target.value) || 0)} />
                    </div>
                    <button onClick={() => handleRemoveService(s.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {isMaster && activeTab === 'portfolio' && (
          <div>
            <h1 className="text-2xl font-bold mb-8 font-outfit text-gray-900">Manage Previous Work</h1>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
              <h2 className="text-lg font-bold mb-4">Upload New Project</h2>
              <form onSubmit={handleAddPortfolio} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required className={inputClass} placeholder="Title" value={newPortfolioTitle} onChange={e => setNewPortfolioTitle(e.target.value)} />
                  <input className={inputClass} placeholder="Category" value={newPortfolioCategory} onChange={e => setNewPortfolioCategory(e.target.value)} />
                  <input className={inputClass} placeholder="Project Link" value={newPortfolioLink} onChange={e => setNewPortfolioLink(e.target.value)} />
                  <input className={inputClass} placeholder="App Name" value={newPortfolioAppName} onChange={e => setNewPortfolioAppName(e.target.value)} />
                </div>
                <div className="flex items-center gap-4">
                  <input type="file" accept="image/*" onChange={e => {
                    const r = new FileReader(); r.onload = () => setNewPortfolioImage(r.result as string); r.readAsDataURL(e.target.files![0]);
                  }} className="text-sm text-gray-500" />
                  {newPortfolioImage && <img src={newPortfolioImage} className="w-16 h-16 object-cover rounded-lg border shadow-sm" alt="Preview" />}
                </div>
                <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Publish Work</button>
              </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {config.portfolio.map(item => (
                <div key={item.id} className="relative group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <img src={item.image} className="w-full h-32 object-cover" alt={item.title} />
                  <div className="p-4">
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{item.category}</div>
                    <div className="font-bold text-gray-900 text-sm">{item.title}</div>
                  </div>
                  <button onClick={() => { if(confirm("Remove?")) onUpdateConfig(p => ({ ...p, portfolio: p.portfolio.filter(x => x.id !== item.id) }))}} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDER TAB */}
        {isMaster && activeTab === 'slider' && (
          <div>
            <h1 className="text-2xl font-bold mb-8 font-outfit text-gray-900">Manage Home Slider</h1>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
              <h2 className="text-lg font-bold mb-4">Add New Slide</h2>
              <form onSubmit={handleAddSlider} className="space-y-4">
                <input required className={inputClass} placeholder="Promotional Text" value={newSliderText} onChange={e => setNewSliderText(e.target.value)} />
                <div className="flex items-center gap-4">
                  <input type="file" accept="image/*" onChange={e => {
                    const r = new FileReader(); r.onload = () => setNewSliderImage(r.result as string); r.readAsDataURL(e.target.files![0]);
                  }} className="text-sm text-gray-500" />
                  {newSliderImage && <img src={newSliderImage} className="w-24 h-12 object-cover rounded-lg border shadow-sm" alt="Preview" />}
                </div>
                <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-blue-100">Add Slide</button>
              </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {config.sliderItems.map(item => (
                <div key={item.id} className="relative bg-gray-900 rounded-2xl overflow-hidden group aspect-[2/1]">
                  <img src={item.image} className="absolute inset-0 w-full h-full object-cover opacity-60" alt={item.text} />
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                    <div className="text-white font-bold text-lg">{item.text}</div>
                  </div>
                  <button onClick={() => { if(confirm("Remove slide?")) onUpdateConfig(p => ({ ...p, sliderItems: p.sliderItems.filter(x => x.id !== item.id) }))}} className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {isMaster && activeTab === 'reviews' && (
          <div>
            <h1 className="text-2xl font-bold mb-8 font-outfit text-gray-900">Manage Client Reviews</h1>
            <form onSubmit={handleAddReview} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10 space-y-4">
              <input required className={inputClass} placeholder="Client Name" value={newRevName} onChange={e => setNewRevName(e.target.value)} />
              <textarea required className={inputClass} placeholder="Review Comment" rows={3} value={newRevComment} onChange={e => setNewRevComment(e.target.value)} />
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-500 font-bold">Rating:</label>
                <input type="number" min="1" max="5" className="w-20 bg-gray-800 text-yellow-400 rounded-lg p-2" value={newRevRating} onChange={e => setNewRevRating(parseInt(e.target.value))} />
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-100">Add Review</button>
              </div>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.reviews?.map(rev => (
                <div key={rev.id} className="p-4 border rounded-2xl bg-white flex justify-between items-center shadow-sm">
                  <div>
                    <div className="font-bold text-gray-900">{rev.clientName} ({rev.rating}★)</div>
                    <div className="text-sm text-gray-500 line-clamp-2 italic">"{rev.comment}"</div>
                  </div>
                  <button onClick={() => handleRemoveReview(rev.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQS TAB */}
        {isMaster && activeTab === 'faqs' && (
          <div>
            <h1 className="text-2xl font-bold mb-8 font-outfit text-gray-900">Frequently Asked Questions</h1>
            <form onSubmit={handleAddFAQ} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10 space-y-4">
              <input required className={inputClass} placeholder="Question" value={newFaqQ} onChange={e => setNewFaqQ(e.target.value)} />
              <textarea required className={inputClass} placeholder="Answer" rows={3} value={newFaqA} onChange={e => setNewFaqA(e.target.value)} />
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-100">Add FAQ</button>
            </form>
            <div className="space-y-4">
              {config.faqs?.map(faq => (
                <div key={faq.id} className="p-4 border rounded-2xl bg-white flex justify-between items-start shadow-sm group">
                  <div className="pr-4">
                    <div className="font-bold text-gray-900 mb-1">Q: {faq.question}</div>
                    <div className="text-sm text-gray-600">A: {faq.answer}</div>
                  </div>
                  <button onClick={() => handleRemoveFAQ(faq.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-full shrink-0 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {isMaster && activeTab === 'users' && (
          <div>
            <h1 className="text-2xl font-bold mb-8 font-outfit text-gray-900">Admin Management</h1>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10">
              <h2 className="text-lg font-bold mb-4">Create Admin ID</h2>
              <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required className={inputClass} placeholder="Full Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                <input required className={inputClass} placeholder="Admin ID" value={newUserUsername} onChange={e => setNewUserUsername(e.target.value)} />
                <input required type="password" className={inputClass} placeholder="Password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} />
                <div className="md:col-span-3"><button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Generate ID</button></div>
              </form>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 border-b">
                  <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Admin ID</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {config.users.map(u => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 font-bold text-gray-800">{u.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.username}</td>
                      <td className="px-6 py-4"><span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${u.role === 'MASTER' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-600'}`}>{u.role}</span></td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== 'MASTER' && <button onClick={() => removeUser(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SYSTEM TAB */}
        {isMaster && activeTab === 'system' && (
          <div>
            <h1 className="text-2xl font-bold mb-8 font-outfit text-gray-900">System Maintenance</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 shadow-sm">
                <h3 className="text-lg font-bold text-blue-900 mb-2">Export System Backup</h3>
                <p className="text-sm text-blue-700 mb-6">Download your entire database (Branding, Services, Inquiries, etc.) as a JSON file for safety.</p>
                <button onClick={handleExportData} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Export.json</button>
              </div>
              <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 shadow-sm">
                <h3 className="text-lg font-bold text-orange-900 mb-2">Restore from Backup</h3>
                <p className="text-sm text-orange-700 mb-6">Warning: This will overwrite all current system data with the backup file data.</p>
                <input type="file" accept=".json" onChange={handleImportData} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-100 file:text-orange-700" />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPortal;
