
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ForgotPasswordModalProps {
  email: string;
  onOtpVerified: () => void;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ email, onOtpVerified, onClose }) => {
  const [otp, setOtp] = useState('');
  // const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    // setMsg('');
    if (!otp) {
      toast.error('Please enter OTP.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
        email,
        otp
      });
      if (res.data.status) {
        toast.success(res.data.msg || 'OTP verified.');
        setTimeout(() => {
          onOtpVerified();
          setOtp('');
        }, 1000);
      } else {
        toast.error(res.data.msg || 'OTP verification failed.');
      }
    } catch (err: any) {
  toast.error(err.response?.data?.msg || 'Failed to verify OTP.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, minWidth: 520, maxHeight: 540, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
        <h3 style={{ marginBottom: 16, color: '#FF8B00', textAlign: 'center' }}>Verify OTP</h3>
        <div style={{ marginBottom: 10, color: '#666', fontSize: 15 }}>Email: <b>{email || '(not entered)'}</b></div>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #fff' }}
        />
  {/* Toast notifications will show messages */}
        <button
          style={{ width: '100%', background: '#FF8B00', color: '#fff', border: 'none', borderRadius: 6, padding: 10, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
          disabled={loading}
          onClick={handleVerifyOtp}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
