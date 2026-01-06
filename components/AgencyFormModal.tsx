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
  const getInitialState = () => ({
    agencyName: agency?.agencyName || '',
    email: agency?.email || '',
    status: agency?.status || 'Active',
    password: '', // Always start with an empty password field
    iataCode: agency?.iataCode || '',
    contactNumber: agency?.contactNumber || '',
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    // Reset form state when modal opens or agency data changes
    if (isOpen) {
      setFormData(getInitialState());
    }
  }, [agency, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData: Partial<Agent> = { ...formData };
    if (!submissionData.password) {
      delete submissionData.password; // Don't send empty password to update
    }
    onSubmit(submissionData);
  };

  const inputStyle = "!rounded-lg bg-gray-50 border-gray-200 shadow-inner";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={agency ? 'Edit Agency Profile' : 'Add New Agency'} size="xl">
      <form onSubmit={handleSubmit}>
        <div className="p-6 md:p-8 space-y-6 bg-gray-50/50">
          <Input
            label="Agency Name"
            name="agencyName"
            value={formData.agencyName}
            onChange={handleChange}
            className={inputStyle}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contact Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={inputStyle}
                required
              />
              <Input
                label="Contact Number"
                name="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={handleChange}
                className={inputStyle}
              />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="IATA Code (Optional)"
                name="iataCode"
                value={formData.iataCode}
                onChange={handleChange}
                className={inputStyle}
              />
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputStyle}
                options={[{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }]}
              />
          </div>
          <Input
            label="Set Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className={inputStyle}
            placeholder={agency ? 'Leave blank to keep current password' : ''}
            required={!agency}
          />
        </div>
        <div className="bg-white p-4 flex justify-end gap-2 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="!rounded-lg">Cancel</Button>
          <Button type="submit" variant="primary" className="!rounded-lg">{agency ? 'Save Changes' : 'Create Agency'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AgencyFormModal;