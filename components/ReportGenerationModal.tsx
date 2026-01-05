
import React, { useState } from 'react';
import { Agent, Booking } from '../types';
import { useAppContext } from '../context/AppContext';
import { Modal, Button, Select } from './UI';

// jsPDF and jsPDF-AutoTable are loaded from CDN in index.html
// We can assume they are available on the window object.

interface ReportGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: Agent;
}

type TimeRange = '7d' | '30d' | 'month' | 'year';

const ReportGenerationModal: React.FC<ReportGenerationModalProps> = ({ isOpen, onClose, agent }) => {
    const { bookings, formatPrice } = useAppContext();
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');

    const getFilteredBookings = (): Booking[] => {
        const agentBookings = bookings.filter(b => b.agencyId === agent.id);
        const now = new Date();
        let startDate = new Date();

        switch (timeRange) {
            case '7d': startDate.setDate(now.getDate() - 7); break;
            case '30d': startDate.setDate(now.getDate() - 30); break;
            case 'month': startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
            case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
        }

        return agentBookings.filter(b => new Date(b.checkIn) >= startDate);
    };

    const handleDownloadPdf = () => {
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF();
        
        const filteredData = getFilteredBookings();
        const totalRevenue = filteredData.reduce((sum, booking) => sum + booking.totalPrice, 0);

        // Header
        doc.setFontSize(20);
        doc.text("Agency Performance Report", 14, 22);
        
        // Agency Info
        doc.setFontSize(12);
        doc.text(`Agency: ${agent.agencyName} (ID: ${agent.id})`, 14, 32);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);

        // Summary
        doc.setFontSize(10);
        doc.text(`Total Bookings: ${filteredData.length}`, 14, 50);
        doc.text(`Total Revenue: ${formatPrice(totalRevenue)}`, 14, 56);
        doc.text(`Current Wallet Balance: ${formatPrice(agent.walletBalance)}`, 14, 62);
        
        // Table
        const tableColumn = ["Booking ID", "Guest", "Hotel", "Check-in", "Price", "Status"];
        const tableRows: (string | number)[][] = [];

        filteredData.forEach(booking => {
            const bookingData = [
                booking.id,
                booking.guestName,
                booking.hotelName.substring(0, 25), // Truncate for space
                booking.checkIn,
                formatPrice(booking.totalPrice),
                booking.status,
            ];
            tableRows.push(bookingData);
        });
        
        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 70,
            theme: 'grid',
            headStyles: { fillColor: [0, 109, 119] },
        });

        doc.save(`report-${agent.id}-${timeRange}.pdf`);
        onClose();
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate Agency Report">
          <div className="p-6 md:p-8 space-y-6 bg-gray-50/50">
            <p className="text-sm text-gray-500">Generate a PDF performance report for <span className="font-bold text-primary">{agent.agencyName}</span>.</p>
            <Select
              label="Select Time Range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              options={[
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
                { value: 'month', label: 'This Month' },
                { value: 'year', label: 'This Year' },
              ]}
              className="!rounded-lg bg-white border-gray-200 shadow-inner"
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

export default ReportGenerationModal;
