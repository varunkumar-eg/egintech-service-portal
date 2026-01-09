
import React, { useState } from 'react';
import { Service, Inquiry, AppConfig } from '../types';

interface InquiryFormProps {
  config: AppConfig;
  initialServiceId?: string;
  onClose: () => void;
  onSubmit: (inquiry: Inquiry) => void;
}

const InquiryForm: React.FC<InquiryFormProps> = ({ config, initialServiceId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    email: '',
    serviceId: initialServiceId || (config.services[0]?.id || ''),
    description: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService = config.services.find(s => s.id === formData.serviceId);
  const totalAmount = selectedService?.price || 0;
  const advanceAmount = totalAmount * 0.5;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length + images.length > 12) {
      alert("Maximum 12 images allowed.");
      return;
    }

    const newImages: string[] = [];
    for (const file of files) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push(base64);
    }
    setImages([...images, ...newImages]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newInquiry: Inquiry = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      images,
      paymentDone: advanceAmount,
      status: 'Pending',
      timestamp: Date.now(),
    };

    const message = `Hello ${config.companyName || 'EGINTECH'}! I've submitted a new inquiry.%0A%0A` +
      `*Name:* ${formData.clientName}%0A` +
      `*Service:* ${selectedService?.name}%0A` +
      `*Advanced Paid:* ₹${advanceAmount}%0A` +
      `*Description:* ${formData.description}`;
    
    window.open(`https://wa.me/${config.adminPhone}?text=${message}`, '_blank');
    
    onSubmit(newInquiry);
    setIsSubmitting(false);
  };

  const inputClass = "w-full bg-gray-800 border-gray-700 text-yellow-400 placeholder-gray-500 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">New Service Inquiry</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input required type="text" placeholder="Your Name" className={inputClass} value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input required type="tel" placeholder="e.g. 9912345678" className={inputClass} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
            <select className={inputClass} value={formData.serviceId} onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}>
              {config.services.map(s => (
                <option key={s.id} value={s.id} className="bg-gray-800 text-white">{s.name} - ₹{s.price}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description of Work</label>
            <textarea required rows={4} placeholder="Tell us about your project requirements..." className={inputClass} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Images (Max 12)</label>
            <input type="file" multiple accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100" onChange={handleFileChange} />
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((img, i) => (
                <img key={i} src={img} className="w-16 h-16 object-cover rounded-lg border shadow-sm" alt="Preview" />
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total Project Value:</span>
              <span className="text-xl font-bold text-gray-800">₹{totalAmount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Minimum 50% Deposit Req.:</span>
              <span className="text-xl font-bold text-blue-600">₹{advanceAmount}</span>
            </div>
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-200">
            {isSubmitting ? 'Submitting...' : 'Submit Inquiry & Contact Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InquiryForm;
