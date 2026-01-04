
import React, { useState } from 'react';
import { Modal, Button, Select, Input } from './UI';

interface ReportGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportGenerationModal: React.FC<ReportGenerationModalProps> = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState('bookings');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleGenerate = () => {
    alert(`Generating ${reportType} report from ${startDate} to ${endDate}.`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate System Report">
      <div className="space-y-4">
        <Select
          label="Report Type"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          options={[
            { value: 'bookings', label: 'Bookings Report' },
            { value: 'financials', label: 'Financials Report' },
            { value: 'agencies', label: 'Agencies Performance' },
          ]}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={handleGenerate}>Generate Report</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportGenerationModal;
