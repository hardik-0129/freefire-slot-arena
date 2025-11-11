import React, { useState } from 'react';
import VerifyOtpModal from '../components/VerifyOtpModal';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const ForgotPasswordFlow: React.FC = () => {
    const [showVerifyOtp, setShowVerifyOtp] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [email, setEmail] = useState('');

    // Example: call this when user clicks "Forgot Password?"
    const handleForgotClick = () => {
        if (!email) return alert('Please enter your email first.');
        setShowVerifyOtp(true);
    };

    return (
        <div>
            {/* Example email input */}
            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #fff', width: '100%' }}
            />
            <button
                onClick={handleForgotClick}
                style={{ background: '#FF8B00', color: '#fff', border: 'none', borderRadius: 6, padding: 10, fontWeight: 600, fontSize: 16, cursor: 'pointer', width: '100%' }}
            >
                Forgot Password?
            </button>

            {showVerifyOtp && (
                <VerifyOtpModal
                    email={email}
                    onVerified={() => {
                        setShowVerifyOtp(false);
                        setShowResetModal(true);
                    }}
                    onClose={() => setShowVerifyOtp(false)}
                />
            )}

            {showResetModal && (
                <ForgotPasswordModal
                    email={email}
                    onClose={() => setShowResetModal(false)} onOtpVerified={function (): void {
                        throw new Error('Function not implemented.');
                    }} />
            )}
        </div>
    );
};

export default ForgotPasswordFlow;
