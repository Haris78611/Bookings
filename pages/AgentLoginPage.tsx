
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import { Card, Button, Input } from '../components/UI';

const AgentLoginPage: React.FC = () => {
    const { setCurrentUser, agencies, addToast } = useAppContext();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ agencyId: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const agency = agencies.find(a => a.id === credentials.agencyId.trim() && a.password === credentials.password);

        if (agency) {
            setCurrentUser({
                id: `USER-${agency.id}`,
                name: agency.agencyName,
                email: agency.email,
                role: UserRole.AGENT,
                agencyId: agency.id
            });
            navigate('/agent');
        } else {
            const errText = 'Invalid Agency ID or password. Access denied.';
            addToast(errText, 'error');
            setError(errText);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#005B5C]/5 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#006D77 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <Card className="w-full max-w-sm p-10 text-center relative z-10 border-none shadow-2xl rounded-2xl bg-white animate-in fade-in zoom-in-95 duration-500">
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-[#005B5C] mb-2 uppercase tracking-tighter">Agent Portal</h2>
                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.3em]">Partner Access</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                    <Input 
                        label="Agency ID" 
                        placeholder="e.g. 1234"
                        value={credentials.agencyId} 
                        onChange={e => setCredentials({...credentials, agencyId: e.target.value})} 
                        required
                    />
                    <Input 
                        label="Security Password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={credentials.password} 
                        onChange={e => setCredentials({...credentials, password: e.target.value})} 
                        required
                    />
                    
                    {error && <p className="text-red-500 text-xs font-semibold text-center pt-2">{error}</p>}
                    
                    <div className="pt-4">
                        <Button type="submit" fullWidth variant="primary" size="lg" className="h-14">Secure Login</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AgentLoginPage;
