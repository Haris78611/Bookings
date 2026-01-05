
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Card, Button, Input } from '../../components/UI';

const AdminLoginPage: React.FC = () => {
    const { setCurrentUser } = useAppContext();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ id: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (credentials.id.trim() === '990990' && credentials.password === 'Haris@1122@11') {
            setCurrentUser({
                id: 'ADM-1',
                name: 'System Administrator',
                email: 'admin@umrahstay.com',
                role: UserRole.ADMIN
            });
            navigate('/admin');
        } else {
            setError('Invalid administrative credentials. Access denied.');
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#005B5C]/5 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#006D77 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <Card className="w-full max-w-sm p-10 text-center relative z-10 border-none shadow-2xl rounded-2xl bg-white animate-in fade-in zoom-in-95 duration-500">
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-[#005B5C] mb-2 uppercase tracking-tighter">Control Desk</h2>
                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.3em]">Authorized Access Only</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                    <Input 
                        label="Admin Registry ID" 
                        placeholder="e.g. 990990" 
                        value={credentials.id} 
                        onChange={e => setCredentials({...credentials, id: e.target.value})} 
                    />
                    <Input 
                        label="Security Password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={credentials.password} 
                        onChange={e => setCredentials({...credentials, password: e.target.value})} 
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

export default AdminLoginPage;
