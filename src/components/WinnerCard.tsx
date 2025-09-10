import React from 'react';
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

interface WinnerCardProps {
  winner: Winner;
  rank: number;
}

const WinnerCard: React.FC<WinnerCardProps> = ({ winner, rank }) => {
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${position}`;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-orange-500';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="winner-card bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`text-2xl font-bold ${getRankColor(winner.position)}`}>
            {getRankIcon(winner.position)}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{winner.playerName}</h3>
            {winner.teamName && (
              <p className="text-gray-400 text-sm">Team: {winner.teamName}</p>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-400">💀 {winner.kills} kills</span>
              {winner.isVerified && (
                <span className="text-green-400">✓ Verified</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-green-400 font-bold text-lg">
            ₹{winner.prizeAmount.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm">Prize</div>
        </div>
      </div>
    </div>
  );
};

export default WinnerCard;
