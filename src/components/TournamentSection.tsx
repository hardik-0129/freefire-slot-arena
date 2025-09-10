import { useState, useEffect } from "react";
import "./css/Tournament.css"
import { useNavigate } from 'react-router-dom';

interface GameTypeData {
    _id: string;
    gameType: string;
    image?: string;
    isActive?: boolean;
}

export const TournamentSection = () => {
    const navigate = useNavigate();
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

