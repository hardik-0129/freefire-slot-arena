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
    matchIndex?: number; // Added property
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
}

const Cancelled = () => {
    const [cancelledMatches, setCancelledMatches] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch cancelled matches for the logged-in user
    const fetchCompletedMatches = async () => {
        try {
            // Get userId from JWT token
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            let userId = null;
            try {
                const decoded = jwtDecode(token);
                userId = (decoded as any).userId;
            } catch (err) {
                console.error('Failed to decode token:', err);
                setLoading(false);
                return;
            }
            if (!userId) {
                console.error('No userId found in decoded token');
                setLoading(false);
                return;
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/slots/user/${userId}?status=cancelled`);
            if (response.ok) {
                const data = await response.json();
                const bookings = Array.isArray(data?.bookings) ? data.bookings : [];
                const mapped = bookings.map((b: any) => ({
                    _id: b._id || b.slot?._id,
                    slotType: (b.slotType || b.slot?.slotType || '').toString(),
                    entryFee: b.slot?.entryFee ?? b.entryFee ?? 0,
                    matchTime: b.slot?.matchTime,
                    perKill: b.slot?.perKill ?? 0,
                    totalWinningPrice: b.slot?.totalWinningPrice ?? 0,
                    maxBookings: b.slot?.maxBookings ?? 0,
                    remainingBookings: b.slot?.remainingBookings ?? 0,
                    customStartInMinutes: b.slot?.customStartInMinutes ?? 0,
                    createdAt: b.slot?.createdAt ?? b.createdAt,
                    updatedAt: b.slot?.updatedAt ?? b.updatedAt,
                    status: 'cancelled',
                    matchIndex: b.slot?.matchIndex,
                    banList: b.slot?.banList,
                    contactInfo: b.slot?.contactInfo,
                    discordLink: b.slot?.discordLink,
                    gameMode: b.slot?.gameMode,
                    mapName: b.slot?.mapName,
                    matchDescription: b.slot?.matchDescription,
                    prizeDistribution: b.slot?.prizeDistribution,
                    rules: b.slot?.rules,
                    specialRules: b.slot?.specialRules,
                    streamLink: b.slot?.streamLink,
                    tournamentName: b.slot?.tournamentName,
                    hostName: b.slot?.hostName,
                    matchTitle: b.slot?.matchTitle,
                    bannerImage: b.slot?.bannerImage,
                    cancelReason: b.slot?.cancelReason || b.cancelReason
                }));
                setCancelledMatches(mapped);
            } else {
                console.error('Failed to fetch cancelled matches');
            }
        } catch (error) {
            console.error('Error fetching cancelled matches:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompletedMatches();
    }, []);

    const handleViewResults = (slot: Slot) => {
        navigate('/winner', { state: { slotData: slot } });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
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
                        <h2 className="text-[42px] font-bold text-center mb-12">Cancelled Matches</h2>
                        <div className="text-center">
                            <p className="text-white text-lg">Loading cancelled matches...</p>
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
                    <h2 className="text-[42px] font-bold text-center mb-12">Cancelled Matches</h2>
                    {!cancelledMatches || cancelledMatches.length === 0 ? (
                        <div className="text-center">
                            <p className="text-white text-lg">No cancelled matches found.</p>
                        </div>
                    ) : (
                        <div className="card-container">
                            {cancelledMatches.map((match) => (
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
                                            <span className="badge gray">CANCELLED</span>
                                        </div>
                                        <div>
                                            <span className="match-id">#
                                                {typeof match.matchIndex === 'number' && match.matchIndex >= 0
                                                    ? match.matchIndex
                                                    : (typeof (match as any).slot === 'object' && typeof (match as any).slot?.matchIndex === 'number' && (match as any).slot.matchIndex >= 0)
                                                        ? (match as any).slot.matchIndex
                                                        : match._id?.slice(-6).toUpperCase()}
                                            </span>
                                        </div>
                                       
                                    </div>
                                    <h3 className="match-title">
                                        {match.matchTitle || `FF ${match.slotType.toUpperCase()} TOURNAMENT`}
                                        {match.specialRules && ` (${match.specialRules})`}
                                        <br />
                                        {match.tournamentName || '#TOURNAMENT'}
                                    </h3>
                                    {/* Consistent reason line with fixed height to avoid card shift */}
                                    <div style={{ minHeight: 20, marginTop: 6, padding: '0 20px' }}>
                                      {(match as any).cancelReason ? (
                                        <div className="text-red-500 text-sm font-semibold">
                                          Reason: {(match as any).cancelReason}
                                        </div>
                                      ) : null}
                                    </div>
                                    <div className="match-details-box">
                                        <div className="date-time">
                                            {formatDate(match.matchTime || (typeof (match as any).slot === 'object' && (match as any).slot.matchTime))}
                                        </div>
                                       
                                        <div className="prize-pill-container">
                                            <div className="prize-pill">
                                                <div className="pill-label">PER KILL</div>
                                                <div className="pill-value">
                                                    <img src="/assets/vector/Coin.png" alt="Coin" />
                                                    {match.perKill}
                                                </div>
                                            </div>
                                            <div className="prize-pill">
                                                <div className="pill-label">WINNING PRIZE</div>
                                                <div className="pill-value">
                                                    <img src="/assets/vector/Coin.png" alt="Coin" />
                                                    {match.totalWinningPrice}
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

export default Cancelled
