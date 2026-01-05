
import React, { useState, useEffect } from 'react';
import { Agent } from '../types';
import { Modal, Input, Button, Select } from './UI';
import { useAppContext } from '../context/AppContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, agent }) => {
  const { updateAgentWallet, formatPrice, addToast } = useAppContext();
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<'Credit' | 'Debit'>('Credit');
  const [description, setDescription] = useState('');

  // Reset form when modal opens or agent changes
  useEffect(() => {
    if (isOpen) {
      setAmount(0);
      setType('Credit');
      setDescription('');
    }
  }, [isOpen, agent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent || amount <= 0 || !description.trim()) {
        addToast("Please provide a valid amount and description.", "error");
        return;
    }
    if (type === 'Debit' && amount > agent.walletBalance) {
        addToast("Debit amount cannot exceed the agent's wallet balance.", "error");
        return;
    }

    updateAgentWallet(agent.id, amount, type, description);
    addToast(`Wallet for ${agent.agencyName} has been updated successfully.`);
    onClose();
  };

  if (!agent) return null;

  const inputStyle = "!rounded-lg bg-gray-50 border-gray-200 shadow-inner";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Wallet: ${agent.agencyName}`}>
      <form onSubmit={handleSubmit}>
        <div className="p-6 md:p-8 space-y-6 bg-gray-50/50">
            <div className="bg-white p-6 rounded-xl border border-gray-200 text-center shadow-inner">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Current Balance</p>
                <p className="text-4xl font-black text-primary tracking-tighter">{formatPrice(agent.walletBalance)}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Amount"
                  type="number"
                  value={amount === 0 ? '' : amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  min="0.01"
                  step="0.01"
                  className={inputStyle}
                  placeholder="e.g., 500000"
                />
                <Select
                  label="Transaction Type"
                  value={type}
                  onChange={(e) => setType(e.target.value as 'Credit' | 'Debit')}
                  options={[
                      { label: 'Credit (Add Funds)', value: 'Credit' }, 
                      { label: 'Debit (Deduct Funds)', value: 'Debit' }
                  ]}
                  className={inputStyle}
                />
            </div>
             <Input
                label="Description / Reference"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className={inputStyle}
                placeholder="e.g., Monthly top-up, Purchase refund..."
            />
        </div>
        <div className="bg-white p-4 flex justify-end gap-2 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="!rounded-lg">Cancel</Button>
          <Button type="submit" variant="primary" className="!rounded-lg">Confirm Transaction</Button>
        </div>
      </form>
    </Modal>
  );
};

export default WalletModal;