
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button, Card, Select } from '../../components/UI';
import { PageHeader, RefreshButton, EmptyState, TableWrapper } from '../../components/AdminUI';
import InvoiceReportModal from '../../components/InvoiceReportModal';

const InvoicesPage: React.FC = () => {
  const { invoices, agencies, formatPrice } = useAppContext();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterAgencyId, setFilterAgencyId] = useState<string>('all');

  const filteredInvoices = useMemo(() => {
    if (filterAgencyId === 'all') {
      return invoices;
    }
    return invoices.filter(invoice => invoice.agencyId === filterAgencyId);
  }, [invoices, filterAgencyId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const agencyOptions = [{ value: 'all', label: 'All Agencies' }].concat(
    agencies.map(a => ({ value: a.id, label: a.agencyName }))
  );

  return (
    <>
      <PageHeader title="Transaction Invoices">
        <Button onClick={() => setIsReportModalOpen(true)} variant="primary" className="!rounded-lg">Generate Report</Button>
        <RefreshButton isRefreshing={isRefreshing} onClick={handleRefresh} />
      </PageHeader>
      
      <Card className="p-6 mb-8 border-none shadow-sm rounded-xl bg-white">
        <div className="w-full max-w-sm">
            <Select
              label="Filter by Agency"
              value={filterAgencyId}
              onChange={(e) => setFilterAgencyId(e.target.value)}
              options={agencyOptions}
              className="!rounded-lg"
            />
        </div>
      </Card>

      <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
        <TableWrapper>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b">
                <th className="py-4 px-6">Invoice ID</th>
                <th className="py-4 px-4">Agency</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Description</th>
                <th className="py-4 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(invoice => {
                const agency = agencies.find(a => a.id === invoice.agencyId);
                return (
                  <tr key={invoice.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="py-4 px-6 font-mono text-gray-500">{invoice.id}</td>
                    <td className="py-4 px-4 font-bold">{agency?.agencyName}</td>
                    <td className="py-4 px-4">{new Date(invoice.date).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <span className={`font-bold ${invoice.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {invoice.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">{invoice.description}</td>
                    <td className={`py-4 px-4 text-right font-bold ${invoice.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                       {invoice.type === 'Credit' ? '+' : '-'} {formatPrice(invoice.amount)}
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && <EmptyState message="No invoices found for the selected criteria." />}
            </tbody>
          </table>
        </TableWrapper>
      </Card>
      <InvoiceReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </>
  );
};

export default InvoicesPage;
