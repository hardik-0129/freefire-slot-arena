import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ResetPasswordModalProps {
  email: string;
  onClose: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ email, onClose }) => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  // const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    // setMsg('');
    if (!otp || !newPassword) {
      toast.error('Please enter OTP and new password.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password-otp`, {
        email,
        otp,
        newPassword
      });
      if (res.data.status) {
        toast.success(res.data.msg || 'Password reset successful.');
        setTimeout(() => {
          onClose();
          setOtp('');
          setNewPassword('');
        }, 1500);
      } else {
        toast.error(res.data.msg || 'Password reset failed.');
      }
    } catch (err: any) {
  toast.error(err.response?.data?.msg || 'Failed to reset password.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, minWidth: 320, maxWidth: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
        <h6 style={{ marginBottom: 16, color: '#FF8B00', textAlign: 'center' }}>Reset Password</h6>
        <div style={{ marginBottom: 10, color: '#666', fontSize: 15 }}>Email: <b>{email || '(not entered)'}</b></div>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Enter New Password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
  {/* Toast notifications will show messages */}
        <button
          style={{ width: '100%', background: '#FF8B00', color: '#fff', border: 'none', borderRadius: 6, padding: 10, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
          disabled={loading}
          onClick={handleReset}
        >
          {loading ? 'Processing...' : 'Reset Password'}
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
