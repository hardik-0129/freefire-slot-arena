import Footer from '@/components/Footer'
import { Header } from '@/components/Header'
import MatchDetails from '@/components/MatchDetails'
import Table from '@/components/table/Table'
import '@/components/css/FullMap.css'
import { useLocation } from 'react-router-dom'

const WinnerDetails = () => {
    const location = useLocation();
    const slotData = location.state?.slotData;
    return (
        <>
            <Header />
            <section className="py-16 match-section">
                <div className="container">
                    <div>
                        <div className="match-card">
                            <MatchDetails slotData={slotData} />
                            <div className="table-container-responsive">
                                <div className="table-item">
                                    {/* Top 3 winners */}
                                    <Table slotId={slotData?._id} showWinners={true} topOnly={true} />
                                </div>
                                <div className="table-item">
                                    {/* All winners */}
                                    <Table slotId={slotData?._id} showWinners={true} topOnly={false} />
                                </div>
                            </div>
                            <button
                                className="join-btn"
                                onClick={() => {
                                    if (slotData?.streamLink) {
                                        window.open(slotData.streamLink, '_blank', 'noopener,noreferrer');
                                    }
                                }}
                                disabled={!slotData?.streamLink}
                                style={{ opacity: slotData?.streamLink ? 1 : 0.5, cursor: slotData?.streamLink ? 'pointer' : 'not-allowed' }}
                            >
                                <img src="/assets/vector/S-Vector.png" alt="Coin" />
                                <span style={{ fontWeight: "850" }}>Spectate</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}

export default WinnerDetails;
