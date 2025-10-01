import { User, LogOut, ChevronDown, Plus, ArrowUpDown, History, Wallet, Menu, X } from "lucide-react";
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

    // Remove local walletBalance state, use context instead
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
                    let balance = 0;
                    if (data.wallet !== undefined) {
                        balance = data.wallet;
                    } else if (data.balance !== undefined) {
                        balance = data.balance;
                    } else if (data.amount !== undefined) {
                        balance = data.amount;
                    } else if (typeof data === 'number') {
                        balance = data;
                    }
                    setWalletBalance(balance);
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

    // Listen for foreground FCM messages
    // useEffect(() => {
    //     let unsubscribe: (() => void) | undefined;

    //     const initMessaging = async () => {
    //         const isMessagingSupported = await initializeMessaging();
    //         if (isMessagingSupported && messaging) {
    //             unsubscribe = onMessage(messaging, (payload) => {
    //                 // You can show a toast or notification here
    //                 // console.log('Received foreground message:', payload);
    //             });
    //         }
    //     };

    //     initMessaging().catch(console.error);

    //     return () => {
    //         if (typeof unsubscribe === 'function') unsubscribe();
    //     };
    // }, []);

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

    const handleDownloadApk = () => {
        try {
            const apkUrl = 'https://api1.alphalions.io/uploads/apk/alpha_lions_v001.apk';
            // Prefer opening in the same tab to allow direct download on most browsers
            window.location.href = apkUrl;
        } catch (e) {
            // Fallback
            window.open('https://api1.alphalions.io/uploads/apk/alpha_lions_v001.apk', '_blank');
        }
    };


    return (
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
                    </nav>

                    {/* Right Side Actions */}
                    <div className="header-actions">
                        {/* Desktop-only Download App */}
                        <button
                            className="wallet-button app-button desktop-only"
                            title="Click to view wallet options"
                            onClick={handleDownloadApk}
                        >
                            Download App
                        </button>
                        {isLoggedIn ? (
                            <div className="user-section">
                                {/* Wallet Balance Button */}



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
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={`mobile-menu ${isMobileMenuOpen ? 'show' : ''}`}>
                    <nav className="mobile-nav">
                        {/* Mobile-only Download App button */}
                        <button className="wallet-button app-button mobile-only" onClick={() => { handleDownloadApk(); closeMobileMenu(); }}>
                            Download App
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
        </header>
    );
};