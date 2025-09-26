
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
  alphaRole?: {
    roleName: string | null;
    nftCount: number;
    isVerified: boolean;
    verificationDate?: string;
    walletAddress?: string | null;
  };
  twoFactorEnabled?: boolean;
  totpEnabled?: boolean;
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
  const [saving2FA, setSaving2FA] = useState(false);
  const [email2FA, setEmail2FA] = useState<boolean>(false);
  const [totpSetup, setTotpSetup] = useState<{ qr?: string; secret?: string } | null>(null);
  const [hasTotpSecret, setHasTotpSecret] = useState<boolean>(false);
  const [totpToken, setTotpToken] = useState('');
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
        setEmail2FA(Boolean(data.user?.twoFactorEnabled));
        // We only show Setup button based on current enable state; secret presence is handled locally during setup
        setHasTotpSecret(false);
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
        if (data.success && Array.isArray(data.referralEarnings)) {
          setReferralHistory(data.referralEarnings);
          const total = data.referralEarnings.reduce((sum: number, txn: any) => sum + (txn.amount || 0), 0);
          setTotalReferralReward(total);
        } else {
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

  if (!profile) return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;

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
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', flexWrap: 'nowrap' }}>
                  {profile.name}
                  {profile.alphaRole?.isVerified && profile.alphaRole?.roleName && (
                    <span
                      title={profile.alphaRole.roleName}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '2px 10px',
                        borderRadius: 999,
                        color: '#16a34a',
                        fontSize: 12,
                        fontWeight: 700,
                        border: '1px solid #16a34a',
                        lineHeight: '16px'
                      }}
                    >
                      {profile.alphaRole.roleName}
                    </span>
                  )}
                </h2>
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
          <div className="profile-card" style={{ marginTop: 16 }}>
            <div className="referral-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span className="referral-title">Security</span>
              {!(profile.totpEnabled || (profile as any).totpVerified) && !totpSetup && (
                <button
                  className="btn-2fa enable"
                  style={{ padding: '6px 12px', fontSize: 13, lineHeight: 1.2, borderRadius: 8 }}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      if (!token) return;
                      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/2fa/totp/init`, { userId: profile._id }, { headers: { Authorization: `Bearer ${token}` } });
                      if (res.data?.qrDataUrl) {
                        setTotpSetup({ qr: res.data.qrDataUrl, secret: res.data.secretBase32 });
                        toast.info('Scan the QR with Microsoft/Google Authenticator, then enter the 6-digit code.');
                      } else {
                        toast.error(res.data?.message || 'Failed to init TOTP');
                      }
                    } catch (e: any) {
                      toast.error(e.response?.data?.message || 'Failed to init TOTP');
                    }
                  }}
                >
                  Setup Authenticator
                </button>
              )}
            </div>
            <div className="security-card">
              {/* Email OTP Row */}
              <div className="security-left">
                <div className="profile-grid-label">Two-Factor Authentication (Email OTP)</div>
                <div className={`security-status ${profile.twoFactorEnabled ? 'enabled' : 'disabled'}`}>{profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}</div>
              </div>
              <div className="security-actions" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <label className="toggle" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={email2FA}
                    onChange={async (e) => {
                      try {
                        setSaving2FA(true);
                        const nextVal = e.target.checked;
                        setEmail2FA(nextVal); // optimistic UI
                        const token = localStorage.getItem('token');
                        if (!token) return;
                        const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/twofactor`, { enabled: nextVal, userId: profile._id }, { headers: { Authorization: `Bearer ${token}` } });
                        if (res.data.status) {
                          toast.success(res.data.message || 'Updated');
                          setProfile(prev => prev ? { ...prev, twoFactorEnabled: nextVal, totpEnabled: nextVal ? false : prev.totpEnabled } : prev);
                        } else {
                          toast.error(res.data.message || 'Failed to update');
                          setEmail2FA(!nextVal); // rollback
                        }
                      } catch (e: any) {
                        toast.error(e.response?.data?.message || 'Failed to update');
                        setEmail2FA(!email2FA); // rollback
                      } finally {
                        setSaving2FA(false);
                      }
                    }}
                  />
                  <span className="track"></span>
                  <span className="thumb"></span>
                </label>
              </div>
            </div>

            <div className="security-card">
              {/* TOTP Row */}
              <div className="security-left">
                <div className="profile-grid-label">Authenticator (TOTP)</div>
                <div className={`security-status ${(profile.totpEnabled || (profile as any).totpVerified) ? 'enabled' : 'disabled'}`}>{(profile.totpEnabled || (profile as any).totpVerified) ? 'Enabled' : 'Disabled'}</div>
              </div>
              <div className="security-actions" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {/* <label className="toggle">
                              <input
                                type="checkbox"
                                checked={!!profile.twoFactorEnabled}
                                onChange={async (e) => {
                                  try {
                                    setSaving2FA(true);
                                    const token = localStorage.getItem('token');
                                    if (!token) return;
                                    const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/twofactor`, { enabled: e.target.checked, userId: profile._id }, { headers: { Authorization: `Bearer ${token}` } });
                                    if (res.data.status) {
                                      toast.success(res.data.message || 'Updated');
                                      setProfile(prev => prev ? { ...prev, twoFactorEnabled: e.target.checked, totpEnabled: e.target.checked ? false : prev.totpEnabled } : prev);
                                    } else {
                                      toast.error(res.data.message || 'Failed to update');
                                    }
                                  } catch (e: any) {
                                    toast.error(e.response?.data?.message || 'Failed to update');
                                  } finally {
                                    setSaving2FA(false);
                                  }
                                }}
                              />
                              <span className="track"></span>
                              <span className="thumb"></span>
                            </label> */}

                {/* Setup button moved to header */}

                {/* Toggle TOTP on/off */}
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={!!(profile.totpEnabled || (profile as any).totpVerified)}
                    onChange={async (e) => {
                      try {
                        setSaving2FA(true);
                        const token = localStorage.getItem('token');
                        if (!token) return;
                        if (e.target.checked) {
                          const resp = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/2fa/totp/enable`, { userId: profile._id }, { headers: { Authorization: `Bearer ${token}` } });
                          if (resp.data?.status) {
                            toast.success('Authenticator enabled');
                            setProfile(prev => prev ? { ...prev, totpEnabled: true, totpVerified: true, twoFactorEnabled: false } : prev);
                          } else {
                            toast.error(resp.data?.message || 'Enable failed');
                          }
                        } else {
                          const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/2fa/totp/disable`, { userId: profile._id }, { headers: { Authorization: `Bearer ${token}` } });
                          if (res.data?.status) {
                            toast.success('Authenticator disabled');
                            setProfile(prev => prev ? { ...prev, totpEnabled: false, totpVerified: false } : prev);
                          } else {
                            toast.error(res.data?.message || 'Failed to disable');
                          }
                        }
                      } catch (e: any) {
                        toast.error(e.response?.data?.message || 'Action failed');
                      } finally {
                        setSaving2FA(false);
                      }
                    }}
                  />
                  <span className="track"></span>
                  <span className="thumb"></span>
                </label>

                {/* Setup button (one-time). Only show if no secret yet */}

              </div>
            </div>
          </div>

          {totpSetup && (
            <div className="profile-card" style={{ marginTop: 16 }}>
              <div className="referral-header">
                <span className="referral-title">Authenticator Setup</span>
              </div>
              <div className="totp-setup">
                <div className="totp-qr">
                  {totpSetup.qr && (
                    <img src={totpSetup.qr} alt="TOTP QR" />
                  )}
                </div>
                <div className="totp-details">
                  {totpSetup.secret && (
                    <div>
                      <div className="profile-grid-label">Secret (backup):</div>
                      <div className="totp-secret">{totpSetup.secret}</div>
                    </div>
                  )}
                  <label className="profile-grid-label">Enter 6-digit code</label>
                  <div className="totp-input-row">
                    <input
                      className="totp-code-input"
                      type="text"
                      value={totpToken}
                      onChange={(e) => setTotpToken(e.target.value)}
                      placeholder="123456"
                    />
                    <button
                      className="btn-verify"
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          if (!token) return;
                          const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/2fa/totp/verify`, { userId: profile._id, token: totpToken }, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          if (res.data?.status) {
                            toast.success('Authenticator enabled');
                            setProfile(prev => prev ? { ...prev, twoFactorEnabled: true, totpEnabled: true, totpVerified: true } : prev);
                            setTotpSetup(null); setTotpToken('');
                          } else {
                            toast.error(res.data?.message || 'Invalid code');
                          }
                        } catch (e: any) {
                          toast.error(e.response?.data?.message || 'Failed to enable');
                        }
                      }}
                    >Verify</button>
                    <button className="btn-cancel" onClick={() => { setTotpSetup(null); setTotpToken(''); setHasTotpSecret(false); }}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
