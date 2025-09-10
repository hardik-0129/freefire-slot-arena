import React from 'react'

interface TournamentRules {
    accountNameVerification?: boolean;
    airdropType?: string;
    characterSkill?: string;
    gunAttributes?: string;
    limitedAmmo?: string;
    maxHeadshotRate?: number;
    minimumLevel?: number;
    mustRecordGameplay?: boolean;
    onlyMobileAllowed?: boolean;
    penaltySystem?: {
        violatingRules?: string;
        noRewards?: boolean;
        permanentBan?: boolean;
    };
    prohibitedActivities?: string[];
    recordFromJoining?: boolean;
    roomIdPasswordTime?: number;
    screenRecordingRequired?: boolean;
    teamRegistrationRules?: string;
}

interface SlotData {
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
    banList?: string;
    contactInfo?: string;
    discordLink?: string;
    gameMode?: string;
    mapName?: string;
    matchDescription?: string;
    prizeDistribution?: string;
    rules?: string;
    specialRules?: string;
    status?: string;
    streamLink?: string;
    tournamentName?: string;
    hostName?: string;
    tournamentRules?: TournamentRules;
}

interface AboutMatchProps {
    slotData: SlotData;
}

const AboutMatch: React.FC<AboutMatchProps> = ({ slotData }) => {
    const rules = slotData.tournamentRules;
    // If slotData.rules is a string (HTML), render it directly
    const rulesHtml = typeof slotData.rules === 'string' && slotData.rules.trim().startsWith('<') ? slotData.rules : null;
    const tournamentName = slotData.tournamentName || "#ALPHALIONS";
    const gameMode = slotData.gameMode || "Classic";
    const slotType = slotData.slotType || "Squad";
    const hostName = slotData.hostName || "ALPHA LIONS";

    // Helper function to format game mode display
    const getGameModeDisplay = () => {
        if (slotType === 'Clash Squad') {
            return 'Clash Squad (2v2)';
        }
        if (slotType === 'Lone Wolf') {
            return 'Lone Wolf (Solo)';
        }
        if (slotType === 'Survival') {
            return 'Survival Mode (Squad)';
        }
        if (slotType === 'Free Matches') {
            return 'Free Matches (Duo)';
        }

        const modeMap: { [key: string]: string } = {
            'Classic': 'Classic Battle Royale',
            'Ranked': 'Ranked Battle Royale',
            'Custom': 'Custom Room',
            'Solo': 'Solo Battle Royale',
            'Duo': 'Duo Battle Royale',
            'Squad': 'Squad Battle Royale'
        };
        return modeMap[gameMode] || gameMode;
    };

    // Helper function to format slot type display
    const getSlotTypeDisplay = () => {
        if (slotType === 'Clash Squad') {
            return '2 vs 2 (Clash Squad)';
        }
        if (slotType === 'Lone Wolf') {
            return 'Solo Battle (Lone Wolf)';
        }
        if (slotType === 'Survival') {
            return '4 vs 4 (Survival)';
        }
        if (slotType === 'Free Matches') {
            return '2 vs 2 (Free Matches)';
        }

        const typeMap: { [key: string]: string } = {
            'Solo': '1 vs 1 (Solo)',
            'Duo': '2 vs 2 (Duo)',
            'Squad': '4 vs 4 (Squad)'
        };
        return typeMap[slotType] || slotType;
    };

    return (
        <>
            <div className="about">
                <div className="gray-box">
                    <div className="section-title">ABOUT THIS MATCH</div>

                    {/* <div className="rules-section">
                        <div className="emoji-title">🔥 {slotType === 'Clash Squad' ? 'CLASH SQUAD 2 VS 2 #MOSHIF'
                            : slotType === 'Lone Wolf' ? 'LONE WOLF SOLO BATTLE #ALPHALIONS'
                                : slotType === 'Survival' ? 'SURVIVAL MODE #ALPHALIONS'
                                    : slotType === 'Free Matches' ? 'FREE MATCHES TOURNAMENT #ALPHALIONS'
                                        : tournamentName} TOURNAMENT RULES</div>
                        <p><span className="highlight">HOST:</span> {hostName}</p>
                        <p><span className="highlight">TOURNAMENT NAME:</span> {tournamentName}</p>
                        <p><span className="highlight">GAME MODE:</span> Free Fire MAX – {getGameModeDisplay()}</p>
                        <p><span className="highlight">SLOT TYPE:</span> {getSlotTypeDisplay()}</p>
                        {slotData.mapName && <p><span className="highlight">MAP:</span> {slotData.mapName}</p>}
                    </div>

                    <div className="rules-section">
                        <div className="emoji-title">✅ MUST FOLLOW THESE RULES</div>
                        <ul>
                            <li>Free Fire ID must be level {rules?.minimumLevel || 40} or above</li>
                            {rules?.onlyMobileAllowed && <li>Only mobile players are allowed</li>}
                            <li>Clash Squad career headshot rate must not exceed {rules?.maxHeadshotRate || 70}%</li>
                        </ul>
                    </div>

                    <div className="rules-section">
                        <div className="emoji-title">❌ PROHIBITED ACTIVITIES</div>
                        <ul>
                            {rules?.prohibitedActivities && rules.prohibitedActivities.length > 0 ? (
                                rules.prohibitedActivities.map((activity, index) => (
                                    <li key={index}>{activity}</li>
                                ))
                            ) : (
                                <>
                                    <li>Using any type of panel/hack or third-party application</li>
                                    <li>Inviting unregistered players</li>
                                    <li>Prohibited throwable items: Grenade, smoke, flash freeze, flashbang, etc.</li>
                                    <li>Zone Pack is not allowed</li>
                                    <li>Double Vector gun is not allowed</li>
                                </>
                            )}
                            {slotData.banList && <li>Banned items: {slotData.banList}</li>}
                            {slotData.specialRules && <li>Special Rules: {slotData.specialRules}</li>}
                        </ul>
                    </div>

                    <div className="rules-section">
                        <div className="emoji-title">⚙️ ROOM SETTINGS</div>
                        <ul>
                            <li>Character Skill: {rules?.characterSkill || "Yes"} {rules?.characterSkill === "Yes" ? "(Ryden ban)" : ""}</li>
                            <li>Gun Attributes: {rules?.gunAttributes || "Yes"}</li>
                            <li>Airdrop (any type): {rules?.airdropType || "Yes"}</li>
                            <li>Limited Ammo: {rules?.limitedAmmo || "Yes"}</li>
                        </ul>
                    </div>

                    <div className="rules-section">
                        <div className="emoji-title">🔐 MATCH ROOM ID & PASSWORD</div>
                        <ul>
                            <li>Room ID and Password will be provided {rules?.roomIdPasswordTime || 15} minutes before match starts</li>
                            <li>Check notifications or email for room access details</li>
                        </ul>
                    </div>

                    <div className="rules-section">
                        <div className="emoji-title">📝 JOINING INSTRUCTIONS</div>
                        <div className="sub-section">
                            <p><strong>Enter Account Name:</strong></p>
                            <p>Make sure your Free Fire MAX account name is entered correctly during registration.</p>
                            <p><strong>Note:</strong> Changes will not be accepted after submission.</p>
                        </div>
                        {rules?.accountNameVerification && (
                            <div className="sub-section">
                                <p><strong>Verify Account Name:</strong></p>
                                <p>Ensure that the account name you submit matches your in-game name, or it may lead to disqualification.</p>
                            </div>
                        )}
                    </div>

                    <div className="rules-section">
                        <div className="emoji-title">⚠️ IMPORTANT NOTICES</div>
                        <ul>
                            <li>After registration, players must join the room once the Room ID and Password are shared.</li>
                            <li><strong>Failure to join = No refund.</strong></li>
                        </ul>
                        {rules?.teamRegistrationRules && (
                            <div className="sub-section">
                                <p><strong>Team Registration:</strong></p>
                                <p>{rules.teamRegistrationRules}</p>
                            </div>
                        )}
                        <ul>
                            <li>Use of abusive words against the host may lead to penalty or disqualification</li>
                            <li>ALPHA LIONS reserves the right to modify rules and prizes at any time.</li>
                            {slotData.contactInfo && <li><strong>Contact:</strong> {slotData.contactInfo}</li>}
                        </ul>
                    </div>

                    {(rules?.mustRecordGameplay || rules?.screenRecordingRequired || rules?.recordFromJoining) && (
                        <div className="rules-section">
                            <div className="emoji-title">📹 GAMEPLAY REQUIREMENTS</div>
                            <ul>
                                {rules?.mustRecordGameplay && <li>Players must record gameplay</li>}
                                {rules?.screenRecordingRequired && <li>Game replay is not accepted as proof — screen recording must be ON</li>}
                                {rules?.recordFromJoining && <li>Blacklisted players must record from joining till the end</li>}
                            </ul>
                        </div>
                    )}

                    <div className="rules-section">
                        <div className="emoji-title">⚡ PENALTIES</div>
                        <p><strong>🔸 Violating any rules may result in:</strong></p>
                        <ul>
                            {rules?.penaltySystem?.violatingRules && <li>{rules.penaltySystem.violatingRules}</li>}
                            {rules?.penaltySystem?.noRewards && <li>No rewards</li>}
                            {rules?.penaltySystem?.permanentBan && <li>Permanent account ban</li>}
                        </ul>
                    </div> */}

                    {rulesHtml ? (
                        <div className="rules-section" dangerouslySetInnerHTML={{ __html: rulesHtml }} />
                    ) : (
                        <>
                            <div className="rules-section">
                                <div className="emoji-title">🔥 {slotType === 'Clash Squad' ? 'CLASH SQUAD 2 VS 2 #MOSHIF'
                                    : slotType === 'Lone Wolf' ? 'LONE WOLF SOLO BATTLE #ALPHALIONS'
                                        : slotType === 'Survival' ? 'SURVIVAL MODE #ALPHALIONS'
                                            : slotType === 'Free Matches' ? 'FREE MATCHES TOURNAMENT #ALPHALIONS'
                                                : tournamentName} TOURNAMENT RULES</div>
                                <p><span className="highlight">HOST:</span> {hostName}</p>
                                <p><span className="highlight">TOURNAMENT NAME:</span> {tournamentName}</p>
                                <p><span className="highlight">GAME MODE:</span> Free Fire MAX – {getGameModeDisplay()}</p>
                                <p><span className="highlight">SLOT TYPE:</span> {getSlotTypeDisplay()}</p>
                                {slotData.mapName && <p><span className="highlight">MAP:</span> {slotData.mapName}</p>}
                            </div>
                            {/* ...existing code for rules sections... */}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default AboutMatch
