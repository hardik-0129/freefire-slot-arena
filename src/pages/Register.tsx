
import React, { useState } from 'react';
import axios from 'axios';
import { getDeviceToken } from '../utils/deviceToken';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../components/css/Contect.css"

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    freeFireUsername: '',
    referCode: '', // optional, for entering someone else's refer code
    profilePhoto: null as File | null
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm({ ...form, profilePhoto: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validations
    const emailRegex = /^[\w.+-]+@[\w-]+\.[\w.-]+$/i;
    if (!emailRegex.test(form.email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }
    const phoneDigits = form.phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      toast.error('Please enter a valid mobile number (10-13 digits).');
      return;
    }
    // Profile photo is optional - no validation needed
    
    setLoading(true);
    try {
      // Convert image to base64
      const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      };

      // Prepare payload
      const payload: any = {
        name: form.name,
        email: form.email,
        phone: phoneDigits,
        password: form.password,
        freeFireUsername: form.freeFireUsername,
      };

      // Only add referCode if user entered it
      if (form.referCode) {
        payload.referCode = form.referCode;
      }

      // Convert and add profile photo
      if (form.profilePhoto) {
        payload.profilePhoto = await convertToBase64(form.profilePhoto);
      }

      // Get device token for notifications
      const deviceToken = await getDeviceToken();
      payload.deviceToken = deviceToken;
       
      // Try JSON approach first
      let res;
      try {
        res = await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (jsonError: any) {        
        // Fallback to FormData approach
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('phone', phoneDigits);
        formData.append('password', form.password);
        formData.append('freeFireUsername', form.freeFireUsername);
        
        if (form.referCode) {
          formData.append('referCode', form.referCode);
        }
        
        if (form.profilePhoto) {
          formData.append('profilePhoto', form.profilePhoto);
        }
        
        formData.append('deviceToken', deviceToken);
        
        res = await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      if (res.data.status) {
        toast.success(res.data.message || 'Registration successful!');
        // Redirect to login page after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 1500); // Wait for 1.5 seconds so the user can see the success message
      } else {
        toast.error(res.data.message || 'Registration failed.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <section className="py-16 register-section container">
        <div className="login-form-bordered">
          <h2 className="contact-title">REGISTER FORM</h2>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="">
              <div className="form-group">
                <label>Full Name*</label>
                <input
                  className="input-shadow"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address*</label>
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
            </div>

            <div className="">
              <div className="form-group">
                <label>Mobile Number*</label>
                <input
                  className="input-shadow"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setForm({ ...form, phone: value });
                  }}
                  placeholder="Enter your mobile number"
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>

              <div className="form-group">
                <label>Password*</label>
                <input
                  className="input-shadow"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                />
              </div>

            </div>

            <div className="">
              <div className="form-group">
                <label>Free Fire Username*</label>
                <input
                  className="input-shadow"
                  type="text"
                  name="freeFireUsername"
                  value={form.freeFireUsername}
                  onChange={handleChange}
                  placeholder="Enter your Free Fire username"
                  required
                />
              </div>

              <div className="form-group">
                <label>Referral Code (optional):</label>
                <input
                  className="input-shadow"
                  type="text"
                  name="referCode"
                  value={form.referCode}
                  onChange={handleChange}
                  placeholder="Enter referral code if you have one"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="">
              <div className="form-group">
                <label>Profile Photo (optional)</label>
                <input
                  className="input-shadow"
                  type="file"
                  name="profilePhoto"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    fontSize: '14px',
                    color: '#333',
                    cursor: 'pointer'
                  }}
                />
                {form.profilePhoto && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    Selected: {form.profilePhoto.name}
                  </div>
                )}
              </div>
            </div>

            
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'REGISTERING...' : 'REGISTER NOW'}
            </button>

            <div className="auth-link" style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ color: '#666', marginBottom: '8px' }}>Already have an account?</p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  background: 'transparent',
                  border: '2px solid #FF8B00',
                  color: '#FF8B00',
                  padding: '8px 20px',
                  borderRadius: '25px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
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
                LOGIN NOW
              </button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Register;
