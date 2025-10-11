import React from 'react'
import "../components/css/FullMap.css"
import { SpectedButton, ResultButton } from './button/SpectedButton'

type Winner = {
  playerName: string;
  kills: number;
  rank: number;
  winningPrice: number;
}

type Slot = {
  bannerImage?: string;
  slotType?: string;
  mapName?: string;
  matchIndex?: number;
  matchTitle?: string;
  tournamentName?: string;
  matchTime?: string;
  perKill?: number;
  totalWinningPrice?: number;
  maxBookings?: number;
  remainingBookings?: number;
}

interface Props {
  slot: Slot;
  winners?: Winner[];
}

const CompletedCard: React.FC<Props> = ({ slot, winners = [] }) => {
  const dateStr = slot.matchTime ? new Date(slot.matchTime).toLocaleDateString('en-GB') : '-';
  const timeStr = slot.matchTime ? new Date(slot.matchTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
  const booked = (Number(slot.maxBookings) || 0) - (Number(slot.remainingBookings) || 0);
  const capacity = Number(slot.maxBookings) || 0;
  const progress = capacity > 0 ? Math.min(100, Math.max(0, (booked / capacity) * 100)) : 0;

  return (
    <div className="match-card">
      <img src={slot.bannerImage || "/assets/images/category.png"} alt="Free Fire" className="match-image" />
      <div className="match-top">
        <div>
          <span className="badge orange">{(slot.slotType || 'SOLO').toString().toUpperCase()}</span>
          <span className="badge gray">{(slot.mapName || 'RANDOM').toString().toUpperCase()}</span>
        </div>
        <div>
          <span className="match-id">#
            {typeof slot.matchIndex === 'number' && slot.matchIndex >= 0 ? slot.matchIndex : ''}
          </span>
        </div>
      </div>

      <h3 className="match-title">
        {slot.matchTitle || `FF ${slot.slotType?.toUpperCase() || 'SOLO'} TOURNAMENT`}<br />
        {slot.tournamentName || '#TOURNAMENT'}
      </h3>

      <div className="match-details-box">
        <div className="date-time">
          {dateStr} {timeStr && (<span className="time">{timeStr}</span>)}
        </div>
        <div className="prize-pill-container">
          <div className="prize-pill">
            <div className="pill-label">PER KILL</div>
            <div className="pill-value">
              <img src="/assets/vector/Coin.png" alt="Coin" />
              {Number(slot.perKill) || 0}
            </div>
          </div>
          <div className="prize-pill">
            <div className="pill-label">WINNING PRIZE</div>
            <div className="pill-value">
              <img src="/assets/vector/Coin.png" alt="Coin" />
              {Number(slot.totalWinningPrice) || 0}
            </div>
          </div>
        </div>
      </div>

      {(capacity > 0) && (
        <div className="slots-row">
          <p className="text-sm font-medium">{booked}/{capacity}</p>
          <div className="flex items-center gap-2 w-full">
            <div className="w-full bg-black rounded-full h-2 overflow-hidden">
              <div className="bg-[#ff8400] h-full rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="join-btn-completed">
        <SpectedButton />
        <ResultButton slotId={(slot as any)?._id as any} slotData={slot as any} />
      </div>

      {/* Winners table (simple) */}
      {winners.length > 0 && (
        <div className="winner-table mt-3">
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Kills</th>
                <th>Winning</th>
              </tr>
            </thead>
            <tbody>
              {winners.map((w, i) => (
                <tr key={i}>
                  <td>{w.rank}</td>
                  <td>{w.playerName}</td>
                  <td>{w.kills}</td>
                  <td>₹{w.winningPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default CompletedCard
