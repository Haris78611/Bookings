import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button, Card, Input, Select } from '../../components/UI';
import { SiteSettings, PromoCode } from '../../types';
import { PageHeader } from '../../components/AdminUI';

const SettingsPage: React.FC = () => {
  const { 
    siteSettings, setSiteSettings,
    promoCodes, addPromoCode, deletePromoCode, formatPrice, addToast,
    currencyRates, setCurrencyRates
  } = useAppContext();
  
  const [formState, setFormState] = useState<SiteSettings>(siteSettings);
  const [currencyForm, setCurrencyForm] = useState(currencyRates);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [newPromoCode, setNewPromoCode] = useState<Omit<PromoCode, 'id'>>({ code: '', discount: 10, type: 'percentage' });

  // Ensure local state is updated if context changes
  useEffect(() => setFormState(siteSettings), [siteSettings]);
  useEffect(() => setCurrencyForm(currencyRates), [currencyRates]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: name.includes('Fee') ? Number(value) : value }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrencyForm(prev => ({ ...prev, [name]: Number(value) || 0 }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'bannerImage') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormState(prev => ({ ...prev, [field]: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSiteSettings(formState);
    setCurrencyRates(currencyForm);
    addToast('Site settings have been updated successfully.');
  };
  
  const handleAddPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPromoCode.code && newPromoCode.discount > 0) {
        addPromoCode({ id: `PC-${Date.now()}`, ...newPromoCode });
        addToast(`Promo code "${newPromoCode.code}" added.`);
        setNewPromoCode({ code: '', discount: 10, type: 'percentage' });
    } else {
        addToast('Please enter a valid code and discount value.', 'error');
    }
  };

  const inputStyle = "!rounded-lg bg-gray-50 border-gray-200 shadow-inner";

  return (
    <>
      <PageHeader title="System Settings" />
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
            {/* General Settings */}
            <Card className="p-8 border-none shadow-sm rounded-xl bg-white">
                <h3 className="text-lg font-bold text-primary mb-6 border-b pb-4">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Website Name" name="name" value={formState.name} onChange={handleChange} className={inputStyle} />
                    <div>
                        <label className="block text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 ml-1">Logo</label>
                        <div className="flex items-center gap-4">
                            <img src={formState.logo} alt="Logo" className="w-16 h-16 rounded-full object-contain bg-gray-100 p-1 border" />
                            <input type="file" accept="image/*" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} className="hidden" />
                            <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()} className="!rounded-lg">Upload Logo</Button>
                        </div>
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 ml-1">Banner Image</label>
                        <div className="flex items-center gap-4">
                            <img src={formState.bannerImage} alt="Banner" className="w-32 h-16 rounded-lg object-cover bg-gray-100 border" />
                            <input type="file" accept="image/*" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'bannerImage')} className="hidden" />
                            <Button type="button" variant="outline" onClick={() => bannerInputRef.current?.click()} className="!rounded-lg">Upload Banner</Button>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 ml-1">Global Announcement</label>
                        <textarea name="announcement" value={formState.announcement} onChange={handleChange} rows={3} className="block w-full p-3 md:p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg shadow-inner focus:ring-0 focus:border-[#005B5C] focus:bg-white outline-none transition-all font-bold text-xs md:text-sm" placeholder="Use '|' to separate multiple messages..."></textarea>
                    </div>
                </div>
            </Card>

            {/* Contact & Social Media */}
            <Card className="p-8 border-none shadow-sm rounded-xl bg-white">
                <h3 className="text-lg font-bold text-primary mb-6 border-b pb-4">Contact & Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Contact Email" name="contactEmail" type="email" value={formState.contactEmail} onChange={handleChange} className={inputStyle} />
                    <Input label="Contact Phone" name="contactPhone" type="tel" value={formState.contactPhone} onChange={handleChange} className={inputStyle} />
                    <Input label="WhatsApp Number" name="whatsappNumber" type="tel" value={formState.whatsappNumber} onChange={handleChange} className={inputStyle} />
                    <Input label="Facebook URL" name="facebookUrl" type="url" value={formState.facebookUrl} onChange={handleChange} className={inputStyle} />
                    <Input label="Instagram URL" name="instagramUrl" type="url" value={formState.instagramUrl} onChange={handleChange} className={inputStyle} />
                    <Input label="Twitter URL" name="twitterUrl" type="url" value={formState.twitterUrl || ''} onChange={handleChange} className={inputStyle} />
                    <div className="md:col-span-2">
                        <Input label="Office Address" name="contactAddress" value={formState.contactAddress} onChange={handleChange} className={inputStyle} />
                    </div>
                </div>
            </Card>
            
            {/* Financial Settings */}
            <Card className="p-8 border-none shadow-sm rounded-xl bg-white">
              <h3 className="text-lg font-bold text-primary mb-6 border-b pb-4">Financial Settings</h3>
              <div className="space-y-6">
                  <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-3">Booking Fees</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input label="Cancellation Fee (%)" name="cancellationFee" type="number" value={formState.cancellationFee} onChange={handleChange} className={inputStyle} />
                          <Input label="Date Change Fee (%)" name="dateChangeFee" type="number" value={formState.dateChangeFee} onChange={handleChange} className={inputStyle} />
                      </div>
                  </div>
                  <div className="pt-6 border-t">
                      <h4 className="text-sm font-bold text-gray-700 mb-3">Currency Conversion Rates</h4>
                      <p className="text-xs text-gray-500 mb-4">Set how many Pakistani Rupees (PKR) are equivalent to 1 unit of the foreign currency.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input label="PKR per 1 SAR" name="SAR" type="number" step="0.01" value={currencyForm.SAR} onChange={handleCurrencyChange} className={inputStyle} />
                          <Input label="PKR per 1 USD" name="USD" type="number" step="0.01" value={currencyForm.USD} onChange={handleCurrencyChange} className={inputStyle} />
                      </div>
                  </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end sticky bottom-8">
                <Button type="submit" variant="secondary" size="lg" className="!rounded-lg shadow-2xl">Save All Settings</Button>
            </div>
        </div>
      </form>
      
      {/* Promo Code Management */}
      <div className="mt-8">
        <Card className="p-8 border-none shadow-sm rounded-xl bg-white">
            <h3 className="text-lg font-bold text-primary mb-6 border-b pb-4">Promo Code Management</h3>
            <form onSubmit={handleAddPromoCode} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end mb-8">
                <Input label="New Code" value={newPromoCode.code} onChange={(e) => setNewPromoCode({...newPromoCode, code: e.target.value.toUpperCase()})} className={inputStyle} placeholder="RAMADAN25" />
                <Input label="Discount" type="number" value={newPromoCode.discount} onChange={(e) => setNewPromoCode({...newPromoCode, discount: Number(e.target.value)})} className={inputStyle} />
                <Select label="Type" value={newPromoCode.type} onChange={(e) => setNewPromoCode({...newPromoCode, type: e.target.value as 'percentage' | 'fixed'})} options={[{label: 'Percentage %', value: 'percentage'}, {label: 'Fixed Amount', value: 'fixed'}]} className={inputStyle} />
                <Button type="submit" variant="primary" className="!rounded-lg h-14">Add Code</Button>
            </form>
             <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
               {promoCodes.length > 0 ? promoCodes.map(promo => (
                    <div key={promo.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                        <div>
                            <p className="font-mono font-bold text-secondary">{promo.code}</p>
                            <p className="text-sm text-gray-600">
                                Discount: {promo.type === 'percentage' ? `${promo.discount}%` : `${formatPrice(promo.discount)}`}
                            </p>
                        </div>
                        <Button variant="danger" size="sm" className="!rounded-md" onClick={() => deletePromoCode(promo.id)}>Delete</Button>
                    </div>
               )) : <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest py-8">No Promo Codes Created.</p>}
            </div>
        </Card>
      </div>
    </>
  );
};

export default SettingsPage;