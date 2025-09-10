
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import { Header } from '@/components/Header';

const EditProfile = () => {


    const location = useLocation();
    const navigate = useNavigate();
    const profile = location.state?.profile || {};
    const userId = profile._id;
    const [name, setName] = useState(profile.name || '');
    const [freeFireUsername, setFreeFireUsername] = useState(profile.freeFireUsername || '');
    const [phone, setPhone] = useState(profile.phone || '');
    const [message, setMessage] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetMsg, setResetMsg] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ userId, name, freeFireUsername, phone })
            });
            const data = await res.json();
            if (res.ok && data.status) {
                setTimeout(() => {
                    navigate('/profile');
                }, 1000);
            } 
        } catch (err) {
            setMessage('Network error.');
        }
    };

    // Reset password handler
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetMsg('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/reset-password/?userId=${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok && (data.status || data.success)) {
                setResetMsg('Password reset successfully!');
                setOldPassword('');
                setNewPassword('');
            } else {
                setResetMsg(data.error || data.msg || 'Failed to reset password.');
            }
        } catch (err) {
            setResetMsg('Network error.');
        }
    };

    return (
        <>
            <Header />
            <div className="container mt-8 mb-8">
                <h2 className="contact-title">Edit Profile</h2>
                <form className="contact-form mb-4" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name*</label>
                            <input type="text" placeholder="Enter your full name" className="input-shadow" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Mobile Number*</label>
                            <input type="text" placeholder="Enter your number" className="input-shadow" value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Game Username*</label>
                            <input type="text" placeholder="Enter your game username" className="input-shadow" value={freeFireUsername} onChange={e => setFreeFireUsername(e.target.value)} />
                        </div>
                    </div>
                    <button type="submit" className="submit-button">UPDATE PROFILE</button>
                </form>

                <form className="contact-form" onSubmit={handleResetPassword}>
                    <div className="form-row">
                        <div className="form-group" style={{ position: 'relative' }}>
                            <label>Old Password</label>
                            <input
                                type={showOldPassword ? 'text' : 'password'}
                                placeholder="Old Password"
                                className="input-shadow"
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                style={{ paddingRight: 36 }}
                            />
                            <span
                                onClick={() => setShowOldPassword(v => !v)}
                                style={{ position: 'absolute', right: 12, top: 38, cursor: 'pointer', userSelect: 'none' }}
                                title={showOldPassword ? 'Hide password' : 'Show password'}
                            >
                                {showOldPassword ? (
                                    <img src="/assets/vector/eye.png" alt="Hide password" />
                                ) : (
                                     <img src="/assets/vector/eye-off.png" alt="Show password" />
                                )}
                            </span>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group" style={{ position: 'relative' }}>
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="New Password"
                                className="input-shadow"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                style={{ paddingRight: 36 }}
                            />
                            <span
                                onClick={() => setShowNewPassword(v => !v)}
                                style={{ position: 'absolute', right: 12, top: 10, cursor: 'pointer', userSelect: 'none' }}
                                title={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                                {showNewPassword ? (
                                    <img src="/assets/vector/eye.png" alt="Hide password" />
                                ) : (
                                     <img src="/assets/vector/eye-off.png" alt="Show password" />
                                )}
                            </span>
                        </div>
                    </div>
                    {resetMsg && <div style={{ color: resetMsg.includes('success') ? 'green' : 'red', marginBottom: 8 }}>{resetMsg}</div>}
                    <button type="submit" className="submit-button">RESET</button>
                </form>
            </div>
            <Footer />
        </>
    );
};

export default EditProfile;
