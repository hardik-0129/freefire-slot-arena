import { useState } from 'react';
import { GamepadIcon } from 'lucide-react';

interface GameTypeImageProps {
  gameType: {
    gameType: string;
    image?: string;
  };
}

const GameTypeImage = ({ gameType }: GameTypeImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  // Try to resolve the image URL based on different possible formats
  const getImageUrl = () => {
    if (!gameType.image) return null;
    
    // If it's already a full URL
    if (gameType.image.startsWith('http')) return gameType.image;
    
    // If it's a relative path from the server with /uploads
    if (gameType.image.startsWith('/uploads/')) {
      return `${apiUrl}${gameType.image}`;
    }
    
    // If it doesn't include /uploads prefix but has a slash
    if (gameType.image.includes('/') && !gameType.image.startsWith('/uploads/')) {
      return `${apiUrl}/uploads/${gameType.image}`;
    }
    
    // If it's just a filename
    return `${apiUrl}/uploads/gametypes/${gameType.image}`;
  };
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`Failed to load image for ${gameType.gameType}`);
    setImageFailed(true);
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const imageUrl = getImageUrl();
  
  if (imageFailed || !imageUrl) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#1A1A1A]">
        <GamepadIcon className="h-12 w-12 text-gray-600" />
      </div>
    );
  }
  
  return (
    <>
      <img 
        src={imageUrl} 
        alt={gameType.gameType} 
        className="h-full w-full object-cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        </div>
      )}
    </>
  );
};

export default GameTypeImage;
