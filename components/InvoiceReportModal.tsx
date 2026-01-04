
import React, { useState } from 'react';
import { Modal, Button, Select, Input } from './UI';
import { useAppContext } from '../context/AppContext';

interface InvoiceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceReportModal: React.FC<InvoiceReportModalProps> = ({ isOpen, onClose }) => {
  const { agencies } = useAppContext();
  const [agencyId, setAgencyId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleGenerate = () => {
    alert(`Generating invoice report for agency: ${agencyId} from ${startDate} to ${endDate}.`);
    onClose();
  };

  const agencyOptions = [{ value: 'all', label: 'All Agencies' }].concat(
    agencies.map(a => ({ value: a.id, label: a.agencyName }))
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Invoice Report">
      <div className="space-y-4">
        <Select
          label="Select Agency"
          value={agencyId}
          onChange={(e) => setAgencyId(e.target.value)}
          options={agencyOptions}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={handleGenerate}>Download PDF</Button>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceReportModal;
