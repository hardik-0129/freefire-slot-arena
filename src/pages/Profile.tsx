
import { Header } from '@/components/Header';
import { useEffect, useState } from 'react';
import '../components/css/Profile.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Footer from '@/components/Footer';

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone: string;
    freeFireUsername: string;
    wallet: number;
    role: string;
    isAdmin: boolean;
    referCode: string;
    profilePhoto?: string;
    createdAt: string;
    updatedAt: string;
}

const Profile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [totalMatches, setTotalMatches] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);
    const [totalWinMoney, setTotalWinMoney] = useState(0);
    const [referralHistory, setReferralHistory] = useState<any[]>([]);
    const [totalReferralReward, setTotalReferralReward] = useState(0);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
    const [pendingPreview, setPendingPreview] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        let userId = '';
        try {
            const decoded = jwtDecode<{ userId: string }>(token);
            userId = decoded.userId;
        } catch (e) { return; }
        if (!userId) return;
        fetch(`${import.meta.env.VITE_API_URL}/api/user/profile/?userId=${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setProfile(data.user);
                setTotalMatches(data.totalMatches);
                setTotalBalance(data.totalBalance);
                setTotalWinMoney(data.totalWinMoney);
            });

        // Fetch referral earnings history
        fetch(`${import.meta.env.VITE_API_URL}/api/wallet/referral-earnings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        })
            .then(res => res.json())
            .then(data => {
                console.log('Referral earnings response:', data);
                if (data.success && Array.isArray(data.referralEarnings)) {
                    setReferralHistory(data.referralEarnings);
                    const total = data.referralEarnings.reduce((sum: number, txn: any) => sum + (txn.amount || 0), 0);
                    setTotalReferralReward(total);
                } else {
                    console.log('No referral earnings found or API error:', data);
                    setReferralHistory([]);
                    setTotalReferralReward(0);
                }
            })
            .catch(error => {
                console.error('Error fetching referral earnings:', error);
                setReferralHistory([]);
                setTotalReferralReward(0);
            });
    }, []);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }
        setPendingPhoto(file);
        setPendingPreview(URL.createObjectURL(file));
    };

    const confirmPhotoUpload = async () => {
        if (!pendingPhoto) return;
        setIsUploadingPhoto(true);
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const formData = new FormData();
            formData.append('profilePhoto', pendingPhoto);
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/update-profile-photo`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (res.data.status) {
                toast.success('Profile photo updated successfully!');
                setProfile(prev => prev ? { ...prev, profilePhoto: res.data.profilePhoto } : null);
                setPendingPhoto(null);
                setPendingPreview('');
            } else {
                toast.error(res.data.message || 'Failed to update profile photo');
            }
        } catch (error: any) {
            console.error('Error updating profile photo:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile photo');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const cancelPendingPhoto = () => {
        if (pendingPreview) URL.revokeObjectURL(pendingPreview);
        setPendingPhoto(null);
        setPendingPreview('');
    };

    if (!profile) return <div>Loading...</div>;

    return (
        <>
            <Header />
            <div className="container py-16">
                <div>
                    <h2 className="wallet-title">
                        Profile

                    </h2>
                    <div className="profile-card" style={{ position: 'relative' }}>
                        <button
                            className="edit-profile-btn"
                            style={{ position: 'absolute', top: 24, right: 24, fontSize: 14, padding: '6px 18px', background: '#FF8B00', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, zIndex: 2 }}
                            onClick={() => navigate('/edit', { state: { profile } })}
                        >
                            Edit
                        </button>
                        <div className="profile-header">
                            <div className="profile-avatar-wrapper">
                                <img
                                    className="profile-avatar"
                                    src={pendingPreview || (profile.profilePhoto ? (profile.profilePhoto.startsWith('http') ? profile.profilePhoto : `${import.meta.env.VITE_API_URL}${profile.profilePhoto}`) : "/assets/vector/profile-user.png")}
                                    alt="Profile"
                                    style={{
                                        objectFit: 'cover',
                                        borderRadius: '50%'
                                    }}
                                    onError={(e) => {
                                        // Fallback to default avatar if image fails to load
                                        e.currentTarget.src = "/assets/vector/profile-user.png";
                                    }}
                                />
                                {!pendingPhoto && (
                                    <label htmlFor="profile-photo-upload" className="profile-photo-upload-btn">
                                        <span>{isUploadingPhoto ? 'Uploading...' : 'Change'}</span>
                                        <input
                                            id="profile-photo-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            disabled={isUploadingPhoto}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                                {pendingPhoto && (
                                    <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
                                        <button onClick={confirmPhotoUpload} disabled={isUploadingPhoto} style={{ background: '#52C41A', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 600 }}>
                                            {isUploadingPhoto ? 'Saving...' : 'Update'}
                                        </button>
                                        <button onClick={cancelPendingPhoto} disabled={isUploadingPhoto} style={{ background: '#999', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 600 }}>
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="profile-info">
                                <h2>{profile.name}</h2>
                                <p>FF Username: <b>{profile.freeFireUsername}</b></p>
                                {/* <div className="profile-id">User ID: {profile._id}</div> */}
                            </div>
                        </div>
                        <div className="profile-grid">
                            <div>
                                <div className="profile-grid-label">Email</div>
                                <div className="profile-grid-value">{profile.email}</div>
                            </div>
                            <div>
                                <div className="profile-grid-label">Phone</div>
                                <div className="profile-grid-value">{profile.phone}</div>
                            </div>
                            <div>
                                <div className="profile-grid-label">Referral Code</div>
                                <div className="profile-grid-value" style={{ color: '#ff9800', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span>{profile.referCode}</span>
                                    <button
                                        className="copy-btn"
                                        style={{ marginLeft: 4 }}
                                        onClick={() => {
                                            navigator.clipboard.writeText(profile.referCode);
                                        }}
                                        title="Copy Referral Code"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="5" y="5" width="10" height="12" rx="2" stroke="#ff9800" strokeWidth="1.5" fill="none" />
                                            <rect x="8" y="3" width="7" height="12" rx="2" stroke="#ff9800" strokeWidth="1.2" fill="none" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            {/* <div>
                                <div className="profile-grid-label">Role</div>
                                <div className="profile-grid-value">{profile.role}</div>
                            </div> */}
                        </div>
                        <div className="profile-balance">
                            <div className="profile-balance-block">
                                <div className="profile-balance-label">Wallet Balance</div>
                                <div className="profile-balance-value">₹{totalBalance}</div>
                            </div>
                            <div className="profile-balance-block">
                                <div className="profile-balance-label">Total Matches</div>
                                <div className="profile-balance-value">{totalMatches}</div>
                            </div>
                            <div className="profile-balance-block">
                                <div className="profile-balance-label">Total Win Money</div>
                                <div className="profile-balance-value green">₹{totalWinMoney}</div>
                            </div>
                        </div>
                        <div className="profile-joined">
                            Joined: {new Date(profile.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    {/* Referral Reward Card Section */}
                    <div className="profile-card referral-card">
                        <div className="referral-header">
                            <span className="referral-title">Referral Reward</span>
                        </div>
                        <div className="referral-content">
                            <div className="referral-row">
                                <span className="referral-label">Your Referral Code:</span>
                                <span className="referral-value">{profile.referCode || '--'}</span>
                            </div>
                            <div className="referral-row">
                                <span className="referral-label">Total Referral Reward:</span>
                                <span className="referral-value reward">₹{totalReferralReward}</span>
                            </div>
                            <div className="referral-row">
                                <span className="referral-label">Share your code to earn 5% on your friends' winnings!</span>
                            </div>
                        </div>
                        {/* Referral History Section */}
                        <div className="referral-history-list">
                            <div className="referral-history-title">Referral History</div>
                            {referralHistory.length > 0 ? (
                                referralHistory.map((txn, idx) => (
                                    <div key={txn._id || idx} className="referral-history-item">
                                        <div className="referral-history-left">
                                            <div className="referral-history-credit">CREDIT</div>
                                            <div className="referral-history-desc">{txn.description}</div>
                                            <div className="referral-history-date">{new Date(txn.createdAt).toLocaleString('en-IN')}</div>
                                        </div>
                                        <div className="referral-history-right">
                                            <div className="referral-history-amount">+ <span>{txn.amount.toFixed(2)}</span> <img src="/assets/vector/Coin.png" alt="coin" className="referral-history-coin" /></div>
                                            <div className="referral-history-balance">
                                                <img src="/assets/vector/Coin.png" alt="coin" className="referral-history-coin-small" />{txn.balanceAfter?.toFixed(2) ?? ''}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="referral-history-empty">
                                    <p>No referral history yet. Share your referral code to start earning!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Profile;
