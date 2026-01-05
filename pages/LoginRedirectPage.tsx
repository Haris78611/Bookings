import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import HomePage from './HomePage';

const LoginRedirectPage: React.FC = () => {
    const { openAuthModal } = useAppContext();
    const location = useLocation();
    
    useEffect(() => {
        const mode = location.pathname.includes('signup') ? 'customer-signup' : 'customer-login';
        openAuthModal(mode);
    }, [openAuthModal, location.pathname]);
    
    return <HomePage />;
};

export default LoginRedirectPage;