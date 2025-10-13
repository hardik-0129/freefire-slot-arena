import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import Footer from '@/components/Footer'
import { Header } from '@/components/Header'
import "../components/css/FullMap.css"
import "../components/css/MatchModal.css"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { jwtDecode } from 'jwt-decode'

interface Slot {
    _id: string;
    slotType: string;
    entryFee: number;
    matchTime: string;
    perKill: number;
    totalWinningPrice: number;
    maxBookings: number;
    remainingBookings: number;
    customStartInMinutes: number;
    createdAt: string;
    updatedAt: string;
    gameMode?: string;
    bannerImage?: string;
    matchIndex?: number;
    status?: 'upcoming' | 'live' | 'completed' | 'cancelled' | 'canceled' | string;
    matchTitle?: string;
    specialRules?: string;
    tournamentName?: string;
    streamLink?: string;
}

interface GameTypeData {
    _id: string;
    gameType: string;
    image?: string;
    isActive?: boolean;
}

const FullMap = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState<'upcoming' | 'live' | 'completed'>('upcoming');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Slot | null>(null);
    const [bookingDetails, setBookingDetails] = useState<null | {
        selectedPositions: Record<string, string[]>;
        playerIndex: number[];
        playerNames: Record<string, string>;
    }>(null);

    console.log('bookingDetails', bookingDetails);

    // Get the selected game type data from navigation state or query string
    const selectedGameTypeData: GameTypeData | undefined = location.state?.selectedGameType || location.state?.gameTypeData;
    const selectedGameTypeState = location.state?.gameType || selectedGameTypeData?.gameType;
    const querySelectedGameType = new URLSearchParams(location.search).get('gameType') || undefined;
    const selectedType = querySelectedGameType || selectedGameTypeState;

    // Route info (kept for navigation state only; no static filtering)
    const isFullMapPage = location.pathname === '/fullmap';

    useEffect(() => {
        fetchSlots();
    }, [selectedType]);

    const fetchSlots = async () => {
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/admin/slots`;
        try {
            setLoading(true);
            setError('');

            const response = await axios.get(apiUrl);
            let slotsData = response.data?.slots ?? response.data ?? [];

            if (!Array.isArray(slotsData)) {
                setSlots([]);
                setError('Invalid data format received from server');
                return;
            }

            // Store all slots; filtering is handled in visibleSlots to allow Completed to show all
            setSlots(slotsData);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch slots data';
            setError(`Failed to fetch slots data: ${errorMessage}`);
            setSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const resolveStatus = (slot: Slot): 'upcoming' | 'live' | 'completed' | 'cancelled' => {
        // Normalize any explicit status first
        const raw = String(slot.status || '').toLowerCase();
        if (raw === 'cancelled' || raw === 'canceled') return 'cancelled';
        if (raw === 'upcoming' || raw === 'live' || raw === 'completed') return raw as any;
        // Fallback by time window (live = within 2 hours after start)
        const now = new Date();
        const start = new Date(slot.matchTime);
        const diffMinutes = (start.getTime() - now.getTime()) / (1000 * 60);
        if (diffMinutes > 0) return 'upcoming';
        if (diffMinutes <= 0 && diffMinutes > -120) return 'live';
        return 'completed';
    };

    // Helper to check if a slot matches the current page's game type
    const matchesSelectedType = (slot: Slot) => {
        // Purely API-driven: if a selected type exists, require exact slotType match.
        // If no selected type, show all slots (no static assumptions).
        return selectedType ? slot.slotType === selectedType : true;
    };

    // Filter slots by status and game type
    const visibleSlots = slots
        .filter(slot => {
            // Hide all cancelled matches from any tab
            if (resolveStatus(slot) === 'cancelled') return false;
            const statusMatches = resolveStatus(slot) === activeFilter;
            if (!statusMatches) return false;
            return matchesSelectedType(slot);
        })
        .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime());

    const handleFilterChange = (filter: 'upcoming' | 'live' | 'completed') => {
        setActiveFilter(filter);
    };

    // Modal functions
    const loadBookingDetails = async (slotId: string) => {
        try {
            let userId = '';
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode<{ userId?: string }>(token);
                    userId = decoded.userId || '';
                } catch { }
            }
            console.log('userId', userId);
            if (!userId) { setBookingDetails(null); return; }
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/user-booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ userId, slotId })
            });
            if (!res.ok) { setBookingDetails(null); return; }
            const data = await res.json();
            const b = data?.bookings || {};
            setBookingDetails({
                selectedPositions: b.selectedPositions || {},
                playerIndex: Array.isArray(b.playerIndex) ? b.playerIndex : [],
                playerNames: b.playerNames || {}
            });
        } catch {
            setBookingDetails(null);
        }
    };

    const openModal = (slot: Slot) => {
        setSelectedMatch(slot);
        setShowModal(true);
        loadBookingDetails(slot._id);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedMatch(null);
    };

    if (loading) {
        return (
            <>
                <Header />
                <section className="py-16 match-section">
                    <div className="container">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Loading tournaments...</h2>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }

    // Date/time formatters
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
        return `${formattedHours}:${minutes} ${ampm}`;
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Lightweight countdown badge for upcoming matches
    const CountdownBadge: React.FC<{ target: string }> = ({ target }) => {
        const [now, setNow] = useState<number>(Date.now());
        useEffect(() => {
            const id = setInterval(() => setNow(Date.now()), 1000);
            return () => clearInterval(id);
        }, []);
        const targetMs = new Date(target).getTime();
        let diff = targetMs - now; // ms
        if (diff <= 0) return null;
        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const pad = (n: number) => n.toString().padStart(2, '0');
        const text = days > 0
            ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
            : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        return (
            <span
                style={{
                    fontSize: 12,
                }}
                title={new Date(target).toLocaleString('en-IN')}
            >
                {text}
            </span>
        );
    };

    return (
        <>
            <Header />
            <section className="py-16 match-section">
                <div className="container">

                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-center mb-8 sm:mb-12 px-4">
                        {selectedType ? `${selectedType} Tournaments` : 'Tournaments'}
                    </h2>

                    {/* Filter Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center mb-8 gap-2 sm:gap-4 px-4">
                        <button
                            onClick={() => handleFilterChange('upcoming')}
                            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-200 text-sm sm:text-base ${activeFilter === 'upcoming' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Upcoming Matches
                        </button>
                        <button
                            onClick={() => handleFilterChange('live')}
                            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-200 text-sm sm:text-base ${activeFilter === 'live' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Live Matches
                        </button>
                        <button
                            onClick={() => handleFilterChange('completed')}
                            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-200 text-sm sm:text-base ${activeFilter === 'completed' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Completed Matches
                        </button>
                    </div>
                    {visibleSlots.length === 0 && !error ? (
                        <div className="w-full flex items-center justify-center py-16 px-4">
                            <p className="text-lg sm:text-xl text-gray-600 text-center">No {activeFilter} tournaments available at the moment.</p>
                        </div>
                    ) : (
                        <div className="card-container">
                            {visibleSlots.map((slot) => {
                                const currentSlots = slot.maxBookings - slot.remainingBookings;
                                const isFree = Number(slot.entryFee) <= 0;

                                const handleCardClick = () => {
                                    openModal(slot);
                                    loadBookingDetails(slot._id);
                                    // loadBookingDetails()
                                };

                                const handleJoinClick = (e: React.MouseEvent) => {
                                    e.stopPropagation(); // Prevent card click when button is clicked
                                    const status = resolveStatus(slot);
                                    if (status === 'live' || status === 'completed') {
                                        // For live and completed matches, open stream link
                                        if (slot.streamLink) {
                                            window.open(slot.streamLink, '_blank');
                                        } else {
                                            alert('Stream link not available for this match');
                                        }
                                    } else {
                                        // For upcoming matches, navigate to detail page
                                        navigate(`/detail`, {
                                            state: {
                                                slotData: slot,
                                                slotId: slot._id
                                            }
                                        });
                                    }
                                };

                                return (
                                    <div key={slot._id} className="match-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
                                        <div style={{ position: 'relative' }}>
                                            <Skeleton height={0} style={{ paddingBottom: '56.25%', borderRadius: 12 }} baseColor="#eeeeee" highlightColor="#f5f5f5" />
                                            <img
                                                src={slot.bannerImage || "/assets/images/category.png"}
                                                alt="Free Fire"
                                                className="match-image"
                                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                                                loading="lazy"
                                                onError={e => { (e.target as HTMLImageElement).src = "/assets/images/category.png"; }}
                                            />
                                        </div>
                                        <div className="match-top">
                                            <div>
                                                <span className="badge orange">
                                                    {(slot.gameMode || 'SOLO').toUpperCase()}
                                                </span>

                                                <span className={`badge black`}>
                                                    {resolveStatus(slot).toUpperCase()}
                                                </span>
                                                {resolveStatus(slot) === 'upcoming' && (
                                                    <span className="badge black"><CountdownBadge target={slot.matchTime} /></span>
                                                )}
                                                <span className="match-id">MATCH #{slot.matchIndex}</span>
                                            </div>
                                        </div>
                                        <h3 className="match-title">
                                            {`${slot.matchTitle || `FF ${slot.gameMode?.toUpperCase() || 'SOLO'} TOURNAMENT`} (${slot.specialRules || 'RULES'}) ${slot.tournamentName || ''}`}
                                        </h3>
                                        <div className="match-details-box">
                                            <div className="date-time">
                                                {formatDate(slot.matchTime)} <span className="time">{formatTime(slot.matchTime)}</span>
                                            </div>
                                            <div className="prize-pill-container">
                                                <div className="prize-pill">
                                                    <div className="pill-label">PER KILL</div>
                                                    <div className="pill-value">
                                                        <img src="/assets/vector/Coin.png" alt="Coin" />
                                                        {slot.perKill}
                                                    </div>
                                                </div>
                                                <div className="prize-pill">
                                                    <div className="pill-label">WINNING PRIZE</div>
                                                    <div className="pill-value">
                                                        <img src="/assets/vector/Coin.png" alt="Coin" />
                                                        {slot.totalWinningPrice}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="slots-row">
                                            <p className="text-sm font-medium">{currentSlots}/{slot.maxBookings}</p>
                                            <div className="flex items-center gap-2 w-full">
                                                <div className="w-full bg-black rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-[#ff8400] h-full rounded-full"
                                                        style={{ width: `${(currentSlots / slot.maxBookings) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className={`join-btn${currentSlots >= slot.maxBookings && resolveStatus(slot) === 'upcoming' ? ' opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={handleJoinClick}
                                            disabled={currentSlots >= slot.maxBookings && resolveStatus(slot) === 'upcoming'}
                                            title={currentSlots >= slot.maxBookings && resolveStatus(slot) === 'upcoming' ? 'Slot is full' : ''}
                                        >
                                            {resolveStatus(slot) === 'upcoming' ? (
                                                <>
                                                    {!isFree && <img src="/assets/vector/Coin.png" alt="Coin" />}
                                                    <span style={{ fontWeight: "850", textAlign: "center" }}> {isFree ? 'FREE' : slot.entryFee} JOIN</span>
                                                    <img
                                                        src="/assets/vector/Vector-Arrow.png"
                                                        alt="Arrow"
                                                        style={{
                                                            width: '6.175px',
                                                            height: '10px',
                                                            transform: 'rotate(0deg)',
                                                            opacity: 1,
                                                            position: 'relative',
                                                            top: '-2px',
                                                            left: '7.16px'
                                                        }}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <span style={{ fontWeight: "850", textAlign: "center" }}>SPECTATE</span>
                                                    <img
                                                        src="/assets/vector/Vector-Arrow.png"
                                                        alt="Arrow"
                                                        style={{
                                                            width: '6.175px',
                                                            height: '10px',
                                                            transform: 'rotate(0deg)',
                                                            opacity: 1,
                                                            position: 'relative',
                                                            top: '-2px',
                                                            left: '7.16px'
                                                        }}
                                                    />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
            <Footer />

            {/* Match Details Modal */}
            {showModal && selectedMatch && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2 className="modal-title">Match Details</h2>
                            <button
                                onClick={closeModal}
                                className="modal-close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-content">
                            {/* Match Info */}
                            <div className="match-info-section">
                                <h3 className="match-info-title">
                                    MATCH #{selectedMatch._id.slice(-4)} - {selectedMatch.slotType?.toUpperCase()}
                                </h3>
                                <div className="match-info-grid">
                                    <div className="match-info-item">
                                        <div className="match-info-label">Tournament</div>
                                        <div className="match-info-value">{selectedMatch.tournamentName || '#ALPHALIONS'}</div>
                                    </div>
                                    <div className="match-info-item">
                                        <div className="match-info-label">Map</div>
                                        <div className="match-info-value">{selectedMatch.gameMode || 'Random'}</div>
                                    </div>
                                    <div className="match-info-item">
                                        <div className="match-info-label">Match Time</div>
                                        <div className="match-info-value">{formatDateTime(selectedMatch.matchTime)}</div>
                                    </div>
                                    <div className="match-info-item">
                                        <div className="match-info-label">Per Kill</div>
                                        <div className="match-info-value">₹{selectedMatch.perKill}</div>
                                    </div>
                                    <div className="match-info-item">
                                        <div className="match-info-label">Winning Prize</div>
                                        <div className="match-info-value">₹{selectedMatch.totalWinningPrice}</div>
                                    </div>
                                    <div className="match-info-item">
                                        <div className="match-info-label">Entry Fee</div>
                                        <div className="match-info-value">₹{selectedMatch.entryFee}</div>
                                    </div>
                                    <div className="match-info-item">
                                        <div className="match-info-label">Max Players</div>
                                        <div className="match-info-value">{selectedMatch.maxBookings}</div>
                                    </div>
                                    <div className="match-info-item">
                                        <div className="match-info-label">Remaining Slots</div>
                                        <div className="match-info-value">{selectedMatch.remainingBookings}</div>
                                    </div>
                                    <div className="match-info-item">
                                        <div className="match-info-label">Special Rules</div>
                                        <div className="match-info-value">{selectedMatch.specialRules || 'None'}</div>
                                    </div>
                                    {/* {selectedMatch.roomId && (
                                        <div className="match-info-item">
                                            <div className="match-info-label">Room ID</div>
                                            <div className="match-info-value">{selectedMatch.roomId}</div>
                                        </div>
                                    )}
                                    {selectedMatch.matchPassword && (
                                        <div className="match-info-item">
                                            <div className="match-info-label">Match Password</div>
                                            <div className="match-info-value">{selectedMatch.matchPassword}</div>
                                        </div>
                                    )} */}
                                    {selectedMatch.streamLink && (
                                        <div className="match-info-item">
                                            <div className="match-info-label">Stream Link</div>
                                            <div className="match-info-value">
                                                <a
                                                    href={selectedMatch.streamLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: 'white', textDecoration: 'underline' }}
                                                >
                                                    Watch Live Stream
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Match Statistics */}
                            <div className="summary-section">
                                <h4 className="summary-title">Match Statistics</h4>
                                <div className="summary-stats">
                                    <div className="summary-stat">
                                        <div className="summary-stat-value">{selectedMatch.maxBookings - selectedMatch.remainingBookings}</div>
                                        <div className="summary-stat-label">Players Joined</div>
                                    </div>
                                    <div className="summary-stat">
                                        <div className="summary-stat-value">{selectedMatch.remainingBookings}</div>
                                        <div className="summary-stat-label">Remaining Slots</div>
                                    </div>
                                    <div className="summary-stat">
                                        <div className="summary-stat-value">{Number(selectedMatch.entryFee) <= 0 ? 'FREE' : `₹${selectedMatch.entryFee}`}</div>
                                        <div className="summary-stat-label">Entry Fee</div>
                                    </div>
                                </div>
                            </div>

                            {/* User Booking Details (if any) */}
                            {bookingDetails && (
                                <div className="summary-section">
                                    <h4 className="summary-title">Your Booking</h4>
                                    <div className="summary-stats" style={{ gap: 12, alignItems: 'flex-start' }}>
                                        <div className="summary-stat" style={{ alignItems: 'flex-start' }}>
                                            <div className="summary-stat-label">Selected Positions</div>
                                            <div className="summary-stat-value" style={{ fontSize: 14, textAlign: 'left' }}>
                                                {Object.keys(bookingDetails.selectedPositions).length === 0 ? '-'
                                                    : Object.entries(bookingDetails.selectedPositions).map(([team, positions]) => (
                                                        <div key={team}>{team}: {positions.join(', ')}</div>
                                                    ))}
                                            </div>
                                        </div>
                                        <div className="summary-stat" style={{ alignItems: 'flex-start' }}>
                                            <div className="summary-stat-label">Player Index</div>
                                            <div className="summary-stat-value" style={{ fontSize: 14 }}>{bookingDetails.playerIndex?.join(', ') || '-'}</div>
                                        </div>
                                        <div className="summary-stat" style={{ alignItems: 'flex-start' }}>
                                            <div className="summary-stat-label">Player Names</div>
                                            <div className="summary-stat-value" style={{ fontSize: 14, textAlign: 'left' }}>
                                                {Object.keys(bookingDetails.playerNames).length === 0 ? '-'
                                                    : Object.entries(bookingDetails.playerNames).map(([k, v]) => (
                                                        <div key={k}>{k}: {v}</div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                onClick={closeModal}
                                className="close-button"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default FullMap
