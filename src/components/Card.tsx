import React from "react"
import "../components/css/FullMap.css"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// Helper function to format date in DD/MM/YYYY format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to format time in HH:MM:SS AM/PM format
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
  
  return `${formattedHours}:${minutes}:${seconds} ${ampm}`;
};

interface CardProps {
    booking?: {
        _id: string;
        selectedPositions: { [key: string]: string[] };
        playerNames: { [key: string]: string };
        totalAmount: number;
        entryFee: number;
        status: string;
        createdAt: string;
        slot: {
            _id: string;
            slotType: string;
            matchTime: string;
            totalWinningPrice: number;
            perKill: number;
            matchTitle?: string;
            tournamentName?: string;
            mapName?: string;
            specialRules?: string;
            maxPlayers?: number;
            streamLink?: string;
            matchIndex?: number; // Added matchIndex as optional
        } | null;
    };
    totalBookingsCount?: number; // Deprecated: use totalPositionsBooked instead
    totalPositionsBooked?: number; // Total positions booked from all users
}

const Card = ({ booking, totalBookingsCount, totalPositionsBooked }: CardProps) => {
    // Calculate user's total booked positions for this match
    const userBookedPositions = booking ? Object.values(booking.selectedPositions).flat().length : 0;
    const maxPositions = booking?.slot?.maxPlayers || 48;

    // Use totalPositionsBooked if provided, otherwise fall back to user positions
    const displayCount = typeof totalPositionsBooked === 'number' ? totalPositionsBooked : userBookedPositions;

    // Handle spectate button click
    const handleSpectateClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering parent click events

        const streamLink = booking?.slot?.streamLink;

        if (streamLink && streamLink.trim() !== '') {
            // Check if it's a right-click (for copy option)
            if (e.button === 2 || e.ctrlKey) {
                // Copy to clipboard
                navigator.clipboard.writeText(streamLink).then(() => {
                    alert('📋 Stream link copied to clipboard!');
                }).catch(() => {
                    // Fallback for older browsers
                    alert(`Stream link: ${streamLink}`);
                });
                return;
            }

            // Validate if it's a proper URL
            try {
                new URL(streamLink);
                window.open(streamLink, '_blank', 'noopener,noreferrer');
            } catch {
                // If not a valid URL, try adding https://
                const fullLink = streamLink.startsWith('http') ? streamLink : `https://${streamLink}`;
                window.open(fullLink, '_blank', 'noopener,noreferrer');
            }
        } else {
            // Show a user-friendly message when no stream link is available
            alert('🔴 Stream link not available for this match yet.\n\nPlease check back closer to match time or contact the tournament organizer.');
        }
    };

    return (
        <div className="match-card">
            <div style={{ position: 'relative' }}>
                <Skeleton height={0} style={{ paddingBottom: '56.25%', borderRadius: 12 }} baseColor="#eeeeee" highlightColor="#f5f5f5" />
                <img
                    src={booking?.slot && (booking.slot as any).bannerImage ? (booking.slot as any).bannerImage : "/assets/images/category.png"}
                    alt="Free Fire"
                    className="match-image"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).src = "/assets/images/category.png"; }}
                />
            </div>
            <div className="match-top">
                <div>
                    <span className="badge orange">{booking?.slot?.slotType?.toUpperCase() || 'SOLO'}</span>
                    <span className="badge gray">{booking?.slot?.mapName || 'RANDOM'}</span>
                </div>
                <div>
                    <span className="match-id">MATCH #{booking?.slot?.matchIndex}</span>
                </div>
            </div>
            <h3 className="match-title">
                {booking?.slot?.matchTitle || `FF ${booking?.slot?.slotType?.toUpperCase() || 'SOLO'} TOURNAMENT`}
                {booking?.slot?.specialRules && ` (${booking.slot.specialRules})`}
                <br />
                {booking?.slot?.tournamentName || '#ALPHALIONS'}
            </h3>
            <div className="match-details-box">
                <div className="date-time">
                    {booking?.slot?.matchTime ? formatDate(booking.slot.matchTime) : '27/07/2025'} <span className="time">{booking?.slot?.matchTime ? formatTime(booking.slot.matchTime) : '3:00am'}</span>
                </div>
                <div className="prize-pill-container">
                    <div className="prize-pill">
                        <div className="pill-label">PER KILL</div>
                        <div className="pill-value">
                            <img src="/assets/vector/Coin.png" alt="Coin" />
                            {booking?.slot?.perKill || 10}
                        </div>
                    </div>
                    <div className="prize-pill">
                        <div className="pill-label">WINNING PRIZE</div>
                        <div className="pill-value">
                            <img src="/assets/vector/Coin.png" alt="Coin" />
                            {booking?.slot?.totalWinningPrice || 920}
                        </div>
                    </div>
                </div>
            </div>
            <div className="slots-row">
                <p className="text-sm font-medium">
                    Total Positions Booked: {totalPositionsBooked || 0}/{maxPositions}
                </p>
                <div className="flex items-center gap-2 w-full">
                    <div className="w-full bg-black rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-[#ff8400] h-full rounded-full"
                            style={{ width: `${((totalPositionsBooked || 0) / maxPositions) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <button
                className={`join-btn uppercase ${booking?.slot?.streamLink ? 'has-stream' : 'no-stream'}`}
                onClick={handleSpectateClick}
                title={booking?.slot?.streamLink ?
                    'Click to watch live stream • Ctrl+Click to copy link' :
                    'Stream link not available yet'
                }
            >
                <img src="/assets/vector/S-Vector.png" alt="" />
                <span> spectate</span>
            </button>
        </div>
    )
}

export default Card
