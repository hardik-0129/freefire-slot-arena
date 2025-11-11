
import React, { useState } from 'react';
import axios from 'axios';

interface VerifyOtpModalProps {
  email: string;
  onVerified: () => void;
  onClose: () => void;
}

const VerifyOtpModal: React.FC<VerifyOtpModalProps> = ({ email, onVerified, onClose }) => {
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setMsg('');
    if (!otp) {
      setMsg('Please enter OTP.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
        email,
        otp
      });
      setMsg(res.data.msg || 'OTP verified.');
      if (res.data.status) {
        setTimeout(() => {
          onVerified();
          setOtp('');
          setMsg('');
        }, 1000);
      }
    } catch (err: any) {
      setMsg(err.response?.data?.msg || 'Failed to verify OTP.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.45)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 18,
        padding: '36px 28px 28px 28px',
        minWidth: 540,
        maxWidth: 540,
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        position: 'relative',
        boxSizing: 'border-box',
        textAlign: 'center',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 18, background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#888', fontWeight: 700 }}>&times;</button>
        <h3 style={{ marginBottom: 18, color: '#FF8B00', textAlign: 'center', fontSize: 28, fontWeight: 800, letterSpacing: 1 }}>VERIFY OTP</h3>
        <div style={{ marginBottom: 16, color: '#666', fontSize: 16, textAlign: 'left' }}>Email: <b>{email || '(not entered)'}</b></div>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: '1px solid #fff', fontSize: 16 }}
        />
        {msg && <div style={{ color: msg.includes('verified') ? 'green' : 'red', marginBottom: 14, fontWeight: 600 }}>{msg}</div>}
        <button
          style={{ width: '100%', background: '#FF8B00', color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px rgba(255,139,0,0.08)' }}
          disabled={loading}
          onClick={handleVerify}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtpModal;


// Removed duplicate/erroneous code and extra export default
