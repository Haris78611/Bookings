import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Modal, Input, Button } from './UI';
import { useNavigate } from 'react-router-dom';

const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, closeAuthModal, authMode, setAuthMode,
    customerLogin, customerSignUp, agentLogin
  } = useAppContext();
  
  const navigate = useNavigate();

  // Customer State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  
  // Agent State
  const [agencyId, setAgencyId] = useState('');
  const [agentPassword, setAgentPassword] = useState('');
  
  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(customerLogin(customerEmail, customerPassword)) {
        navigate('/my-bookings');
    }
  };
  
  const handleCustomerSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if(customerSignUp(customerName, customerEmail, customerPassword)) {
        navigate('/my-bookings');
    }
  };
  
  const handleAgentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(agentLogin(agencyId, agentPassword)) {
        navigate('/agent');
    }
  };

  const inputStyle = "!rounded-lg bg-gray-50 border-gray-200 shadow-inner";

  const renderContent = () => {
    switch (authMode) {
      case 'customer-signup':
        return (
          <form onSubmit={handleCustomerSignUp} className="space-y-4">
            <Input label="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} required className={inputStyle} />
            <Input label="Email Address" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} required className={inputStyle} />
            <Input label="Password" type="password" value={customerPassword} onChange={e => setCustomerPassword(e.target.value)} required className={inputStyle} />
            <Button type="submit" fullWidth size="lg" className="!rounded-lg mt-4">Create Account</Button>
          </form>
        );
      case 'agent-login':
        return (
          <form onSubmit={handleAgentLogin} className="space-y-4">
            <Input label="Agency ID" value={agencyId} onChange={e => setAgencyId(e.target.value)} required className={inputStyle} />
            <Input label="Password" type="password" value={agentPassword} onChange={e => setAgentPassword(e.target.value)} required className={inputStyle} />
            <Button type="submit" fullWidth size="lg" className="!rounded-lg mt-4">Agent Login</Button>
          </form>
        );
      case 'customer-login':
      default:
        return (
          <form onSubmit={handleCustomerLogin} className="space-y-4">
            <Input label="Email Address" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} required className={inputStyle} />
            <Input label="Password" type="password" value={customerPassword} onChange={e => setCustomerPassword(e.target.value)} required className={inputStyle} />
            <Button type="submit" fullWidth size="lg" className="!rounded-lg mt-4">Login</Button>
          </form>
        );
    }
  };

  return (
    <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal} title="Portal Authentication">
      <div className="bg-gray-50/50">
        <div className="p-6 border-b border-gray-100 flex items-center justify-center gap-2">
          {['customer-login', 'customer-signup'].includes(authMode) ? (
            <>
              <Button size="sm" variant={authMode === 'customer-login' ? 'primary' : 'outline'} onClick={() => setAuthMode('customer-login')} className="!rounded-full flex-1">Customer Login</Button>
              <Button size="sm" variant={authMode === 'customer-signup' ? 'primary' : 'outline'} onClick={() => setAuthMode('customer-signup')} className="!rounded-full flex-1">Sign Up</Button>
            </>
          ) : (
            <p className="text-sm font-bold text-primary">Agent Portal Access</p>
          )}
        </div>
        <div className="p-6 md:p-8">
            {renderContent()}
        </div>
        <div className="bg-white p-4 border-t text-center">
            {['customer-login', 'customer-signup'].includes(authMode) ? (
                <button onClick={() => setAuthMode('agent-login')} className="text-xs font-bold text-gray-400 hover:text-primary transition-all">
                    Are you an Agent?
                </button>
            ) : (
                <button onClick={() => setAuthMode('customer-login')} className="text-xs font-bold text-gray-400 hover:text-primary transition-all">
                    Are you a Customer?
                </button>
            )}
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;