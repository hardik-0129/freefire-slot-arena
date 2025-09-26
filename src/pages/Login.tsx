import React, { useState, useEffect, useRef } from 'react';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import ResetPasswordModal from '@/components/ResetPasswordModal';
import axios from 'axios';
import { getDeviceToken } from '../utils/deviceToken';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import "../components/css/Contect.css"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // OTP login state
  // 2-step: email+password -> send OTP -> verify
  const [otp, setOtp] = useState('');
  const [otpPhase, setOtpPhase] = useState<'idle' | 'sent'>('idle');
  const [otpMethod, setOtpMethod] = useState<'email' | 'totp' | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  // Check if user was redirected from a protected page
  useEffect(() => {
    if (location.state?.from) {
      setMessage('Please log in to access this page.');
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const deviceToken = await getDeviceToken();
      if (otpPhase === 'idle') {
        // Try normal login (server will send OTP if 2FA enabled)
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { ...form, deviceToken });
        if (res.data?.otpRequired) {
          toast.success('OTP sent to your email');
          setOtpPhase('sent');
          setOtpMethod(res.data.method || 'email');
          setShowOtpModal(true);
        } else if (res.data?.token) {
          toast.success('Login successful!');
          localStorage.setItem('token', res.data.token);
          setForm({ email: '', password: '' });
          setTimeout(() => navigate('/tournament'), 800);
        } else {
          toast.error(res.data?.message || 'Login failed.');
        }
      } else if (otpPhase === 'sent') {
        // Step 2: verify OTP (email or totp)
        let res;
        const code = otpDigits.join('') || otp;
        if (otpMethod === 'totp') {
          res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login/totp-verify`, { email: form.email, token: code, deviceToken });
        } else {
          res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login/verify-otp`, { email: form.email, otp: code, deviceToken });
        }
        if (res.data.token) {
          toast.success('Login successful!');
          localStorage.setItem('token', res.data.token);
          setForm({ email: '', password: '' });
          setOtp(''); setOtpPhase('idle'); setOtpMethod(null); setShowOtpModal(false); setOtpDigits(['','','','','','']);
          setTimeout(() => navigate('/tournament'), 800);
        } else {
          toast.error(res.data.message || 'OTP verification failed.');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed.');
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <section className="py-16 login-section container">
        <div className="login-form login-form-bordered">
          <h2 className="contact-title">LOGIN FORM</h2>

          <form className="contact-form contact-form-login" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address :</label>
              <input
                className="input-shadow"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password :</label>
              <input
                className="input-shadow"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={otpPhase !== 'idle'}
              />
            </div>

            {otpPhase === 'sent' && showOtpModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <div style={{ width: 520, maxWidth: '92vw', background: '#fff', padding: '24px 18px', borderRadius: 16, boxShadow: '0 14px 34px rgba(0,0,0,.25)' }}>
                    <h3 style={{ margin: 0, textAlign: 'center', fontWeight: 800, color: '#111', fontSize: 22 }}>Verify Your OTP</h3>
                    <p style={{ margin: '8px 0 16px', textAlign: 'center', color: '#666' }}>{otpMethod === 'totp' ? 'Enter the 6-digit code from your Authenticator app.' : 'Enter the 6-digit OTP sent to your email.'}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
                      {otpDigits.map((d, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          value={d}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                            const next = [...otpDigits];
                            next[i] = val;
                            setOtpDigits(next);
                            if (val && i < 5) otpRefs.current[i + 1]?.focus();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
                              otpRefs.current[i - 1]?.focus();
                            }
                          }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder=""
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 10,
                            border: '1.5px solid #d6d6d6',
                            textAlign: 'center',
                            fontSize: 20,
                            fontWeight: 700,
                            outline: 'none'
                          }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmit as any}
                      disabled={loading}
                      style={{ width: '100%', background: 'rgb(249 115 22)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 16px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      {loading ? 'VERIFYING...' : 'Verify OTP'}
                    </button>
                    {/* <div style={{ textAlign: 'center', marginTop: 12 }}>
                      <span style={{ color: '#666' }}>Didn't receive the code? </span>
                      {otpMethod === 'email' && (
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: 'rgb(249 115 22)', fontWeight: 700, cursor: 'pointer' }}
                          onClick={async () => {
                            try {
                              await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login/send-otp`, { email: form.email });
                              toast.success('OTP re-sent');
                            } catch (e: any) {
                              toast.error(e.response?.data?.message || 'Failed to resend');
                            }
                          }}
                        >
                          Resend OTP
                        </button>
                      )}
                    </div> */}
                    <div style={{ textAlign: 'center', marginTop: 6 }}>
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => { setShowOtpModal(false); setOtpPhase('idle'); setOtpDigits(['','','','','','']); }}
                      >
                        Cancel
                      </button>
                    </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#FF8B00', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                onClick={async () => {
                  setForgotMsg('');
                  if (!form.email) {
                    setForgotMsg('Please enter your email above first.');
                    setShowForgotModal(true);
                    return;
                  }
                  try {
                    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email: form.email });
                    setForgotMsg(res.data.msg || 'OTP sent to your email.');
                  } catch (err) {
                    setForgotMsg((err as any).response?.data?.msg || 'Failed to send OTP.');
                  }
                  setShowForgotModal(true);
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* OTP Verify Modal */}
            {showForgotModal && (
              <ForgotPasswordModal
                email={form.email}
                onOtpVerified={() => {
                  setShowForgotModal(false);
                  setShowResetModal(true);
                }}
                onClose={() => { setShowForgotModal(false); setForgotMsg(''); }}
              />
            )}

            {/* Reset Password Modal */}
            {showResetModal && (
              <ResetPasswordModal
                email={form.email}
                onClose={() => setShowResetModal(false)}
              />
            )}

            {message && (
              <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="login-submit-button"
              disabled={loading}
            >
              {loading ? 'LOGGING IN...' : (otpPhase === 'sent' ? 'VERIFY OTP' : 'LOGIN NOW')}
            </button>

            <div style={{ textAlign: 'right', marginBottom: 12, padding: '0 4px' }}>
              <button
                type="button"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#FF8B00', 
                  cursor: 'pointer', 
                  fontWeight: 600, 
                  fontSize: window.innerWidth <= 425 ? 13 : 14, 
                  padding: 0,
                  textDecoration: 'underline'
                }}
                onClick={async () => {
                  setForgotMsg('');
                  if (!form.email) {
                    setForgotMsg('Please enter your email above first.');
                    setShowForgotModal(true);
                    return;
                  }
                  try {
                    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email: form.email });
                    setForgotMsg(res.data.msg || 'OTP sent to your email.');
                  } catch (err) {
                    setForgotMsg(err.response?.data?.msg || 'Failed to send OTP.');
                  }
                  setShowForgotModal(true);
                }}
              >
                Forgot Password?
              </button>
            </div>

            <div className="auth-link" style={{ textAlign: 'center', padding: '0 4px' }}>
              <p style={{ 
                color: '#666', 
                marginBottom: '8px',
                fontSize: window.innerWidth <= 425 ? 14 : 16
              }}>Don't have an account?</p>
              <button
                type="button"
                onClick={() => navigate('/register')}
                style={{
                  background: 'transparent',
                  border: '2px solid #FF8B00',
                  color: '#FF8B00',
                  padding: window.innerWidth <= 425 ? '6px 16px' : '8px 20px',
                  borderRadius: '25px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: window.innerWidth <= 425 ? 13 : 14
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#FF8B00';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#FF8B00';
                }}
              >
                REGISTER NOW
              </button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Login;
