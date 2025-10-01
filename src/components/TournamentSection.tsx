import { useState, useEffect } from "react";
import "./css/Tournament.css"
import { useNavigate, useLocation } from 'react-router-dom';

interface GameTypeData {
    _id: string;
    gameType: string;
    image?: string;
    isActive?: boolean;
}

export const TournamentSection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [gameTypes, setGameTypes] = useState<GameTypeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchGameTypes();
    }, []);

    const fetchGameTypes = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gametypes`);

            if (response.ok) {
                const data = await response.json();
                // Handle different response formats
                if (Array.isArray(data)) {
                    setGameTypes(data);
                } else if (data.gameTypes) {
                    setGameTypes(data.gameTypes);
                } else if (data.data) {
                    setGameTypes(data.data);
                }
            } else {
                console.error('Failed to fetch game types:', response.status);
            }
        } catch (error) {
            console.error('Error fetching game types:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (gameType: GameTypeData) => {
        // Pass the game type ID and data to the target page
        navigate('/fullmap', {
            state: {
                selectedGameType: gameType,
                gameType: gameType.gameType,
                gameTypeData: gameType,
                gameTypeId: gameType._id
            }
        });
    };

    const getImageUrl = (src?: string) => {
        if (!src) return "/assets/images/category.png";
        return src.startsWith('http') ? src : `${import.meta.env.VITE_API_URL}${src}`;
    }

    return (
        <section className="tournament-section">
            <div className="container">
                <h2 className="tournament-title">Tournament</h2>
                {/* Success alert banner - show only on Tournament page */}
                {location.pathname === '/tournament' && (
                    <div className="task-banner" style={{
                        background: '#dff0d8',
                        border: '1px solid #c8e5bc',
                        color: '#3c763d',
                        padding: '10px 12px',
                        borderRadius: 6,
                        marginBottom: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <div aria-hidden="true" style={{ display: 'inline-flex', gap: 7}}>
                            <svg width="16" height="16" viewBox="0 0 16 16">
                                <rect x="1" y="1" width="14" height="14" rx="2" fill="#2dbd3a"/>
                                <path d="M4 8.2l2.3 2.3L12 5.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div style={{ flex: 1, fontWeight: 700 }}>
                            Complete your task and verify your NFT ownership with your wallet address.
                        </div>
                        </div>
                        
                        <a href="/task" style={{ textDecoration: 'underline', color: '#2f6f2f', fontWeight: 700, whiteSpace: 'nowrap' }}>Go to verification ↗</a>
                    </div>
                )}
                <div className="card-container">
                    {!loading && gameTypes.map((gameType) => {
                        const imgSrc = getImageUrl(gameType.image);
                        const loaded = imageLoaded[gameType._id];
                        return (
                        <div
                            key={gameType._id}
                            className="card"
                            onClick={() => handleCardClick(gameType)}
                        >
                                {!loaded && (
                                    <div className="image-skeleton" aria-label="loading image" />
                                )}
                                <img
                                    src={imgSrc}
                                alt={gameType.gameType}
                                    style={{ display: loaded ? 'block' : 'none' }}
                                    onLoad={() => setImageLoaded(prev => ({ ...prev, [gameType._id]: true }))}
                                    onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/assets/images/category.png";
                                        setImageLoaded(prev => ({ ...prev, [gameType._id]: true }));
                                }}
                            />
                            <button>{gameType.gameType}</button>
                        </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

