// import React from 'react'

// const Upcoming = () => {
//   return (
//     <div>

//     </div>
//   )
// }

// export default Upcoming


import Card from '@/components/Card'
import Footer from '@/components/Footer'
import { Header } from '@/components/Header'
import React, { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode';
import '../components/css/MatchModal.css'

// Helper function to format date in DD/MM/YYYY format
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Helper function to format date and time in DD/MM/YYYY HH:MM:SS AM/PM format
const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

    return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
};

interface Booking {
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
    } | null;
}

const Upcoming = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<{
        slot: any;
        bookings: Booking[];
        totalPositions: number;
        totalBookingsFromAllUsers?: number;
        totalPositionsBookedFromAllUsers?: number;
        notification?: {
            roomId?: string;
            matchPassword?: string;
        };
    } | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [slotStats, setSlotStats] = useState<{ [key: string]: any }>({});
    const [now, setNow] = useState<number>(Date.now());

    // Tick every second for countdowns
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    // Fetch user's ongoing matches
    const fetchOngoingMatches = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to view your bookings');
                setIsLoading(false);
                return;
            }

            // Decode token to get userId
            let userId = '';
            try {
                const decoded = jwtDecode(token);
                userId = (decoded as any).userId;
            } catch (e) {
                setError('Invalid token. Please login again.');
                setIsLoading(false);
                return;
            }

            // Use the correct API endpoint for user ongoing matches
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/slots/user/${userId}?status=upcoming`);
            if (response.ok) {
                const data = await response.json();
                setBookings(Array.isArray(data.bookings) ? data.bookings : []);
            } else {
                setError('Failed to fetch bookings');
            }
        } catch (error) {
            setError('An error occurred while fetching bookings');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch slot statistics for all unique slots
    const fetchSlotStats = async (slotIds: string[]) => {
        const stats: { [key: string]: any } = {};

        await Promise.all(slotIds.map(async (slotId) => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots/stats/${slotId}`);
                if (response.ok) {
                    const data = await response.json();

                    stats[slotId] = data.stats;
                }
            } catch (error) {
                console.error(`Error fetching stats for slot ${slotId}:`, error);
            }
        }));

        setSlotStats(stats);
    };

    useEffect(() => {
        fetchOngoingMatches();
    }, []);

    useEffect(() => {
        // Fetch stats for all unique slots after bookings are loaded
        if (bookings.length > 0) {
            const uniqueSlotIds = [...new Set(bookings.map(b => b.slot?._id).filter(Boolean))];
            fetchSlotStats(uniqueSlotIds);
        }
    }, [bookings]);

    // Group bookings by slot ID to show only unique matches
    // If user has 6 bookings for the same slot, show only 1 card
    const uniqueMatches = bookings.reduce((acc, booking) => {
        const slotId = booking.slot?._id;
        if (slotId) {
            // Check if we already have a booking for this slot
            const existingMatch = acc.find(b => b.slot?._id === slotId);
            if (!existingMatch) {
                // Calculate total positions this user has booked for this slot
                const allBookingsForThisSlot = bookings.filter(b => b.slot?._id === slotId);
                const totalUserPositions = allBookingsForThisSlot.reduce((total, b) => {
                    return total + Object.values(b.selectedPositions).flat().length;
                }, 0);

                // Create a modified booking object with combined position data
                const enhancedBooking = {
                    ...booking,
                    selectedPositions: {
                        combined: Array.from({ length: totalUserPositions }, (_, i) => (i + 1).toString())
                    }
                };

                acc.push(enhancedBooking);
            }
        }
        return acc;
    }, [] as Booking[]);

    // Handle card click to show detailed match info
    const handleCardClick = async (booking: Booking) => {
        console.log('Booking data:', booking);
        console.log('Slot data:', booking.slot);
        const slotId = booking.slot?._id;
        if (slotId) {
            // Get all bookings for this slot from current user
            const allBookingsForThisSlot = bookings.filter(b => b.slot?._id === slotId);
            const totalUserPositions = allBookingsForThisSlot.reduce((total, b) => {
                return total + Object.values(b.selectedPositions).flat().length;
            }, 0);

            // Get total bookings from all users
            let totalPositionsBookedFromAllUsers = 0;
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots/stats/${slotId}`);
                if (response.ok) {
                    const data = await response.json();
                    totalPositionsBookedFromAllUsers = data.stats.totalPositionsBooked;
                }
            } catch (error) {
                console.error('Error fetching total positions booked:', error);
            }
            // Try to fetch notification data for this match
            let notificationData = null;
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const notificationResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/notification/by-bookings`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (notificationResponse.ok) {
                        const responseData = await notificationResponse.json();
                        console.log('Notification data:', responseData);
                        // Find notification for this match
                        const matchNotification = responseData.notifications?.find((n: any) => 
                            n.type === 'match' && n.metadata?.matchId === slotId
                        );
                        if (matchNotification) {
                            console.log('Match notification found:', matchNotification);
                            notificationData = {
                                roomId: matchNotification.metadata?.roomId,
                                matchPassword: matchNotification.metadata?.matchPassword
                            };
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching notification data:', error);
            }

            setSelectedMatch({
                slot: booking.slot,
                bookings: allBookingsForThisSlot,
                totalPositions: totalUserPositions,
                totalPositionsBookedFromAllUsers: totalPositionsBookedFromAllUsers,
                notification: notificationData
            });
            setShowModal(true);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedMatch(null);
    };

    return (
        <>
            <Header />
            <section className="py-16 match-section">
                <div className="container">
                    <h2 className="text-[42px] font-bold text-center mb-12">Upcoming</h2>
                    <div
                        className="card-container"
                        style={(!isLoading && !error && uniqueMatches.length === 0)
                            ? { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', width: '100%' }
                            : undefined}>
                        {isLoading ? (
                            <div className="text-center py-8">
                                <p className="text-xl">Loading your matches...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <p className="text-xl text-red-500">{error}</p>
                            </div>
                        ) : uniqueMatches.length === 0 ? (
                            <div className="text-center" style={{ display: 'flex', flexDirection: 'column' }}>
                                <p className="text-xl text-gray-600">No upcoming matches found</p>
                                <p className="text-gray-500 mt-2">Book a match to see it here!</p>
                            </div>
                        ) : (
                            uniqueMatches.map((booking) => {
                                const slotId = booking.slot?._id;
                                const totalPositionsBooked = slotStats[slotId]?.totalPositionsBooked || 0;
                                const matchTime = booking.slot?.matchTime || '';
                                const targetMs = matchTime ? new Date(matchTime).getTime() : 0;
                                const diff = Math.max(0, targetMs - now);
                                const totalSeconds = Math.floor(diff / 1000);
                                const days = Math.floor(totalSeconds / 86400);
                                const hours = Math.floor((totalSeconds % 86400) / 3600);
                                const minutes = Math.floor((totalSeconds % 3600) / 60);
                                const seconds = totalSeconds % 60;
                                const pad = (n: number) => n.toString().padStart(2, '0');
                                const countdownText = days > 0
                                    ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
                                    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

                                return (
                                    <div
                                        key={booking.slot?._id || booking._id}
                                        onClick={() => handleCardClick(booking)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Card
                                            booking={booking}
                                            totalPositionsBooked={totalPositionsBooked}
                                            renderExtra={targetMs > now ? () => (
                                                booking.slot ? (
                                                    <div title={formatDateTime(booking.slot.matchTime)}>
                                                        {countdownText}
                                                    </div>
                                                ) : null
                                            ) : undefined}
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>

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
                                    MATCH #{selectedMatch.slot._id.slice(-4)} - {selectedMatch.slot.slotType?.toUpperCase()}
                                </h3>
                                <div className="match-info-grid">
                                    <div className="match-info-item">
                                        <div className="match-info-label">Tournament</div>
                                        <div className="match-info-value">{selectedMatch.slot.tournamentName || '#ALPHALIONS'}</div>
                                    </div>
                                    <div className="match-info-item">
                                        <div className="match-info-label">Map</div>
                                        <div className="match-info-value">{selectedMatch.slot.mapName || 'Random'}</div>
                                    </div>
                                    <div className="match-info-item">
                                        <div className="match-info-label">Match Time</div>
                                        <div className="match-info-value">{formatDateTime(selectedMatch.slot.matchTime)}</div>
                                    </div>
                                    <div className="match-info-item">
                                        <div className="match-info-label">Per Kill</div>
                                        <div className="match-info-value">₹{selectedMatch.slot.perKill}</div>
                                    </div>
                                    <div className="match-info-item">
                                        <div className="match-info-label">Winning Prize</div>
                                        <div className="match-info-value">₹{selectedMatch.slot.totalWinningPrice}</div>
                                    </div>
                                    <div className="match-info-item">
                                        <div className="match-info-label">Special Rules</div>
                                        <div className="match-info-value">{selectedMatch.slot.specialRules || 'None'}</div>
                                    </div>
                                    {selectedMatch.notification?.roomId && (
                                        <div className="match-info-item">
                                            <div className="match-info-label">Room ID</div>
                                            <div className="match-info-value">{selectedMatch.notification.roomId}</div>
                                        </div>
                                    )}
                                    {selectedMatch.notification?.matchPassword && (
                                        <div className="match-info-item">
                                            <div className="match-info-label">Match Password</div>
                                            <div className="match-info-value">{selectedMatch.notification.matchPassword}</div>
                                        </div>
                                    )}
                                    {selectedMatch.slot.streamLink && (
                                        <div className="match-info-item">
                                            <div className="match-info-label">Stream Link</div>
                                            <div className="match-info-value">
                                                <a
                                                    href={selectedMatch.slot.streamLink}
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

                            {/* User's Bookings Summary */}
                            <div className="summary-section">
                                <h4 className="summary-title">Match Statistics</h4>
                                <div className="summary-stats">
                                    <div className="summary-stat">
                                        <div className="summary-stat-value">{selectedMatch.totalPositions}</div>
                                        <div className="summary-stat-label">Your Positions</div>
                                    </div>
                                    <div className="summary-stat">
                                        <div className="summary-stat-value">{selectedMatch.totalPositionsBookedFromAllUsers || 0}</div>
                                        <div className="summary-stat-label">Total Positions Booked (All Users)</div>
                                    </div>
                                    <div className="summary-stat">
                                        <div className="summary-stat-value">₹{selectedMatch.bookings.reduce((sum, b) => sum + b.totalAmount, 0)}</div>
                                        <div className="summary-stat-label">Your Total Amount</div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Booking List */}
                            <div className="bookings-section">
                                <h4 className="section-title">Your Booking Details ({selectedMatch.totalPositions} of {selectedMatch.totalPositionsBookedFromAllUsers || 0} total positions booked)</h4>
                                <div>
                                    {selectedMatch.bookings.map((booking, index) => (
                                        <div key={booking._id} className="booking-card">
                                            <div className="booking-header">
                                                <h5 className="booking-number">Booking #{index + 1}</h5>
                                                <span className="booking-date">
                                                    {formatDate(booking.createdAt)}
                                                </span>
                                            </div>

                                            <div className="booking-details">
                                                <div className="booking-detail">
                                                    <div className="booking-detail-label">Amount</div>
                                                    <div className="booking-detail-value">₹{booking.totalAmount}</div>
                                                </div>
                                                <div className="booking-detail">
                                                    <div className="booking-detail-label">Status</div>
                                                    <div className="booking-detail-value">{booking.status}</div>
                                                </div>
                                            </div>

                                            {/* Selected Positions */}
                                            <div className="positions-section">
                                                <p className="positions-title">Selected Positions</p>
                                                <div>
                                                    {Object.entries(booking.selectedPositions).map(([team, positions]) => (
                                                        <div key={team} className="team-positions">
                                                            <span className="team-name">{team.toUpperCase()}:</span>
                                                            {positions.map((pos, idx) => (
                                                                <span key={idx} className="position-badge">{pos}</span>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Player Names */}
                                            <div className="players-section">
                                                <p className="players-title">Player Names</p>
                                                <div className="player-names">
                                                    {Object.entries(booking.playerNames).map(([position, name]) => (
                                                        <div key={position} className="player-item">
                                                            <span className="player-position">{position}:</span>
                                                            <span className="player-name">{name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
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

            <Footer />
        </>
    )
}

export default Upcoming

