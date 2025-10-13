import "./css/MatchDetails.css"
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
    firstwin?: number;
    secwin?: number;
    thirdwin?: number;
    matchIndex?: number;
    bannerImage?: string;
    gameMode?: string;
    mapName?: string;
    tournamentName?: string;
    matchTitle?: string;
    streamLink?: string;
    discordLink?: string;
    cancelReason?: string;
}

interface MatchDetailsProps {
    slotData?: Slot;
}

const MatchDetails = ({ slotData }: MatchDetailsProps) => {

    // Extract the actual slot data from the nested structure
    const currentSlotData = (slotData as any)?.slot || slotData;
    

    const formatDate = (dateString: string) => {
        if (!dateString) return 'INVALID DATE';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'INVALID DATE';
        return date.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return 'INVALID DATE';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'INVALID DATE';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
    };

    const currentSlots = (currentSlotData.maxBookings || 0) - (currentSlotData.remainingBookings || 0);

    return (
        <>
            <div style={{ position: 'relative' }}>
                <Skeleton height={0} style={{ paddingBottom: '56.25%', borderRadius: 16 }} baseColor="#eeeeee" highlightColor="#f5f5f5" />
                <img
                    src={currentSlotData?.bannerImage || "/assets/images/category.png"}
                    alt="Free Fire"
                    className="match-image"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }}
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).src = "/assets/images/category.png"; }}
                />
            </div>
            <h2 className="text-[32px] font-bold mb-2 uppercase mx-4 mt-2">
                FF {currentSlotData.slotType?.toUpperCase() || 'TOURNAMENT'} TOURNAMENT (RYDEN BAN) #ALPHALIONS - MATCH #{currentSlotData.matchIndex}
            </h2>
            <div className="match-top mb-4">
                <span className="badge orange">TYPE: {currentSlotData.slotType?.toUpperCase() || 'N/A'}</span>
                <span className="badge orange">
                    ENTRY FEE : {Number(currentSlotData.entryFee || 0) <= 0 ? (
                        'FREE'
                    ) : (
                        <>
                            <img className="coin-icon" src="/assets/vector/Coin.png" alt="Coin" /> {currentSlotData.entryFee}
                        </>
                    )}
                </span>
                <span className="badge black">MATCH TYPE: {(currentSlotData.entryFee || 0) > 0 ? 'PAID' : 'FREE'}</span>
                <span className="badge orange">MAP: {(currentSlotData as any).mapName ? (currentSlotData as any).mapName.toUpperCase() : 'BERMUDA'}</span>
                <span className="badge black">
                    ORGANISED ON: {currentSlotData.matchTime ? formatDate(currentSlotData.matchTime) : 'INVALID DATE'} <span style={{ color: '#FFA500' }}>{currentSlotData.matchTime ? formatTime(currentSlotData.matchTime) : 'INVALID DATE'}</span>
                </span>
            </div>

            <h3 className="match-title mb-2">Price Details</h3>

            <div className="price-column mb-2 mx-4">
                <div className="price-badges-row">
                    <span className="badge orange">TOTAL REWARD: <img className="coin-icon" src="/assets/vector/Coin.png" alt="Coin" />{currentSlotData.totalWinningPrice || 0}</span>
                    <span className="badge black">PER KILL: <img className="coin-icon" src="/assets/vector/Coin.png" alt="Coin" />{currentSlotData.perKill || 0}</span>
                </div>
                <div><span className="badge orange">SLOTS: {currentSlots}/{currentSlotData.maxBookings || 0}</span></div>
                <div><span className="badge orange"><img src="/assets/vector/booyah.png" alt="Booyah" /> <img className="coin-icon" src="/assets/vector/Coin.png" alt="Coin" /> :{typeof currentSlotData.firstwin === 'number' ? currentSlotData.firstwin : Math.floor((currentSlotData.totalWinningPrice || 0) * 0.4)}</span></div>
                <div><span className="badge orange">2ND PLACE: <img className="coin-icon" src="/assets/vector/Coin.png" alt="Coin" /> :{typeof currentSlotData.secwin === 'number' ? currentSlotData.secwin : Math.floor((currentSlotData.totalWinningPrice || 0) * 0.3)}</span></div>
                <div><span className="badge orange">3RD PLACE: <img className="coin-icon" src="/assets/vector/Coin.png" alt="Coin" /> :{typeof currentSlotData.thirdwin === 'number' ? currentSlotData.thirdwin : Math.floor((currentSlotData.totalWinningPrice || 0) * 0.2)}</span></div>
            </div>

        </>
    )
}

export default MatchDetails
