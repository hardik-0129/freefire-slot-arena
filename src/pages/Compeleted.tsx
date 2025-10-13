import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Footer from '@/components/Footer';
import { Header } from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import '../components/css/FullMap.css';
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
    status: string;
    matchIndex?: number;
    // Enhanced match information
    banList?: string;
    contactInfo?: string;
    discordLink?: string;
    gameMode?: string;
    mapName?: string;
    matchDescription?: string;
    prizeDistribution?: string;
    rules?: string;
    specialRules?: string;
    streamLink?: string;
    tournamentName?: string;
    hostName?: string;
    matchTitle?: string;
    bannerImage?: string;
    firstwin?: number;
    secwin?: number;
    thirdwin?: number;
    cancelReason?: string;
}

const Compeleted = () => {
    const [completedMatches, setCompletedMatches] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch completed matches for the logged-in user
    const fetchCompletedMatches = async () => {
        try {
            // Get userId from JWT token
            const token = localStorage.getItem('token');
            if (!token) {
                setCompletedMatches([]);
                setLoading(false);
                return;
            }
            let userId = null;
            try {
                const decoded = jwtDecode(token);
                userId = (decoded as any).userId;
            } catch (err) {
                console.error('Failed to decode token:', err);
                setCompletedMatches([]);
                setLoading(false);
                return;
            }
            if (!userId) {
                console.error('No userId found in decoded token');
                setCompletedMatches([]);
                setLoading(false);
                return;
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/slots/user/${userId}?status=completed`);
            if (response.ok) {
                const data = await response.json();
                setCompletedMatches(data.bookings || []);
            } else {
                console.error('Failed to fetch matches');
            }
        } catch (error) {
            console.error('Error fetching completed matches:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompletedMatches();
    }, []);

    const handleViewResults = (slot: Slot) => {
        // Extract the actual slot data from the nested structure
        const actualSlot = (slot as any).slot || slot;
        
        const slotData = {
            _id: actualSlot._id || slot._id,
            slotType: actualSlot.slotType || slot.slotType,
            entryFee: actualSlot.entryFee || slot.entryFee,
            matchTime: actualSlot.matchTime || slot.matchTime,
            perKill: actualSlot.perKill || slot.perKill,
            totalWinningPrice: actualSlot.totalWinningPrice || slot.totalWinningPrice,
            maxBookings: actualSlot.maxBookings || slot.maxBookings,
            remainingBookings: actualSlot.remainingBookings || slot.remainingBookings,
            matchIndex: actualSlot.matchIndex || slot.matchIndex,
            bannerImage: actualSlot.bannerImage || slot.bannerImage,
            streamLink: actualSlot.streamLink || slot.streamLink,
            mapName: actualSlot.mapName || slot.mapName,
            tournamentName: actualSlot.tournamentName || slot.tournamentName,
            matchTitle: actualSlot.matchTitle || slot.matchTitle,
            firstwin: actualSlot.firstwin || slot.firstwin,
            secwin: actualSlot.secwin || slot.secwin,
            thirdwin: actualSlot.thirdwin || slot.thirdwin,
            gameMode: actualSlot.gameMode || slot.gameMode,
            discordLink: actualSlot.discordLink || slot.discordLink,
            cancelReason: actualSlot.cancelReason || slot.cancelReason,
            customStartInMinutes: actualSlot.customStartInMinutes || slot.customStartInMinutes,
            createdAt: actualSlot.createdAt || slot.createdAt
        };
        navigate('/winner', { state: { slotData } });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'INVALID DATE';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'INVALID DATE';
        return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getGameTypeColor = (slotType: string) => {
        switch (slotType.toLowerCase()) {
            case 'solo':
            case 'lone wolf':
                return 'badge-solo';
            case 'duo':
            case 'free matches':
                return 'badge-duo';
            case 'squad':
            case 'survival':
                return 'badge-squad';
            case 'clash squad':
                return 'badge-clash';
            default:
                return 'badge-default';
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <section className="py-16 match-section">
                    <div className="container">
                        <h2 className="text-[42px] font-bold text-center mb-12">Completed</h2>
                        <div className="text-center">
                            <p className="text-white text-lg">Loading completed matches...</p>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }
    return (
        <>
            <Header />
            <section className="py-16 match-section">
                <div className="container">
                    <h2 className="text-[42px] font-bold text-center mb-12">Completed</h2>
                    {!completedMatches || completedMatches.length === 0 ? (
                        <div
                            className="text-center"
                            style={{
                               display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh'
                            }}
                        >
                            <p className="text-xl text-gray-600">No completed matches found</p>
                            <p className="text-gray-500 mt-2">Play and finish a match to see it here!</p>
                        </div>
                    ) : (
                        <div className="card-container">    
                            {completedMatches
                              .slice()
                              .sort((a, b) => {
                                const ta = new Date(((a as any).slot?.matchTime) || a.matchTime || a.updatedAt || a.createdAt || 0).getTime();
                                const tb = new Date(((b as any).slot?.matchTime) || b.matchTime || b.updatedAt || b.createdAt || 0).getTime();
                                // Earliest completed first (so 03:37 PM before 05:00 PM). Flip to `tb - ta` for latest first.
                                return ta - tb;
                              })
                              .map((match) => (
                                <div key={match._id} className="match-card">
                                    <div style={{ position: 'relative' }}>
                                        <Skeleton height={0} style={{ paddingBottom: '56.25%', borderRadius: 12 }} baseColor="#eeeeee" highlightColor="#f5f5f5" />
                                        <img
                                            src={
                                                (match as any).bannerImage
                                                    ? (match as any).bannerImage
                                                    : ((match as any).slot && (match as any).slot.bannerImage)
                                                        ? (match as any).slot.bannerImage
                                                        : "/assets/images/category.png"
                                            }
                                            alt="Free Fire"
                                            className="match-image"
                                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                                            loading="lazy"
                                            onError={e => { (e.target as HTMLImageElement).src = "/assets/images/category.png"; }}
                                        />
                                    </div>
                                    <div className="match-top">
                                        <div>
                                            <span className={`badge orange ${getGameTypeColor(match.slotType)}`}>
                                                {match.slotType.toUpperCase()}
                                            </span>
                                            <span className="badge gray">COMPLETED</span>
                                        </div>
                                        <div>
                                            <span className="match-id">#
                                                {(() => {
                                                    const actualSlot = (match as any).slot || match;
                                                    const matchIndex = actualSlot.matchIndex || match.matchIndex;
                                                    return (typeof matchIndex === 'number' && matchIndex >= 0)
                                                        ? matchIndex
                                                        : match._id?.slice(-6).toUpperCase();
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="match-title">
                                        {match.matchTitle || `FF ${match.slotType.toUpperCase()} TOURNAMENT`}
                                        {match.specialRules && ` (${match.specialRules})`}
                                        <br />
                                        {match.tournamentName || '#TOURNAMENT'}
                                    </h3>
                                    <div className="match-details-box">
                                        <div className="date-time">
                                            {(() => {
                                                const actualSlot = (match as any).slot || match;
                                                const matchTime = actualSlot.matchTime || match.matchTime;
                                                return formatDate(matchTime);
                                            })()}
                                        </div>
                                        <div className="prize-pill-container">
                                            <div className="prize-pill">
                                                <div className="pill-label">PER KILL</div>
                                                <div className="pill-value">
                                                    <img src="/assets/vector/Coin.png" alt="Coin" />
                                                    {(() => {
                                                        const actualSlot = (match as any).slot;
                                                        return actualSlot.perKill;
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="prize-pill">
                                                <div className="pill-label">WINNING PRIZE</div>
                                                <div className="pill-value">
                                                    <img src="/assets/vector/Coin.png" alt="Coin" />
                                                    {(() => {
                                                        const actualSlot = (match as any).slot;
                                                        return actualSlot.totalWinningPrice;
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className="slots-row">
                                        <p className="text-sm font-medium">
                                            {match.maxBookings - match.remainingBookings}/{match.maxBookings}
                                        </p>
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="w-full bg-black rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-[#FF8B00] h-full rounded-full"
                                                    style={{
                                                        width: `${((match.maxBookings - match.remainingBookings) / match.maxBookings) * 100}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div> */}
                                    <div className="join-btn-completed mt-4">
                                        <button
                                            className="spectator-btn"
                                            onClick={() => {
                                                if (match.streamLink) {
                                                    window.open(match.streamLink, '_blank', 'noopener,noreferrer');
                                                }
                                            }}
                                            disabled={!match.streamLink}
                                            style={{ opacity: match.streamLink ? 1 : 0.5, cursor: match.streamLink ? 'pointer' : 'not-allowed' }}
                                        >
                                            <img src="/assets/vector/S-Vector.png" alt="Coin" />
                                            SPECTATE
                                        </button>
                                        <button
                                            className="result-btn"
                                            onClick={() => handleViewResults(match)}>
                                            VIEW RESULTS
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </>
    )
}

export default Compeleted
