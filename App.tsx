
import React, { useState, useEffect, useCallback } from 'react';
import HeroSlider from './components/HeroSlider';
import InquiryForm from './components/InquiryForm';
import AdminPortal from './components/AdminPortal';
import Login from './components/Login';
import { DEFAULT_CONFIG } from './constants';
import { AppRoute, Inquiry, AppConfig, User } from './types';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [loginType, setLoginType] = useState<'MASTER' | 'ADMIN' | null>(null);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem('egintech_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Dynamic App Config State - Robust loading to prevent data loss
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem('egintech_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge strategy: Start with defaults, then apply parsed, but ensure array fields exist
        return { 
          ...DEFAULT_CONFIG, 
          ...parsed,
          services: Array.isArray(parsed.services) ? parsed.services : DEFAULT_CONFIG.services,
          portfolio: Array.isArray(parsed.portfolio) ? parsed.portfolio : DEFAULT_CONFIG.portfolio,
          sliderItems: Array.isArray(parsed.sliderItems) ? parsed.sliderItems : DEFAULT_CONFIG.sliderItems,
          users: Array.isArray(parsed.users) ? parsed.users : DEFAULT_CONFIG.users,
          reviews: Array.isArray(parsed.reviews) ? parsed.reviews : DEFAULT_CONFIG.reviews,
          faqs: Array.isArray(parsed.faqs) ? parsed.faqs : DEFAULT_CONFIG.faqs
        };
      }
    } catch (e) {
      console.error("Failed to load config from storage:", e);
    }
    return DEFAULT_CONFIG;
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    try {
      const saved = localStorage.getItem('egintech_inquiries');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();

  // Persistence Effects - Ensure data is saved immediately
  useEffect(() => {
    try {
      localStorage.setItem('egintech_inquiries', JSON.stringify(inquiries));
    } catch (e) {
      console.error("Failed to save inquiries:", e);
    }
  }, [inquiries]);

  useEffect(() => {
    try {
      // Save full config to prevent data loss
      localStorage.setItem('egintech_config', JSON.stringify(config));
    } catch (e) {
      console.error("Failed to save config:", e);
    }
  }, [config]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('egintech_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('egintech_user');
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setRoute(AppRoute.ADMIN);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setRoute(AppRoute.HOME);
    window.scrollTo(0, 0);
  };

  const handleInquirySubmit = (newInquiry: Inquiry) => {
    setInquiries(prev => [newInquiry, ...prev]);
    setShowInquiryForm(false);
  };

  const updateInquiryStatus = useCallback((id: string, updates: Partial<Inquiry>) => {
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, ...updates } : inq));
  }, []);

  const updateConfig = useCallback((newConfig: AppConfig | ((prev: AppConfig) => AppConfig)) => {
    setConfig(prev => {
      const updated = typeof newConfig === 'function' ? newConfig(prev) : newConfig;
      return updated;
    });
  }, []);

  const handleRestoreSystem = (newConfig: AppConfig, newInquiries: Inquiry[]) => {
    setConfig(newConfig);
    setInquiries(newInquiries);
    alert("System database restored successfully!");
  };

  const openInquiry = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setShowInquiryForm(true);
  };

  const navigateToLogin = (type: 'MASTER' | 'ADMIN') => {
    setLoginType(type);
    setRoute(AppRoute.LOGIN);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setRoute(AppRoute.HOME)}>
            {config.logoUrl ? (
              <img src={config.logoUrl} className="w-12 h-12 object-contain" alt="Company Logo" />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                {config.logoInitial}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold font-outfit tracking-tight text-gray-900 leading-none">
                {config.companyName || "Your Brand"}
              </h1>
              {config.tradeMark && (
                <p className="text-[10px] text-gray-500 font-black mt-1 uppercase tracking-widest">
                  TM : {config.tradeMark}
                </p>
              )}
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => setRoute(AppRoute.HOME)} className={`text-sm font-bold transition-all ${route === AppRoute.HOME ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-500'}`}>Home</button>
          </nav>

          <div className="flex items-center gap-4">
            {currentUser && (
               <button onClick={() => setRoute(AppRoute.ADMIN)} className="text-xs font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 flex items-center gap-2 hover:bg-blue-100 transition-colors">
                 Console
               </button>
            )}
            <button onClick={() => openInquiry()} className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {route === AppRoute.HOME && (
          <>
            <section className="bg-white py-8 px-4 border-b border-gray-100">
              <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-black font-outfit leading-tight tracking-tight">
                  <span className="text-gray-900">All types of </span>
                  <span className="text-blue-600">Website</span>
                  <span className="text-gray-900">, </span>
                  <span className="text-purple-600">Software-Mobile App</span>
                  <span className="text-gray-900"> development</span>
                  <br className="hidden md:block" />
                  <span className="text-gray-900"> and </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-600">
                    Multi AI based online work
                  </span>
                </h2>
              </div>
            </section>

            <HeroSlider items={config.sliderItems} />

            <section id="services" className="py-24">
              <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold font-outfit text-gray-900 mb-4">Our Service Catalog</h2>
                <p className="text-gray-500 max-w-2xl mx-auto">Explore high-quality solutions tailored for your growth and success.</p>
              </div>
              
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {config.services.map((service) => (
                    <div key={service.id} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-200 transition-all hover:shadow-2xl group flex flex-col">
                      <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">{service.category}</div>
                      <h4 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h4>
                      <p className="text-gray-500 text-sm mb-6 h-12 line-clamp-2">{service.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-3xl font-bold text-gray-900">₹{service.price}</span>
                        <button onClick={() => openInquiry(service.id)} className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-bold group-hover:bg-blue-600 transition-colors">
                          Inquire
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="portfolio" className="py-24 bg-white border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold font-outfit text-gray-900 mb-4">Previous Work & Samples</h2>
                <p className="text-gray-500 max-w-2xl mx-auto">Take a look at what we've accomplished for our clients.</p>
              </div>
              <div className="max-w-7xl mx-auto px-4">
                {config.portfolio.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 italic">No samples available yet. Check back soon!</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {config.portfolio.map(item => (
                      <div key={item.id} className="relative group overflow-hidden rounded-3xl shadow-xl bg-gray-900 aspect-video">
                        <img src={item.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80" alt={item.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                          <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">{item.category}</div>
                          <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                          {item.appName && <p className="text-sm text-gray-300 font-medium mb-4">Project: {item.appName}</p>}
                          {item.link && (
                            <a 
                              href={item.link.startsWith('http') ? item.link : `https://${item.link}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-full w-fit hover:bg-blue-700 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                              Visit Site
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Reviews Section */}
            <section id="reviews" className="py-24 bg-gray-50 border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold font-outfit text-gray-900 mb-4">Client Reviews</h2>
                  <p className="text-gray-500 max-w-2xl mx-auto">What our clients say about our services and dedication.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {config.reviews.map(rev => (
                    <div key={rev.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-5 h-5 ${i < rev.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-600 italic mb-6">"{rev.comment}"</p>
                      <div className="font-bold text-gray-900">— {rev.clientName}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 bg-white border-t border-gray-100">
              <div className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold font-outfit text-gray-900 mb-4">Frequently Asked Questions</h2>
                  <p className="text-gray-500">Quick answers to common questions about our platform and services.</p>
                </div>
                <div className="space-y-6">
                  {config.faqs.map(faq => (
                    <div key={faq.id} className="p-6 rounded-2xl border border-gray-100 bg-gray-50">
                      <h4 className="font-bold text-gray-900 mb-2">{faq.question}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-20 bg-gray-900 text-white text-center">
              <div className="max-w-4xl mx-auto px-4">
                <h3 className="text-3xl font-bold mb-6">Ready to start your project?</h3>
                <p className="text-gray-400 mb-10 text-lg">Click below to submit your details and get expert guidance immediately.</p>
                <button onClick={() => openInquiry()} className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20">
                  Inquire Now
                </button>
              </div>
            </section>
          </>
        )}

        {route === AppRoute.LOGIN && <div className="py-12 px-4 max-w-7xl mx-auto"><Login config={config} onLogin={handleLogin} initialType={loginType} /></div>}
        {route === AppRoute.ADMIN && currentUser && <div className="py-12 px-4 max-w-7xl mx-auto"><AdminPortal inquiries={inquiries} config={config} currentUser={currentUser} onUpdateStatus={updateInquiryStatus} onUpdateConfig={updateConfig} onRestoreSystem={handleRestoreSystem} onLogout={handleLogout} /></div>}
        {route === AppRoute.ADMIN && !currentUser && <div className="py-24 text-center"><h2 className="text-2xl font-bold text-gray-400">Unauthorized Access</h2><button onClick={() => setRoute(AppRoute.LOGIN)} className="mt-4 text-blue-600 font-bold underline">Please Login First</button></div>}
      </main>

      <footer className="bg-white border-t py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-6">{config.logoUrl && <img src={config.logoUrl} className="w-10 h-10 object-contain" alt="Logo" />}<h3 className="text-xl font-bold">{config.companyName || "Our Agency"}</h3></div>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">Innovative digital agency specialized in web development and career guidance.</p>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Reg: {config.regNo}</p>
              {config.tradeMark && <p className="text-[10px] text-gray-400">TM : {config.tradeMark}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
            <div>
              <h4 className="font-bold text-sm mb-4">Leadership</h4>
              <ul className="text-sm text-gray-500 space-y-3">
                {config.businessHead && (
                  <li>
                    <span className="font-semibold text-gray-800 block">Business Head:</span> 
                    {config.businessHead} <br/> 
                    {config.adminPhone && <span className="font-bold text-blue-700 text-base">{config.adminPhone}</span>}
                  </li>
                )}
                {config.techHead && (
                  <li>
                    <span className="font-semibold text-gray-800 block">Tech Head:</span> 
                    {config.techHead} <br/>
                    {config.techHeadPhone && <span className="font-bold text-blue-700 text-base">{config.techHeadPhone}</span>}
                  </li>
                )}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm mb-2">Management Portals</h4>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigateToLogin('ADMIN')} 
                  className="text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 uppercase tracking-widest flex items-center justify-center gap-2 border border-blue-200 px-6 py-3 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  Staff Admin Login
                </button>
                <button 
                  onClick={() => navigateToLogin('MASTER')} 
                  className="text-xs font-bold text-purple-600 hover:text-white hover:bg-purple-600 uppercase tracking-widest flex items-center justify-center gap-2 border border-purple-200 px-6 py-3 rounded-xl transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  Master Admin Login
                </button>
              </div>
              <p className="text-[10px] text-gray-400 italic mt-2 text-center">Security tip: Always export your data in the 'System' tab before clearing browser cache.</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest font-bold gap-4 text-center">
           <span>&copy; {new Date().getFullYear()} {config.companyName}</span>
           <span className="bg-gray-100 px-4 py-1.5 rounded-full text-gray-600 border border-gray-200">
             Reg: {config.regNo} {config.tradeMark && ` | TM : ${config.tradeMark}`}
           </span>
           <span>HQ: {config.regAddress}</span>
           <div className="flex gap-4">
             <button onClick={() => navigateToLogin('ADMIN')} className="hover:text-blue-600">Admin Login</button>
             <span>|</span>
             <button onClick={() => navigateToLogin('MASTER')} className="hover:text-purple-600">Master Admin</button>
           </div>
        </div>
      </footer>

      {showInquiryForm && <InquiryForm config={config} initialServiceId={selectedServiceId} onClose={() => setShowInquiryForm(false)} onSubmit={handleInquirySubmit} />}
    </div>
  );
};

export default App;
