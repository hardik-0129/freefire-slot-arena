import Footer from '@/components/Footer';
import { Header } from '@/components/Header';
import React, { useEffect, useRef, useState } from 'react';
import '../components/css/Task.css';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';


const Task: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [wallet, setWallet] = useState('');
  const [walletError, setWalletError] = useState('');
  const [code, setCode] = useState('');

  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [profileName, setProfileName] = useState('');

  // NFT info
  const [nftLoading, setNftLoading] = useState(false);
  const [nftError, setNftError] = useState('');
  const [nftName, setNftName] = useState('Collection');
  const [nftCount, setNftCount] = useState('0');

  // Alpha Role info
  const [alphaRole, setAlphaRole] = useState<{
    roleName: string | null;
    description: string;
    minNfts: number;
  } | null>(null);
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleSaved, setRoleSaved] = useState(false);
  const [roleError, setRoleError] = useState('');
  const [savedWallet, setSavedWallet] = useState('');

  // Verification status
  const [verificationStatus, setVerificationStatus] = useState<{
    isVerified: boolean;
    roleName: string | null;
    nftCount: number | null;
  } | null>(null);
  const [checkingVerification, setCheckingVerification] = useState(false);

  const walletInputRef = useRef<HTMLInputElement | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [videoMuted, setVideoMuted] = useState(true);

  const CONTRACT_ADDRESS = '0x8420B95bEac664b6E8E89978C3fDCaA1A71c8350';
  const RPC_URLS = [
    'https://apechain.drpc.org',
    'https://33139.rpc.thirdweb.com',
    'https://rpc.apechain.com'
  ];

  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => walletInputRef.current?.focus(), 0);
    }
  }, [modalOpen]);

  function toggleHeroMute() {
    const el = heroVideoRef.current;
    if (!el) return;
    const next = !videoMuted;
    el.muted = next;
    setVideoMuted(next);
  }

  // Check verification status on component mount
  useEffect(() => {
    checkVerificationStatus();
  }, []);

  async function checkVerificationStatus() {
    try {
      setCheckingVerification(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setVerificationStatus({ isVerified: false, roleName: null, nftCount: null });
        return;
      }

      // Get user ID from token
      let userId = '';
      try {
        const decoded = jwtDecode<{ userId: string }>(token);
        userId = decoded.userId;
      } catch (e) {
        setVerificationStatus({ isVerified: false, roleName: null, nftCount: null });
        return;
      }

      if (!userId) {
        setVerificationStatus({ isVerified: false, roleName: null, nftCount: null });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/verify-alpha-role/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.status === true) {
        setVerificationStatus({
          isVerified: true,
          roleName: data.data.roleName,
          nftCount: data.data.nftCount
        });
      } else {
        setVerificationStatus({
          isVerified: false,
          roleName: null,
          nftCount: null
        });
      }
    } catch (e: any) {
      console.error('Error checking verification status:', e);
      setVerificationStatus({ isVerified: false, roleName: null, nftCount: null });
    } finally {
      setCheckingVerification(false);
    }
  }

  function validateAddress(addr: string) {
    return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
  }

  function genCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return `AL-ALPHA-${out}`;
  }


  function buildProfileUrl(address: string) {
    return `https://magiceden.io/u/${encodeURIComponent(address)}`;
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  async function verifyProfileHasCode(address: string, vcode: string) {
    const profileUrl = buildProfileUrl(address);
    // Strategy A: AllOrigins raw HTML
    const htmlUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
      profileUrl + (profileUrl.includes('?') ? '&' : '?') + 'cb=' + Date.now()
    )}`;
    try {
      const res = await fetch(htmlUrl, { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const container = doc.querySelector('div.fresnel-container .line-clamp-1');
        const haystack = (container ? container.textContent : doc.body.textContent) || '';
        // Try to extract a profile display name from <title> or visible text
        let disp = '';
        const title = doc.querySelector('title');
        if (title && title.textContent) {
          const t = title.textContent;
          // Heuristic: "{name} | Magic Eden"
          disp = (t.includes('|') ? t.split('|')[0] : t).trim();
        }
        if (!disp && container && container.textContent) disp = container.textContent.trim();
        if (haystack.includes(vcode)) return { ok: true, displayName: disp } as const;
      }
    } catch {
      // fall through
    }
    // Strategy B: r.jina.ai plain text proxy
    try {
      const textUrl = `https://r.jina.ai/http://magiceden.io/u/${encodeURIComponent(address)}?cb=${Date.now()}`;
      const res2 = await fetch(textUrl, { method: 'GET', cache: 'no-store' });
      if (res2.ok) {
        const text = await res2.text();
        // try pull a display-like line from the first 200 chars as best-effort
        let disp = '';
        if (text) {
          const first = text.slice(0, 300);
          // crude: find a line with @ or Profile
          const m = first.match(/^[^\n]{3,60}/m);
          if (m) disp = m[0].trim();
        }
        if (text && text.includes(vcode)) return { ok: true, displayName: disp } as const;
        return { ok: false, reason: 'Code not found on profile yet.' } as const;
      }
      return { ok: false, reason: 'Unable to load profile. Please try again.' } as const;
    } catch (e: any) {
      return { ok: false, reason: e?.message || 'Unable to load profile.' } as const;
    }
  }

  function hexToUintString(hex: string) {
    try {
      const s = (hex && hex !== '0x') ? hex : '0x0';
      return BigInt(s).toString();
    } catch {
      const clean = (hex || '0x0').replace(/^0x/, '');
      return String(parseInt(clean || '0', 16) || 0);
    }
  }

  function decodeString(hex: string) {
    const clean = (hex || '').replace(/^0x/, '');
    if (clean.length < 128) return '';
    const lenHex = clean.slice(64, 128);
    const len = parseInt(lenHex, 16) || 0;
    const dataHex = clean.slice(128, 128 + len * 2);
    let out = '';
    for (let i = 0; i < dataHex.length; i += 2) {
      out += String.fromCharCode(parseInt(dataHex.slice(i, i + 2), 16));
    }
    try { return decodeURIComponent(escape(out)); } catch { return out; }
  }

  function encodeBalanceOf(addr: string) {
    const selector = '0x70a08231';
    const padded = addr.replace(/^0x/, '').toLowerCase().padStart(64, '0');
    return selector + padded;
  }
  function encodeName() { return '0x06fdde03'; }

  async function ethCall(to: string, data: string) {
    const body = { jsonrpc: '2.0', id: Date.now(), method: 'eth_call', params: [ { to, data }, 'latest' ] };
    let lastErr: any;
    for (const url of RPC_URLS) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal });
        clearTimeout(timer);
        if (!res.ok) { lastErr = new Error('RPC HTTP ' + res.status + ' @ ' + url); continue; }
        const json = await res.json();
        if (json?.result) return json.result as string;
        if (json?.error) { lastErr = new Error(json.error.message || 'RPC error'); continue; }
        lastErr = new Error('Empty RPC response @ ' + url);
      } catch (e) { lastErr = e; continue; }
    }
    throw lastErr || new Error('All RPCs failed');
  }

  async function fetchNfts(owner: string) {
    try {
      setNftLoading(true); setNftError('');
      const [nameHex, balHex] = await Promise.all([
        ethCall(CONTRACT_ADDRESS, encodeName()).catch(() => '0x'),
        ethCall(CONTRACT_ADDRESS, encodeBalanceOf(owner))
      ]);
      const name = nameHex && nameHex !== '0x' ? (decodeString(nameHex) || 'Unknown Collection') : 'Unknown Collection';
      const count = hexToUintString(balHex);
      setNftName(name);
      setNftCount(count);
    } catch (e: any) {
      setNftError(e?.message || 'Failed to fetch NFT info');
    } finally {
      setNftLoading(false);
    }
  }

  async function saveAlphaRole(nftCount: number) {
    try {
      setRoleSaving(true);
      setRoleError('');
      
    const token = localStorage.getItem('token');
    if (!token) {
      setRoleError('Please login to save your alpha role');
      toast.error('Please login to save your alpha role');
      return;
    }

      // Get user ID from token
      let userId = '';
      if (token) {
        try {
          const decoded = jwtDecode<{ userId: string }>(token);
          userId = decoded.userId;
        } catch (e) {
          setRoleError('Invalid token');
          return;
        }
      }

      if (!userId) {
        setRoleError('User ID not found in token');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/verify-alpha-role/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nftCount,
          walletAddress: wallet
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setRoleSaved(true);
        // Set alpha role from backend response
        setAlphaRole({
          roleName: data.alphaRole.roleName,
          description: data.alphaRole.description,
          minNfts: data.alphaRole.nftCount
        });
        if (data.alphaRole.walletAddress) {
          setSavedWallet(data.alphaRole.walletAddress);
        }
        toast.success(`Alpha role verified! You are now a ${data.alphaRole.roleName || 'No Role'}`);
        
        // Update verification status
        setVerificationStatus({
          isVerified: true,
          roleName: data.alphaRole.roleName,
          nftCount: data.alphaRole.nftCount
        });
      } else {
        setRoleError(data.error || 'Failed to save alpha role');
        toast.error(data.error || 'Failed to save alpha role');
      }
    } catch (e: any) {
      setRoleError('Error saving alpha role: ' + e.message);
      toast.error('Error saving alpha role: ' + e.message);
    } finally {
      setRoleSaving(false);
    }
  }

  function resetModal() {
    setStep(1); setWallet(''); setWalletError(''); setCode(''); setVerified(false); setVerifyError(''); setNftError(''); setNftCount('0'); setNftName('Collection'); setProfileName('');
    setAlphaRole(null); setRoleSaving(false); setRoleSaved(false); setRoleError('');
  }

  const headerActions = (
    <div className="actions">
      <button className="btn primary" onClick={() => { setModalOpen(true); resetModal(); }}>Verify Wallet</button>
      <a className="btn" href="https://magiceden.io/" target="_blank" rel="noopener">Open Magic Eden</a>
    </div>
  );

  return (
    <>

    <Header />
    <div className="task-root">
      <div className="container">
        <div className="card hero">
          {checkingVerification ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p>Checking your verification status...</p>
            </div>
          ) : verificationStatus?.isVerified ? (
            <div style={{ textAlign: 'center' }}>
              <h1>🎉 You're Verified!</h1>
              <div style={{ margin: '20px 0', textAlign: 'center' }}>
                <div style={{ 
                  display: 'inline-block',
                  background: 'white',
                  border: '2px solid #10b981',
                  borderRadius: '20px',
                  padding: '12px 20px',
                  margin: '8px',
                  color: '#10b981',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {verificationStatus.roleName?.toUpperCase()}
                </div>
                <div style={{ 
                  display: 'inline-block',
                  background: 'white',
                  border: '2px solid #3b82f6',
                  borderRadius: '20px',
                  padding: '12px 20px',
                  margin: '8px',
                  color: '#3b82f6',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  {verificationStatus.nftCount} Alpha Lion NFTs
                </div>
              </div>
              <p className="lead" style={{ textAlign: 'center' }}>Your wallet has been verified and your alpha role has been assigned!</p>
            </div>
          ) : (
            <div>
              <h1>Verify your wallet ownership</h1>
              <p className="lead">Quick verification using your Magic Eden profile bio. No signature required.</p>
              {headerActions}
              <p className="small muted" style={{ marginTop: 10 }}>We will ask you to paste a short one-time code into your Magic Eden bio, then confirm it from your public profile page.</p>
            </div>
          )}
        </div>
        
      </div>
       {/* Alpha Lions NFT Section */}
      <section
      className="alpha-nft-section"
      style={{
        marginTop: 24,
        background: '#ff8b00'
      }}
    >
      <div className="container" style={{ padding: '48px 16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 24
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'linear-gradient(180deg,#7c5cff,#6144ff)' }} />
              <span className="small" style={{ color: '#fff', letterSpacing: 1 }}>ALPHA LIONS NFT</span>
            </div>
            <h2 style={{
              margin: 0,
              fontSize: 50,
              lineHeight: 1.2,
              color: 'white',
              textShadow: '0 2px 16px rgba(124,92,255,0.25)'
            }}>
              What is Alpha Lions NFT?
            </h2>
            <p className="lead" style={{ color: '#fff', marginTop: 10, maxWidth: 820 }}>
              Alpha Lions NFTs are your membership pass into the Alpha Lions ecosystem — unlocking access
              to exclusive tournaments, early announcements, community perks, and evolving utilities across our gaming
              experiences. Hold more to climb the pride, earn status, and roar louder.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              <a
                className="btn"
                href="https://alphalions.io"
                target="_blank"
                rel="noopener"
                style={{ fontSize: 14 }}
              >
                Visit AlphaLions.io
              </a>
              <a
                className="btn"
                href="https://magiceden.io/collections/apechain/0x8420b95beac664b6e8e89978c3fdcaa1a71c8350" 
                target="_blank" 
                rel="noopener"
                style={{ fontSize: 14 }}
              >
                View Collection
              </a>
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 12
              }}
            >
              {[
                'https://img.reservoir.tools/images/v2/apechain/i9YO%2F4yHXUdJsWcTqhqvf2ciDYtkHh6tiFKPMvGMqomt7mSR78kK7aciogklt7Rkfnz%2FAFEtgSCUxNAPfRrjiYBi2u9XNHDrGI8cCTTyWv%2Bv8Z4fuwA6Ygh3gkp65AjPXb3hwexDsPSw91xN6X9ALw%3D%3D.png',
                'https://img.reservoir.tools/images/v2/apechain/i9YO%2F4yHXUdJsWcTqhqvf2ciDYtkHh6tiFKPMvGMqomt7mSR78kK7aciogklt7Rkfnz%2FAFEtgSCUxNAPfRrjiYBi2u9XNHDrGI8cCTTyWv%2B%2FnoMJ1o4TyMgMEC7u8lXJCCFc97pA%2BGXno6FA2kDtTw%3D%3D.png',
                'https://img.reservoir.tools/images/v2/apechain/i9YO%2F4yHXUdJsWcTqhqvf2ciDYtkHh6tiFKPMvGMqomt7mSR78kK7aciogklt7Rkfnz%2FAFEtgSCUxNAPfRrjiYBi2u9XNHDrGI8cCTTyWv%2B%2FobN85oUu006Spm8by6DZS1x8%2BXwTv7MGuFeYLJiLeg%3D%3D.png',
                'https://img.reservoir.tools/images/v2/apechain/i9YO%2F4yHXUdJsWcTqhqvf2ciDYtkHh6tiFKPMvGMqomt7mSR78kK7aciogklt7Rkfnz%2FAFEtgSCUxNAPfRrjiYBi2u9XNHDrGI8cCTTyWv%2FkH46UWUvmqynIYBd03dmzPuzt%2BEfseO4tdDkC06Twnw%3D%3D.png'
              ].map((src, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <img
                    src={src}
                    alt={`Alpha Lions NFT ${idx + 1}`}
                    style={{ width: '100%', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <div className="small" style={{ color: '#fff', marginTop: 8 }}>Preview from collection. Art subject to change.</div>
          </div>
        </div>
      </div>
    </section>
      {/* Hero Section */}
      <div className="sw-hero-section-main-contetnt">
        <video
          ref={heroVideoRef}
          id="heroVideo"
          className="sw-hero-video"
          autoPlay
          loop
          playsInline
          preload="auto"
          muted={videoMuted}
          poster="/assets/video-poster-CHbTF0Uv.png"
        >
          <source src="https://alphalions.io/assets/alpha-k8joGREE.mp4" type="video/mp4" />
          Your browser doesn't support HTML5 video. Please try a different browser.
        </video>
        <div className="sw-hero-overlay" />
        <button
          aria-label="Toggle mute"
          className="sw-hero-mute-btn"
          onClick={toggleHeroMute}
          title={videoMuted ? 'Unmute' : 'Mute'}
        >
          {/* simple speaker icon with x when muted */}
          {videoMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="#fff">
              <path d="M3 10v4h4l5 5V5L7 10H3zm13.59 2l2.3 2.29 1.42-1.41L18.41 12l1.9-1.88-1.42-1.41L16.17 10l-1.88-1.89-1.41 1.41L13.34 12l-1.89 1.88 1.41 1.41L16.17 14l2.32 2.29 1.42-1.41L18.41 12z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="#fff">
              <path d="M3 10v4h4l5 5V5L7 10H3zm13 2a4 4 0 0 1-2 3.46v-6.92A4 4 0 0 1 16 12zm2 0c0-2.97-2.16-5.43-5-5.91v1.53a4.99 4.99 0 0 1 0 8.76v1.53c2.84-.48 5-2.94 5-5.91z" />
            </svg>
          )}
        </button>
        <section className="sw-hero-content-section">
          <div className="sw-hero-content">
            <h1 className="world-title">Alpha Lions</h1>
            <p className="world-desc">
              Step into the wild and witness the birth of something never seen before on any blockchain
              — Alpha Lions, a groundbreaking 1,111-piece collection forged in hand crafted clay style,
              brought to life with over 160 traits and crowned with 33 legendary 1/1 masterpieces.
              Every Alpha Lion tells a story crafted with precision, purpose, and soul. These are not random pixels;
              they are powerful digital totems, sculpted to inspire, lead, and dominate the chain they walk on.
              But Alpha Lions isn't just about the art. It's about the community behind the roar. We're building a pride —
              a powerful, creative, and united force that will shape the future. Holders aren't just collectors; they're
              founding members of a legacy, the heart of a new digital tribe. Our mission is bold: Make a great Alpha Lions
              community. Roar louder than anyone ever has. This is art with meaning. A movement with momentum. Join the pride.
              Become an Alpha. Rule with us.
            </p>
          </div>
        </section>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <header>
              <h2 id="modalTitle">Wallet verification</h2>
              <button className="close-x" aria-label="Close" onClick={() => setModalOpen(false)}>×</button>
            </header>
            <div className="content">
              {step === 1 && (
                <section>
                  <div className="field">
                    <label className="label" htmlFor="walletInput">Wallet address</label>
                    <input ref={walletInputRef} id="walletInput" className="input" placeholder="e.g. 0x4352...EdB2" value={wallet} onChange={(e) => setWallet(e.target.value)} spellCheck={false} autoComplete="off" />
                    <div className="help">Format: EVM 0x + 40 hex characters.</div>
                    {!!walletError && <div className="error">{walletError}</div>}
                  </div>
                </section>
              )}

              {step === 2 && (
                <section>
                  <div className="status info" style={{ marginBottom: 12 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: 'linear-gradient(180deg,#7c5cff,#6144ff)' }} />
                    <div>
                      <div><strong>Step 2</strong> — Add this code to your Magic Eden bio</div>
                      <div className="small muted">Keep it exactly as shown. You can remove it after verification.</div>
                    </div>
                  </div>
                  <div className="code-box" style={{ marginBottom: 10 }}>
                    <span className="code-text">{code || 'ME-VERIFY-XXXXXX'}</span>
                    <button className="btn" onClick={() => copyToClipboard(code || '')} title="Copy code">Copy</button>
                  </div>
                  <div className="small muted" style={{ marginBottom: 10 }}>Open your profile bio page and paste the code anywhere visible. Then click "Verify now".</div>
                  <a className="btn" href={buildProfileUrl(wallet)} target="_blank" rel="noopener">Open my Magic Eden profile</a>
                </section>
              )}

              {step === 3 && (
                <section>
                  {checking && (
                    <div className="status info"><div className="spinner" /> <div>Checking your profile for the verification code…</div></div>
                  )}
                  {!checking && verified && (
                    <div>
                      <div className="status success"><div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--success)' }} /> <div><strong>Verified!</strong> Your code was found on your Magic Eden bio.</div></div>
                      {profileName && (
                        <div className="status info" style={{ marginTop: 8 }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)' }} />
                          <div>Detected profile name: <strong>{profileName}</strong></div>
                        </div>
                      )}
                    </div>
                  )}
                  {!checking && !verified && !!verifyError && (
                    <div className="status error"><div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--danger)' }} /> <div><strong>Not found yet</strong>. {verifyError}</div></div>
                  )}
                  {verified && (
                    <div style={{ marginTop: 10 }}>
                      {nftLoading && (<div className="status info"><div className="spinner" /> <div>Fetching NFT holdings for the verified wallet…</div></div>)}
                      {!nftLoading && !nftError && (
                        <div>
                          <div className="status success"><div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--success)' }} /> <div><div><strong>{nftName}</strong></div><div className="small muted">Total owned from contract <span>{nftCount}</span></div></div></div>
                          
                          {/* Alpha Role Section */}
                          <div style={{ marginTop: 12 }}>
                            {!roleSaved && !roleSaving && (
                              <div>
                                <div className="status info">
                                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)' }} />
                                  <div>
                                    <div><strong>NFT Count: {nftCount}</strong></div>
                                    <div className="small muted">Click below to verify and assign your alpha role</div>
                                  </div>
                                </div>
                                
                                <div style={{ marginTop: 8 }}>
                                  <button 
                                    className="btn primary" 
                                    onClick={() => saveAlphaRole(parseInt(nftCount))}
                                    style={{ fontSize: '14px', padding: '8px 16px' }}
                                  >
                                    Verify Alpha Role
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            {roleSaving && (
                              <div className="status info">
                                <div className="spinner" />
                                <div>Verifying your alpha role...</div>
                              </div>
                            )}
                            
                            {roleError && (
                              <div className="status error" style={{ marginTop: 8 }}>
                                <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--danger)' }} />
                                <div>{roleError}</div>
                              </div>
                            )}
                            
                            {roleSaved && alphaRole && (
                              <div>
                                <div className="status success">
                                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--success)' }} />
                                  <div>
                                    <div><strong>Alpha Role: {alphaRole.roleName || 'No Role'}</strong></div>
                                    <div className="small muted">{alphaRole.description}</div>
                                    {savedWallet && (
                                      <div className="small muted">Linked wallet: {savedWallet}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="status success" style={{ marginTop: 8 }}>
                                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--success)' }} />
                                  <div><strong>Alpha Role Verified!</strong> Your role has been saved to your profile.</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {!nftLoading && !!nftError && (
                        <div className="status error"><div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--danger)' }} /> <div><div><strong>Could not fetch NFT info.</strong></div><div className="small muted">{nftError}</div></div></div>
                      )}
                    </div>
                  )}
                </section>
              )}
            </div>
            <div className="footer">
              <button className="btn" onClick={() => setStep((s) => (s === 3 ? 2 : 1))}>Back</button>
              {step === 1 && (
                <button className="btn primary" onClick={() => {
                  if (!validateAddress(wallet)) { setWalletError('Please enter a valid EVM wallet address (0x + 40 hex).'); return; }
                  setWalletError('');
                  const c = genCode(); setCode(c); setStep(2);
                }}>Next</button>
              )}
              {step === 2 && (
                <button className="btn primary" onClick={async () => {
                  setStep(3); setChecking(true); setVerified(false); setVerifyError(''); setNftError('');
                  const result = await verifyProfileHasCode(wallet, code);
                  setChecking(false);
                  if ((result as any).ok) {
                    setVerified(true);
                    const disp = (result as any).displayName || '';
                    setProfileName(disp);
                    fetchNfts(wallet).catch(() => {});
                  } else {
                    setVerified(false); setVerifyError((result as any).reason || 'Make sure you pasted the code and saved your bio.');
                  }
                }}>Verify now</button>
              )}
              {step === 3 && (
                <button className="btn" onClick={() => setModalOpen(false)}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}

      
    

   
    
    </div>
    <Footer />
    </>
  );
};

export default Task;


