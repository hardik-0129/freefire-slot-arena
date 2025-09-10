import React, { useState } from 'react'
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import "../components/css/Contect.css"
import { Header } from '@/components/Header'
import Footer from '@/components/Footer'

const Contect = () => {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        mobile: '',
        gameName: '',
        gameUsername: '',
        gameUID: '',
        queryType: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let userId = '';
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode<{ userId?: string }>(token);
                    userId = decoded.userId || '';
                } catch {}
            }
            const payload = userId ? { ...form, userId } : { ...form };
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Your message has been sent!');
                setForm({
                    fullName: '', email: '', mobile: '', gameName: '', gameUsername: '', gameUID: '', queryType: '', message: ''
                });
            } else {
                toast.error(data.message || 'Failed to send message.');
            }
        } catch (err) {
            toast.error('Failed to send message.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="container mt-8 mb-8">
                <h2 className="contact-title">CONTACT FORM</h2>
                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name*</label>
                            <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" className="input-shadow" required />
                        </div>
                        <div className="form-group">
                            <label>Email Address*</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" className="input-shadow" required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Mobile Number*</label>
                            <input type="text" name="mobile" value={form.mobile} onChange={handleChange} placeholder="Enter your number" className="input-shadow" required />
                        </div>
                        <div className="form-group">
                            <label>Game Name*</label>
                            <input type="text" name="gameName" value={form.gameName} onChange={handleChange} placeholder="e.g., BGMI, Free Fire" className="input-shadow" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Game Username*</label>
                            <input type="text" name="gameUsername" value={form.gameUsername} onChange={handleChange} placeholder="Enter your game username" className="input-shadow" />
                        </div>
                        <div className="form-group">
                            <label>Game UID*</label>
                            <input type="text" name="gameUID" value={form.gameUID} onChange={handleChange} placeholder="Enter your UID" className="input-shadow" />
                        </div>
                    </div>

                    <div className="form-group single">
                        <label>Query Type*</label>
                        <input type="text" name="queryType" value={form.queryType} onChange={handleChange} placeholder="(General, Payment Issue, Slot Booking, etc.)" className="input-shadow" />
                    </div>

                    <div className="form-group single">
                        <label>Your Message / Issue Description*</label>
                        <textarea name="message" rows={5} value={form.message} onChange={handleChange} placeholder="Type your message here..." className="input-shadow" required></textarea>
                    </div>
                    <button type="submit" className="submit-button" disabled={loading}>{loading ? 'SENDING...' : 'CONTACT NOW'}</button>
                </form>
            </div>
            <Footer />
        </>
    )

}

export default Contect
