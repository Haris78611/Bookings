
import React, { useState } from 'react';
import { PromoCode } from '../types';
import { Modal, Input, Button, Select } from './UI';

interface PromoCodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PromoCode, 'id'>) => void;
}

const PromoCodeFormModal: React.FC<PromoCodeFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || discount <= 0) {
      alert('Please fill in all fields correctly.');
      return;
    }
    onSubmit({ code, discount, type });
    onClose();
    // Reset form
    setCode('');
    setDiscount(0);
    setType('percentage');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Promo Code">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Promo Code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required />
        <Input label="Discount Value" type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} required />
        <Select
          label="Discount Type"
          value={type}
          onChange={e => setType(e.target.value as 'percentage' | 'fixed')}
          options={[
            { label: 'Percentage (%)', value: 'percentage' },
            { label: 'Fixed Amount', value: 'fixed' }
          ]}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Add Code</Button>
        </div>
      </form>
    </Modal>
  );
};

export default PromoCodeFormModal;
