import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button, Card } from '../../components/UI';
import { PromoCode } from '../../types';
import { PageHeader, RefreshButton, EmptyState, TableWrapper } from '../../components/AdminUI';
import PromoCodeFormModal from '../../components/PromoCodeFormModal';

const PromoCodesPage: React.FC = () => {
    const { promoCodes, addPromoCode, deletePromoCode, formatPrice, addToast } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleSubmit = (data: Omit<PromoCode, 'id'>) => {
        // FIX: Object literal may only specify known properties, and 'id' does not exist in type 'Omit<PromoCode, "id">'. The addPromoCode function generates the ID internally.
        addPromoCode(data);
        addToast(`Promo code "${data.code}" created successfully.`);
    };
    
    const handleDelete = (code: PromoCode) => {
        if(window.confirm(`Are you sure you want to delete the promo code "${code.code}"?`)) {
            deletePromoCode(code.id);
            addToast(`Promo code "${code.code}" deleted.`, 'error');
        }
    }

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            addToast('Promo code data synchronized.');
        }, 800);
    };

    return (
        <>
            <PageHeader title="Promo Codes">
                <Button onClick={() => setIsModalOpen(true)} variant="primary" className="!rounded-lg">+ Add New Code</Button>
                <RefreshButton isRefreshing={isRefreshing} onClick={handleRefresh} />
            </PageHeader>
            <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
                <TableWrapper>
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b">
                                <th className="py-4 px-6">Code</th>
                                <th className="py-4 px-4">Discount</th>
                                <th className="py-4 px-4">Type</th>
                                <th className="py-4 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promoCodes.map(code => (
                                <tr key={code.id} className="border-b last:border-0 hover:bg-gray-50/50">
                                    <td className="py-4 px-6 font-mono font-bold text-secondary">{code.code}</td>
                                    <td className="py-4 px-4 font-bold text-primary">
                                        {code.type === 'percentage' ? `${code.discount}%` : formatPrice(code.discount)}
                                    </td>
                                    <td className="py-4 px-4 capitalize font-medium">{code.type}</td>
                                    <td className="py-4 px-4 text-right">
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(code)}
                                            className="!rounded-md"
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {promoCodes.length === 0 && <EmptyState message="No promo codes found." />}
                        </tbody>
                    </table>
                </TableWrapper>
            </Card>
            <PromoCodeFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
            />
        </>
    );
};

export default PromoCodesPage;