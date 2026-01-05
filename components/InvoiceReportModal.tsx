
import React, { useState } from 'react';
import { Modal, Button, Select } from './UI';
import { useAppContext } from '../context/AppContext';
import { Invoice } from '../types';

// jsPDF is loaded from CDN
declare const jspdf: any;

interface InvoiceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TimeRange = '7d' | '30d' | 'month' | 'year' | 'all';

const InvoiceReportModal: React.FC<InvoiceReportModalProps> = ({ isOpen, onClose }) => {
  const { invoices, agencies, formatPrice, addToast } = useAppContext();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('all');

  const handleDownloadPdf = () => {
    // 1. Filter invoices
    const now = new Date();
    let startDate = new Date(0); // A very old date for 'all' time

    if (timeRange !== 'all') {
        switch (timeRange) {
            case '7d': startDate = new Date(); startDate.setDate(now.getDate() - 7); break;
            case '30d': startDate = new Date(); startDate.setDate(now.getDate() - 30); break;
            case 'month': startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
            case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
        }
    }

    const filteredInvoices = invoices.filter(inv => {
        const agencyMatch = selectedAgencyId === 'all' || inv.agencyId === selectedAgencyId;
        const dateMatch = timeRange === 'all' || new Date(inv.date) >= startDate;
        return agencyMatch && dateMatch;
    });

    if (filteredInvoices.length === 0) {
        addToast('No data found for the selected criteria.', 'error');
        return;
    }

    // 2. Setup PDF
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    const selectedAgency = agencies.find(a => a.id === selectedAgencyId);
    const reportTitle = selectedAgency ? `${selectedAgency.agencyName}` : 'All Agencies';

    // 3. Add content to PDF
    doc.setFontSize(20);
    doc.text("Agency Transaction Report", 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Agency: ${reportTitle}`, 14, 32);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);

    const totalCredit = filteredInvoices.filter(i => i.type === 'Credit').reduce((sum, i) => sum + i.amount, 0);
    const totalDebit = filteredInvoices.filter(i => i.type === 'Debit').reduce((sum, i) => sum + i.amount, 0);

    doc.setFontSize(10);
    doc.text(`Total Credit: ${formatPrice(totalCredit)}`, 14, 50);
    doc.text(`Total Debit: ${formatPrice(totalDebit)}`, 14, 56);
    doc.text(`Net Change: ${formatPrice(totalCredit - totalDebit)}`, 14, 62);
    
    const tableColumn = ["Date", "Invoice ID", "Agency", "Description", "Type", "Amount"];
    const tableRows: (string | number)[][] = [];

    filteredInvoices.forEach(invoice => {
        const agency = agencies.find(a => a.id === invoice.agencyId);
        const invoiceData = [
            new Date(invoice.date).toLocaleDateString(),
            invoice.id,
            agency ? agency.agencyName.substring(0, 25) : 'N/A',
            invoice.description,
            invoice.type,
            `${invoice.type === 'Credit' ? '+' : '-'}${formatPrice(invoice.amount)}`,
        ];
        tableRows.push(invoiceData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        theme: 'grid',
        headStyles: { fillColor: [0, 109, 119] },
    });

    doc.save(`invoice-report-${selectedAgencyId}-${timeRange}.pdf`);
    onClose();
  };

  const agencyOptions = [{ value: 'all', label: 'All Agencies' }].concat(
    agencies.map(a => ({ value: a.id, label: a.agencyName }))
  );

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  const inputStyle = "!rounded-lg bg-gray-50 border-gray-200 shadow-inner";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Invoice Report">
      <div className="p-6 md:p-8 space-y-6 bg-gray-50/50">
        <Select
          label="Select Agency"
          value={selectedAgencyId}
          onChange={(e) => setSelectedAgencyId(e.target.value)}
          options={agencyOptions}
          className={inputStyle}
        />
        <Select
          label="Select Time Range"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          options={timeRangeOptions}
          className={inputStyle}
        />
      </div>
      <div className="bg-white p-4 flex justify-end gap-2 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="!rounded-lg">Cancel</Button>
          <Button onClick={handleDownloadPdf} variant="primary" className="!rounded-lg">
              Generate & Download
          </Button>
      </div>
    </Modal>
  );
};

export default InvoiceReportModal;