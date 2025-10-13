import React from 'react';
import { Booking } from '../types/booking';
import './css/BookingModal.css';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookings: Booking[];
    matchTitle?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, bookings, matchTitle }) => {
    if (!isOpen) return null;

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

    const calculatePosition = (pIdx: number, gameMode: string) => {
        let teamNumber, positionLetter;
        
        // Debug logging
        console.log(`[BookingModal] Processing playerIndex ${pIdx}, gameMode: ${gameMode}`);
        
        // Determine team and position based on game mode
        if (gameMode === 'Solo' || gameMode === 'solo') {
            // Solo: 1 = Team 1, 2 = Team 2, 3 = Team 3, etc.
            teamNumber = pIdx;
            positionLetter = 'A';
        } else if (gameMode === 'Duo' || gameMode === 'duo') {
            // Duo: 1,2 = Team 1, 3,4 = Team 2, 5,6 = Team 3, etc.
            teamNumber = Math.ceil(pIdx / 2);
            positionLetter = (pIdx % 2 === 1) ? 'A' : 'B';
        } else if (gameMode === 'Squad' || gameMode === 'squad') {
            // Squad: 1,2,3,4 = Team 1, 5,6,7,8 = Team 2, 9,10,11,12 = Team 3, etc.
            teamNumber = Math.ceil(pIdx / 4);
            const posInTeam = ((pIdx - 1) % 4) + 1;
            const posMap = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' };
            positionLetter = posMap[posInTeam];
        } else {
            // Fallback for other modes - treat as squad
            teamNumber = Math.ceil(pIdx / 4);
            const posInTeam = ((pIdx - 1) % 4) + 1;
            const posMap = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' };
            positionLetter = posMap[posInTeam];
        }
        
        console.log(`[BookingModal] Result: pIdx=${pIdx} -> Team-${teamNumber} ${positionLetter}`);
        
        return { teamNumber, positionLetter };
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">
                        {matchTitle || 'Match Bookings'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="close-button"
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <div className="bookings-list">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="booking-card">
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
                                        {booking.playerIndex && booking.playerIndex.length > 0 ? (
                                            // Use playerIndex to show proper team and position format
                                            booking.playerIndex.map((pIdx, idx) => {
                                                const gameMode = booking.slot?.gameMode;
                                                const { teamNumber, positionLetter } = calculatePosition(pIdx, gameMode || '');
                                                
                                                return (
                                                    <div key={idx} className="position-item">
                                                        <span className="position-badge">Team-{teamNumber} {positionLetter}</span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            // Fallback to original display if playerIndex not available
                                            Object.entries(booking.selectedPositions).map(([team, positions]) => (
                                                <div key={team} className="team-positions">
                                                    <span className="team-name">{team.toUpperCase()}:</span>
                                                    {positions.map((pos, idx) => (
                                                        <span key={idx} className="position-badge">{pos}</span>
                                                    ))}
                                                </div>
                                            ))
                                        )}
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

                <div className="modal-footer">
                    <button
                        onClick={onClose}
                        className="close-button"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
