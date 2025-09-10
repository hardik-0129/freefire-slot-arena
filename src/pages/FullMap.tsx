import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import Footer from '@/components/Footer'
import { Header } from '@/components/Header'
import "../components/css/FullMap.css"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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
    status?: 'upcoming' | 'live' | 'completed';
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

    // Get the selected game type data from navigation state
    const selectedGameTypeData: GameTypeData | undefined = location.state?.selectedGameType || location.state?.gameTypeData;
    const selectedGameType = location.state?.gameType || selectedGameTypeData?.gameType;

    // Check current route to determine game type (fallback for direct navigation)
    const isClashSquad = location.pathname === '/clash-squad' || selectedGameType === 'Clash Squad';
    const isLoneWolf = location.pathname === '/lone-wolf' || selectedGameType === 'Lone Wolf';
    const isSurvival = location.pathname === '/survival' || selectedGameType === 'Survival';
    const isFreeMatches = location.pathname === '/free-matches' || selectedGameType === 'Free Matches';

    useEffect(() => {
        fetchSlots();
    }, [selectedGameType]);

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

    const resolveStatus = (slot: Slot): 'upcoming' | 'live' | 'completed' => {
        if (slot.status === 'upcoming' || slot.status === 'live' || slot.status === 'completed') {
            return slot.status;
        }
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
        if (selectedGameType) {
            return slot.slotType?.toLowerCase().includes(selectedGameType.toLowerCase());
        } else if (isClashSquad) {
            return slot.slotType === 'Clash Squad' || slot.gameMode === 'Clash Squad';
        } else if (isLoneWolf) {
            return slot.slotType === 'Lone Wolf' || slot.gameMode === 'Lone Wolf';
        } else if (isSurvival) {
            return slot.slotType === 'Survival' || slot.gameMode === 'Survival';
        } else if (isFreeMatches) {
            return slot.slotType === 'Free Matches' || slot.gameMode === 'Free Matches';
        }
        
        // For Full Map page, filter by Squad matches only
        // Check if it's a Squad match by looking at slotType or gameMode
        const isSquadMatch = slot.slotType?.toLowerCase().includes('squad') || 
                           slot.gameMode?.toLowerCase().includes('squad') ||
                           slot.slotType?.toLowerCase().includes('clash squad') ||
                           slot.gameMode?.toLowerCase().includes('clash squad');
        
        return isSquadMatch;
    };

    // Filter slots by status and game type
    const visibleSlots = slots.filter(slot => {
        const statusMatches = resolveStatus(slot) === activeFilter;
        if (!statusMatches) return false;
        return matchesSelectedType(slot);
    });

    const handleFilterChange = (filter: 'upcoming' | 'live' | 'completed') => {
        setActiveFilter(filter);
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

    return (
        <>
            <Header />
            <section className="py-16 match-section">
                <div className="container">
                    <h2 className="text-[42px] font-bold text-center mb-12">
                        {`${selectedGameType || 'Full Map'} Tournaments`}
                    </h2>

                    {/* Filter Buttons */}
                    <div className="flex justify-center mb-8 gap-4">
                        <button
                            onClick={() => handleFilterChange('upcoming')}
                            className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                                activeFilter === 'upcoming' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Upcoming Matches
                        </button>
                        <button
                            onClick={() => handleFilterChange('live')}
                            className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                                activeFilter === 'live' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Live Matches
                        </button>
                        <button
                            onClick={() => handleFilterChange('completed')}
                            className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                                activeFilter === 'completed' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Completed Matches
                        </button>
                    </div>

                    <div className="card-container">
                        {error && (
                            <div className="text-center py-8">
                                <p className="text-xl text-red-500 mb-4">{error}</p>
                            </div>
                        )}

                        {visibleSlots.length === 0 && !error ? (
                            <div className="text-center">
                                <p className="text-xl">No {activeFilter} tournaments available at the moment.</p>
                            </div>
                        ) : (
                            visibleSlots.map((slot) => {
                                    const currentSlots = slot.maxBookings - slot.remainingBookings;

                                    const handleJoinClick = () => {
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
                                        <div key={slot._id} className="match-card">
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
                                                <span className="badge gray">Random</span>
                                                <span className={`badge ${resolveStatus(slot) === 'upcoming' ? 'blue' : resolveStatus(slot) === 'live' ? 'green' : 'gray'}`}>
                                                    {resolveStatus(slot).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
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
                                                <img src="/assets/vector/Coin.png" alt="Coin" />
                                                <span style={{ fontWeight: "850", textAlign: "center" }}> {slot.entryFee} JOIN</span>
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
                                })
                        )}
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}

export default FullMap
