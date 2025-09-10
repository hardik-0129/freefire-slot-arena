import "./css/matchDetails.css"
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
}

interface MatchDetailsProps {
    slotData?: Slot;
}

const MatchDetails = ({ slotData }: MatchDetailsProps) => {

    const currentSlotData = slotData

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const currentSlots = currentSlotData.maxBookings - currentSlotData.remainingBookings;

    return (
        <>
            <div style={{ position: 'relative' }}>
                <Skeleton height={0} style={{ paddingBottom: '56.25%', borderRadius: 16 }} baseColor="#eeeeee" highlightColor="#f5f5f5" />
                <img
                    src={currentSlotData.bannerImage ? currentSlotData.bannerImage : "/assets/images/category.png"}
                    alt="Free Fire"
                    className="match-image"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }}
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).src = "/assets/images/category.png"; }}
                />
            </div>
            <h2 className="text-[32px] font-bold mb-2 uppercase mx-4 py-4">
                FF {currentSlotData.slotType.toUpperCase()} TOURNAMENT (RYDEN BAN) #ALPHALIONS - MATCH #{currentSlotData.matchIndex}
            </h2>
            <div className="match-top mb-4">
                <span className="badge orange">TYPE: {currentSlotData.slotType.toUpperCase()}</span>
                <span className="badge orange">ENTRY FEE : <img className="coin-icon" src="/assets/vector/Coin.png" alt="Coin" /> {currentSlotData.entryFee}</span>
                <span className="badge black">MATCH TYPE: PAID</span>
                <span className="badge orange">MAP: BERMUDA</span>
                <span className="badge black">
                    ORGANISED ON: {formatDate(currentSlotData.matchTime)} <span style={{ color: '#FFA500' }}>{formatTime(currentSlotData.matchTime)}</span>
                </span>
            </div>

            <h3 className="match-title mb-2">Price Details</h3>

            <div className="price-column mb-2 mx-4">
                <div className="price-badges-row">
                    <span className="badge orange">TOTAL REWARD: <img className="coin-icon" src="/assets/vector/Coin.png" alt="Coin" />{currentSlotData.totalWinningPrice}</span>
                    <span className="badge black">PER KILL: <img className="coin-icon" src="/assets/vector/Coin.png" alt="Coin" />{currentSlotData.perKill}</span>
                </div>
                <div><span className="badge orange">SLOTS: {currentSlots}/{currentSlotData.maxBookings}</span></div>
                <div><span className="badge orange"><img src="/assets/vector/booyah.png" alt="Booyah" /> <img className="coin-icon" src="/assets/vector/Coin.png" alt="Coin" /> :{typeof currentSlotData.firstwin === 'number' ? currentSlotData.firstwin : Math.floor(currentSlotData.totalWinningPrice * 0.4)}</span></div>
                <div><span className="badge orange">2ND PLACE: <img className="coin-icon" src="/assets/vector/Coin.png" alt="Coin" /> :{typeof currentSlotData.secwin === 'number' ? currentSlotData.secwin : Math.floor(currentSlotData.totalWinningPrice * 0.3)}</span></div>
                <div><span className="badge orange">3RD PLACE: <img className="coin-icon" src="/assets/vector/Coin.png" alt="Coin" /> :{typeof currentSlotData.thirdwin === 'number' ? currentSlotData.thirdwin : Math.floor(currentSlotData.totalWinningPrice * 0.2)}</span></div>
            </div>

        </>
    )
}

export default MatchDetails
