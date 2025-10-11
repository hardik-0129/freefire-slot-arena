import React from 'react';
import './css/LandingPage.css';

const LandingPage = () => {
  const getApiBase = () => {
    const envBase = (import.meta as any)?.env?.VITE_API_URL;
    if (envBase) return envBase;
    try {
      const origin = window.location.origin;
      // Dev: frontend 8080, backend 5000
      // if (origin.includes('localhost:8080')) return origin.replace(':8080', ':5000');
      // Fallback to same origin
      return origin;
    } catch {
      return '';
    }
  };

  const handleDownloadApk = async () => {
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/apk/latest/public`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const url = (data && (data.downloadUrl || data.url))
          ? ((data.downloadUrl?.startsWith('http') || data.url?.startsWith('http'))
              ? (data.downloadUrl || data.url)
              : `${base}${data.downloadUrl || data.url}`)
          : undefined;
        if (url) {
          window.location.href = url;
          return;
        }
      }
      // Fallback to static path if API fails
      window.location.href = `${base}/uploads/apk/alpha_lions_v001.apk`;
    } catch (e) {
      // Final fallback
      const base = getApiBase();
      window.open(`${base}/uploads/apk/alpha_lions_v001.apk`, '_blank');
    }
  };


  return (
    <div className="landingPage-container container">
      <div className="left">
        <button className="download-btn" onClick={handleDownloadApk}>DOWNLOAD NOW!</button>
      </div>

      <div className="right">
        <img src="/ogimageAlphalions.png" alt="Alpha Lions Logo"/>
      </div>
    </div>
  );
};

export default LandingPage;
