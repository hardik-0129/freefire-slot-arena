
import React, { useState, useEffect } from "react";
import "../css/Table.css"

interface Winner {
    _id: string;
    rank: number;
    playerName: string;
    teamName?: string;
    kills: number;
    winningPrice: number;
    // Add any other fields as needed
}

interface TableProps {
    slotId?: string;
    showWinners?: boolean;
    topOnly?: boolean; // if true, show only top 3
}

const Table: React.FC<TableProps> = ({ slotId, showWinners = false, topOnly = false }) => {
    const [winners, setWinners] = useState<Winner[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (showWinners && slotId) {
            fetchWinners();
        }
    }, [slotId, showWinners]);

    const fetchWinners = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/winners?slotId=${slotId}`);
            const data = await response.json();

            // If the response is an array, use it directly
            if (Array.isArray(data)) {
                setWinners(data);
                setError(null);
            } else if (data && Array.isArray(data.winners)) {
                setWinners(data.winners);
                setError(null);
            } else {
                setWinners([]);
                setError(data && data.error ? data.error : 'Failed to fetch winners');
            }
        } catch (err) {
            setWinners([]);
            setError('Failed to fetch winners');
            console.error('Error fetching winners:', err);
        } finally {
            setLoading(false);
        }
    };

    // Show top 3 or all winners by rank ascending if winners exist
    let displayData: Winner[] = [];
    if (showWinners && winners && winners.length > 0) {
        const sorted = [...winners].sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
        displayData = topOnly ? sorted.slice(0, 3) : sorted;
        
        // Assign proper sequential rankings starting from 1
        displayData = displayData.map((winner, index) => ({
            ...winner,
            rank: index + 1
        }));
    }
    // Debug output removed
    return (
        <>
            <div className="winner-table-container">
                <div className="table-title">{topOnly ? "Top 3" : "Winner"}</div>
                {loading && (
                    <div className="text-center text-gray-400">Loading winners...</div>
                )}
                {error && (
                    <div className="text-center text-red-400">{error}</div>
                )}
                {!loading && !error && (
                    <>
                        <table className="winner-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    {/* <th>Team</th> */}
                                    <th>Player Name</th>
                                    <th>Kills</th>
                                    <th>Winning</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayData.length > 0 ? (
                                    displayData.map((winner, index) => (
                                        <tr key={showWinners ? winner._id : index}>
                                            <td>{winner.rank ?? '-'}</td>
                                            <td>{winner.playerName}</td>
                                            <td>{winner.kills ?? '-'}</td>
                                            <td>₹ {winner.winningPrice !== undefined && winner.winningPrice !== null ? Number(winner.winningPrice).toFixed(2) : '0.00'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    showWinners ? (
                                        <tr>
                                            <td colSpan={4} className="text-center text-gray-400">
                                                No winners announced yet
                                            </td>
                                        </tr>
                                    ) : null
                                )}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </>
    )
}

export default Table
