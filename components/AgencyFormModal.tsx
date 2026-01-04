import React, { useState, useEffect } from 'react';
import { Agent } from '../types';
import { Modal, Input, Button, Select } from './UI';

interface AgencyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (agencyData: Partial<Agent>) => void;
  agency?: Agent | null;
}

const AgencyFormModal: React.FC<AgencyFormModalProps> = ({ isOpen, onClose, onSubmit, agency }) => {
  const [formData, setFormData] = useState({
    agencyName: '',
    email: '',
    // Fix: Add type assertion to ensure status is of the correct union type.
    status: 'Active' as 'Active' | 'Inactive',
  });

  useEffect(() => {
    if (agency) {
      setFormData({
        agencyName: agency.agencyName,
        email: agency.email,
        status: agency.status,
      });
    } else {
      // Fix: Add type assertion here too for consistency on reset.
      setFormData({ agencyName: '', email: '', status: 'Active' as 'Active' | 'Inactive' });
    }
  }, [agency, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Fix: Handle 'status' separately to cast the value to the correct type.
    if (name === 'status') {
      setFormData(prev => ({ ...prev, status: value as 'Active' | 'Inactive' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={agency ? 'Edit Agency' : 'Add New Agency'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="agencyName" label="Agency Name" value={formData.agencyName} onChange={handleChange} required />
        <Input name="email" label="Contact Email" type="email" value={formData.email} onChange={handleChange} required />
        <Select
          name="status"
          label="Status"
          value={formData.status}
          onChange={handleChange}
          options={[{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }]}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">{agency ? 'Save Changes' : 'Create Agency'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AgencyFormModal;