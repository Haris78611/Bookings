
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button, Card, Input } from '../components/UI';

const AgentSettingsPage: React.FC = () => {
    const { currentUser, agencies, updateAgency, addToast } = useAppContext();
    const agent = agencies.find(a => a.id === currentUser?.agencyId);

    const [form, setForm] = useState({ 
        agencyName: '', 
        email: '', 
        contactNumber: '',
        iataCode: ''
    });

    useEffect(() => { 
        if(agent) {
            setForm({ 
                agencyName: agent.agencyName, 
                email: agent.email, 
                contactNumber: agent.contactNumber || '',
                iataCode: agent.iataCode || ''
            }); 
        }
    }, [agent]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(agent) {
            updateAgency({ ...agent, ...form });
            addToast("Your agency settings have been updated.", 'success');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    if (!agent) return <p>Loading agent details...</p>;
    
    if (agent.status === 'Inactive') {
        return (
            <Card className="p-12 rounded-lg shadow-lg text-center bg-red-50 border border-red-200">
                <h1 className="text-2xl font-bold text-red-600">Account Inactive</h1>
                <p className="text-gray-600 mt-2">Your agency account is currently inactive. Please contact administration for assistance.</p>
            </Card>
        );
    }

    const inputStyle = "!rounded-lg bg-gray-50 border-gray-200 shadow-inner";

    return (
      <Card className="p-8 border-none shadow-sm rounded-xl bg-white max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b pb-6 mb-6">
            <h2 className="text-xl font-semibold text-primary">My Agency Profile</h2>
            <p className="text-sm text-gray-500 mt-2">This information will be displayed on vouchers for bookings made by your agency.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
                label="Agency Name" 
                name="agencyName" 
                value={form.agencyName} 
                onChange={handleChange} 
                className={inputStyle} 
                required 
            />
            <Input 
                label="Agency ID" 
                name="agencyId" 
                value={agent.id} 
                className={inputStyle + " !bg-gray-200/50 !text-gray-500"} 
                disabled 
                readOnly
            />
          </div>

          <Input 
            label="IATA Code" 
            name="iataCode" 
            value={form.iataCode} 
            onChange={handleChange} 
            className={inputStyle} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
                label="Contact Email" 
                name="email" 
                type="email"
                value={form.email} 
                onChange={handleChange} 
                className={inputStyle} 
                required 
            />
            <Input 
                label="Contact Number" 
                name="contactNumber" 
                type="tel"
                value={form.contactNumber} 
                onChange={handleChange} 
                className={inputStyle} 
                required 
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="secondary" className="!rounded-lg">
                Save Changes
            </Button>
          </div>
        </form>
      </Card>
    );
};

export default AgentSettingsPage;
