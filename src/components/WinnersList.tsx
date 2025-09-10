import React, { useState, useEffect } from 'react';
import WinnerCard from './WinnerCard';
import './css/Winners.css';

interface Winner {
  _id: string;
  position: number;
  playerName: string;
  teamName?: string;
  kills: number;
  prizeAmount: number;
  isVerified: boolean;
}

interface WinnersListProps {
  slotId?: string;
  showAll?: boolean;
  maxWinners?: number;
}

const WinnersList: React.FC<WinnersListProps> = ({ 
  slotId, 
  showAll = false, 
  maxWinners = 10 
}) => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWinners = async () => {
      if (!slotId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/winners/match/${slotId}`);
        const data = await response.json();

        if (data.success) {
          let winnersData = data.winners;
          if (!showAll && maxWinners) {
            winnersData = winnersData.slice(0, maxWinners);
          }
          setWinners(winnersData);
        } else {
          setError(data.error || 'Failed to fetch winners');
        }
      } catch (err) {
        setError('Failed to fetch winners');
        console.error('Error fetching winners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, [slotId, showAll, maxWinners]);

  if (loading) {
    return (
      <div className="winners-loading">
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-700 h-16 rounded-lg mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="winners-error text-center py-8">
        <div className="text-red-400 mb-2">⚠️ Error loading winners</div>
        <div className="text-gray-400 text-sm">{error}</div>
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <div className="no-winners text-center py-8">
        <div className="text-gray-400 mb-2">🏆 No winners announced yet</div>
        <div className="text-gray-500 text-sm">Winners will be displayed here after the match</div>
      </div>
    );
  }

  return (
    <div className="winners-list">
      <div className="winners-header mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🏆 Match Winners
          <span className="text-sm text-gray-400">({winners.length})</span>
        </h2>
      </div>
      
      <div className="winners-container">
        {winners.map((winner, index) => (
          <WinnerCard
            key={winner._id}
            winner={winner}
            rank={index + 1}
          />
        ))}
      </div>

      {!showAll && winners.length >= maxWinners && (
        <div className="text-center mt-4">
          <button 
            className="text-blue-400 hover:text-blue-300 text-sm"
            onClick={() => window.location.href = `/winners/${slotId}`}
          >
            View all winners →
          </button>
        </div>
      )}
    </div>
  );
};

export default WinnersList;
