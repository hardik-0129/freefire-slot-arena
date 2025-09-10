import React from 'react'
import "../components/css/FullMap.css"
import {SpectedButton, ResultButton } from './button/SpectedButton'

const CompletedCard = () => {
    return (
        <div className="match-card">
            <img src="/assets/images/category.png" alt="Free Fire" className="match-image" />
            <div className="match-top">
                <div>
                    <span className="badge orange">SOLO</span>
                    <span className="badge gray">RANDOM</span>
                </div>
                <div>
                    <span className="match-id">MATCH #01</span>
                </div>
            </div>
            <h3 className="match-title">FF SOLO TOURNAMENT (RYDEN BAN) <br /> #ALPHALIONS</h3>
            <div className="match-details-box">
                <div className="date-time">
                    27/07/2025 <span className="time">3:00am</span>
                </div>
                <div className="prize-pill-container">
                    <div className="prize-pill">
                        <div className="pill-label">PER KILL</div>
                        <div className="pill-value">
                            <img src="/assets/icons/coin.png" alt="Coin" />
                            10
                        </div>
                    </div>
                    <div className="prize-pill">
                        <div className="pill-label">WINNING PRIZE</div>
                        <div className="pill-value">
                            <img src="/assets/icons/coin.png" alt="Coin" />
                            920
                        </div>
                    </div>
                </div>
            </div>
            <div className="slots-row">
                <p className="text-sm font-medium">27/48</p>
                <div className="flex items-center gap-2 w-full">
                    <div className="w-full bg-black rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-[#ff8400] h-full rounded-full"
                            style={{ width: `${(27 / 48) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
            <div className="join-btn-completed">
                <SpectedButton />
                <ResultButton />
            </div>

        </div>
    )
}

export default CompletedCard
