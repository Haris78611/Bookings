
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Button, Card, Badge } from '../../components/UI';
import { Agent } from '../../types';
import AgencyFormModal from '../../components/AgencyFormModal';
import WalletModal from '../../components/WalletModal';
import { PageHeader, RefreshButton, EmptyState, TableWrapper } from '../../components/AdminUI';

const AgenciesPage: React.FC = () => {
    const { agencies, addAgency, updateAgency, formatPrice } = useAppContext();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isWalletModalOpen, setWalletModalOpen] = useState(false);
    const [selectedAgency, setSelectedAgency] = useState<Agent | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleOpenForm = (agency: Agent | null = null) => { setSelectedAgency(agency); setFormModalOpen(true); };
    const handleOpenWallet = (agency: Agent) => { setSelectedAgency(agency); setWalletModalOpen(true); };
    
    const handleSubmit = (agencyData: Partial<Agent>) => {
      if (selectedAgency) {
        updateAgency({ ...selectedAgency, ...agencyData } as Agent);
      } else {
        addAgency({ id: `AG-${Date.now()}`, walletBalance: 0, status: 'Active', ...agencyData } as Agent);
      }
      setFormModalOpen(false);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 800);
    };

    return (
        <>
            <PageHeader title="Agency Management">
                <Button onClick={() => handleOpenForm()} variant="primary" className="!rounded-lg">+ Add New Agency</Button>
                <RefreshButton isRefreshing={isRefreshing} onClick={handleRefresh} />
            </PageHeader>
            <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
                <TableWrapper>
                    <table className="w-full text-left text-xs">
                        <thead><tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b"><th className="py-4 px-6">Agency</th><th className="py-4 px-4">Wallet Balance</th><th className="py-4 px-4">Status</th><th className="py-4 px-4 text-right">Actions</th></tr></thead>
                        <tbody>
                            {agencies.map(a => (
                                <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50/50">
                                    <td className="py-4 px-6"><p className="font-bold text-gray-800">{a.agencyName}</p><p className="text-[10px] text-gray-400 font-mono">{a.id}</p></td>
                                    <td className="py-4 px-4 font-bold text-primary">{formatPrice(a.walletBalance)}</td>
                                    <td className="py-4 px-4"><Badge variant={a.status === 'Active' ? 'success' : 'danger'}>{a.status}</Badge></td>
                                    <td className="py-4 px-4 text-right font-bold text-xs space-x-2">
                                        <Link to={`/admin/bookings?agencyId=${a.id}`} className="inline-block bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-md font-black uppercase tracking-widest text-[10px]">Bookings</Link>
                                        <Button size="sm" variant="outline" className="!rounded-md" onClick={() => handleOpenForm(a)}>Edit</Button>
                                        <Button size="sm" variant="secondary" className="!rounded-md" onClick={() => handleOpenWallet(a)}>Wallet</Button>
                                    </td>
                                </tr>
                            ))}
                             {agencies.length === 0 && <EmptyState message="No agencies found." />}
                        </tbody>
                    </table>
                </TableWrapper>
            </Card>
            <AgencyFormModal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} onSubmit={handleSubmit} agency={selectedAgency} />
            <WalletModal isOpen={isWalletModalOpen} onClose={() => setWalletModalOpen(false)} agent={selectedAgency} />
        </>
    );
};

export default AgenciesPage;
