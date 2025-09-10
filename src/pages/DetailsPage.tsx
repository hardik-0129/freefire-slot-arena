import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import "../components/css/DetailsPage.css";
// import "../components/css/FullMap.css";
import MatchDetails from "@/components/MatchDetails";
import AboutMatch from "@/components/AboutMatch";

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
    // Enhanced match information
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
    tournamentRules?: {
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
    };
}

const DetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const slotData: Slot | null = location.state?.slotData || null;

    const handleJoinClick = () => {
        navigate('/select-slot', {
            state: {
                slotData: slotData
            }
        });
    };

    if (!slotData) {
        return (
            <>
                <Header />
                <section className="py-16 match-section">
                    <div className="container">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-red-500">No tournament data found</h2>
                            <p>Please go back and select a tournament from the list.</p>
                        </div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }
    return (
        <>
            <Header />
            <section className="py-16 match-section">
                <div className="container">
                    <div>
                        <div className="match-card">

                            <MatchDetails slotData={slotData} />

                            <AboutMatch slotData={slotData} />

                            <button className="join-btn" onClick={handleJoinClick}>
                                <img className="coin-icon" src="/assets/vector/Coin.png" alt="Coin" />
                                <span style={{ fontWeight: "850" }}>{slotData.entryFee} JOIN</span>
                                <img
                                    src="/assets/vector/Vector-Arrow.png"
                                    alt="Arrow"
                                    style={{
                                        width: '6.175px',
                                        height: '10px',
                                        transform: 'rotate(0deg)',
                                        opacity: 1,
                                        position: 'relative',
                                        top: '-2px',
                                        left: '7.16px'
                                    }}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default DetailsPage;