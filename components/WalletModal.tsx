
import React, { useState } from 'react';
import { Agent } from '../types';
import { Modal, Input, Button, Select } from './UI';
import { useAppContext } from '../context/AppContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, agent }) => {
  const { updateAgentWallet, formatPrice } = useAppContext();
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<'Credit' | 'Debit'>('Credit');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent || amount <= 0) return;
    updateAgentWallet(agent.id, amount, type, description);
    onClose();
  };

  if (!agent) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Wallet for ${agent.agencyName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="text-2xl font-bold text-primary">{formatPrice(agent.walletBalance)}</p>
        </div>
        <Select
          label="Transaction Type"
          value={type}
          onChange={(e) => setType(e.target.value as 'Credit' | 'Debit')}
          options={[{ label: 'Credit (Add Funds)', value: 'Credit' }, { label: 'Debit (Deduct Funds)', value: 'Debit' }]}
        />
        <Input
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />
        <Input
          label="Description / Reference"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Confirm Transaction</Button>
        </div>
      </form>
    </Modal>
  );
};

export default WalletModal;
