import { User, LogOut, ChevronDown, Plus, ArrowUpDown, History, Wallet, Menu, X, Download } from "lucide-react";
import NotificationBell, { type NotificationItem } from './NotificationBell';
import MatchNotificationModal from './MatchNotificationModal';
import AnnouncementBar from './AnnouncementBar';
import { useEffect, useState } from "react";
import { useWallet } from '../context/WalletContext';
import { requestForToken, messaging, onMessage, initializeMessaging } from '../lib/firebase';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./css/Header.css";

interface DecodedToken {
    userId: string;
    name: string;
    email: string;
    role: string;
    iat: number;
}

export const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const { walletBalance, setWalletBalance } = useWallet();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [matchModalOpen, setMatchModalOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<NotificationItem | null>(null);

    const fetchWalletBalance = async () => {
        try {
            setIsLoadingBalance(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setWalletBalance(0);
                return;
            }
            // Decode JWT token to get user ID
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                const userId = decoded.userId;
                if (!userId) {
                    setWalletBalance(0);
                    return;
                }
                // Fetch wallet balance using user ID
                const apiUrl = `${import.meta.env.VITE_API_URL}/api/wallet/balance?id=${userId}`;
                const response = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                   
                    
                    setWalletBalance(data.totalBalance);
                } else {
                    setWalletBalance(0);
                }
            } catch {
                setWalletBalance(0);
            }
        } catch {
            setWalletBalance(0);
        } finally {
            setIsLoadingBalance(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        if (token) {
            fetchWalletBalance();
            // Request device token for notifications
            const vapidKey = "BKhfMR7hWm_pYvtFK_Z0Eev1HadfRuB7v8hGWy_HLoP3UJDzdUkXNTa6-NDuWtze9BPm1r7jheJT6n598EUZI_s"; // Replace with your actual VAPID key
            requestForToken(vapidKey).then((deviceToken) => {
                if (deviceToken) {
                    // Send deviceToken to backend or save as needed
                    // console.log("Device token:", deviceToken);
                } else {
                    console.warn("No device token received");
                }
            });
        }
    }, [setWalletBalance]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setWalletBalance(0);
        setIsLoadingBalance(false);
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleDownloadApk = async () => {
        try {
            const base = import.meta?.env?.VITE_API_URL || '';
            const res = await fetch(`${base}/api/apk/latest/public`, { method: 'GET' });
            if (res.ok) {
                const data = await res.json().catch(() => ({}));
                const url = (data && (data.downloadUrl || data.url)) ?
                    ((data.downloadUrl?.startsWith('http') || data.url?.startsWith('http')) ? (data.downloadUrl || data.url) : `${base}${data.downloadUrl || data.url}`)
                    : undefined;
                if (url) {
                    window.location.href = url;
                    return;
                }
            }
            // Fallback to static path if API fails
            window.location.href = `${base}/uploads/apk/alpha_lions_v001.apk`;
        } catch (e) {
            // Final fallback: open current known file
            const base = import.meta?.env?.VITE_API_URL || '';
            window.open(`${base}/uploads/apk/alpha_lions_v001.apk`, '_blank');
        }
    };


    return (
        <>
            <AnnouncementBar />
            <header className="header-responsive bg-black text-white">
                <div className="header-container">
                    <div className="header-content">
                        {/* Logo Section */}
                        <div className="header-logo">
                            <a href="/">
                                <img
                                    src="/alphalogo.png"
                                    alt="FF Esports"
                                    className="logo-img"
                                />
                            </a>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="desktop-nav">
                            <a href="/" className="nav-link">EVENTS</a>
                            <a href="/tournament" className="nav-link">TOURNAMENT</a>
                            <a href="/task" className="nav-link">Lions NFT</a>
                            <a href="/about" className="nav-link">ABOUT US</a>
                            <a href="/contact" className="nav-link">CONTACT US</a>
                            <a href="/blog" className="nav-link">BLOG</a>
                        </nav>

                        {/* Right Side Actions */}
                        <div className="header-actions">
                            {/* Desktop-only Download App */}
                            <button
                                className="wallet-button app-button desktop-only"
                                title="Download App"
                                onClick={handleDownloadApk}
                            >
                                <span className="download-text">Download App</span>
                                <Download className="download-icon w-4 h-4" />
                            </button>

                            {isLoggedIn ? (
                                <div className="user-section">
                                    {/* Wallet Balance Button */}
                                    {/* Notifications Bell */}



                                    <button
                                        onClick={toggleDropdown}
                                        className="wallet-button"
                                        title="Click to view wallet options"
                                    >
                                        <img src="/assets/vector/Coin.png" alt="Coin" className="coin-icon" />
                                        <span className="wallet-balance">
                                            {isLoadingBalance ? "Loading..." : walletBalance.toFixed(2)}
                                        </span>
                                        <ChevronDown className={`chevron-icon ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>



                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className="dropdown-menu">
                                            <div className="dropdown-content">
                                                <button
                                                    onClick={() => {
                                                        navigate('/profile');
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="dropdown-item"
                                                >
                                                    <User className="dropdown-icon text-gray-700" />
                                                    My Profile
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate('/wallets');
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="dropdown-item"
                                                >
                                                    <Plus className="dropdown-icon text-orange-500" />
                                                    Add Coin
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate('/wallets');
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="dropdown-item"
                                                >
                                                    <ArrowUpDown className="dropdown-icon text-blue-500" />
                                                    Withdrawal
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate('/ongoing');
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="dropdown-item"
                                                >
                                                    <History className="dropdown-icon text-green-500" />
                                                    Ongoing Matches
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate('/upcoming');
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="dropdown-item"
                                                >
                                                    <History className="dropdown-icon text-yellow-500" />
                                                    Upcoming Matches
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate('/completed');
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="dropdown-item"
                                                >
                                                    <History className="dropdown-icon text-blue-500" />
                                                    Completed Matches
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate('/cancelled');
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="dropdown-item"
                                                >
                                                    <History className="dropdown-icon text-red-500" />
                                                    Cancelled Matches
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate('/wallets');
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="dropdown-item"
                                                >
                                                    <Wallet className="dropdown-icon text-purple-500" />
                                                    Wallet History
                                                </button>

                                                <button
                                                    onClick={handleLogout}
                                                    className="dropdown-item logout-item"
                                                >
                                                    <LogOut className="dropdown-icon" />
                                                    LOG OUT
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Click outside to close dropdown */}
                                    {isDropdownOpen && (
                                        <div
                                            className="dropdown-overlay"
                                            onClick={() => setIsDropdownOpen(false)}
                                        />
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="login-button"
                                >
                                    LOGIN
                                </button>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={toggleMobileMenu}
                                className="mobile-menu-toggle"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                            <NotificationBell byBookings onOpenMatch={(n) => { setSelectedMatch(n); setMatchModalOpen(true); }} />
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    <div className={`mobile-menu ${isMobileMenuOpen ? 'show' : ''}`}>
                        <nav className="mobile-nav">
                            {/* Mobile-only Download App button */}
                            <button className="wallet-button app-button mobile-only" onClick={() => { handleDownloadApk(); closeMobileMenu(); }}>
                                <span className="download-text">Download App</span>
                                <Download className="download-icon w-4 h-4" />
                            </button>
                            <a href="/" className="mobile-nav-link" onClick={closeMobileMenu}>EVENTS</a>
                            <a href="/tournament" className="mobile-nav-link" onClick={closeMobileMenu}>TOURNAMENT</a>
                            <a href="/task" className="mobile-nav-link" onClick={closeMobileMenu}>Lions NFT</a>
                            <a href="/about" className="mobile-nav-link" onClick={closeMobileMenu}>ABOUT US</a>
                            <a href="/contact" className="mobile-nav-link" onClick={closeMobileMenu}>CONTACT US</a>
                        </nav>
                    </div>

                    {/* Mobile Menu Overlay */}
                    {isMobileMenuOpen && (
                        <div
                            className="mobile-menu-overlay"
                            onClick={closeMobileMenu}
                        />
                    )}
                </div>
                <MatchNotificationModal open={matchModalOpen} onClose={() => setMatchModalOpen(false)} item={selectedMatch} />
            </header>
        </>
    );
};