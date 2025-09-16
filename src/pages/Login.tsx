import React, { useState, useEffect } from 'react';
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
      // Get device token for notifications
      const deviceToken = await getDeviceToken();

      const payload = { ...form, deviceToken };
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, payload);
      if (res.data.token) {
        toast.success('Login successful!');
        localStorage.setItem('token', res.data.token);
        setForm({
          email: '',
          password: ''
        });
        setTimeout(() => {
          // Redirect to original page if redirected from protected route, otherwise go to home
          const redirectTo = '/tournament';
          navigate(redirectTo);
        }, 1000);
      } else {
        toast.error(res.data.message || 'Login failed.');
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
              />
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
              {loading ? 'LOGGING IN...' : 'LOGIN NOW'}
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
