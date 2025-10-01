import { useState } from 'react';
import { GamepadIcon } from 'lucide-react';

interface GameTypeImageProps {
  gameType: {
    gameType: string;
    image?: string;
    mobileBannerImage?: string;
  };
}

const GameTypeImage = ({ gameType }: GameTypeImageProps) => {
  const [desktopImageLoaded, setDesktopImageLoaded] = useState(false);
  const [mobileImageLoaded, setMobileImageLoaded] = useState(false);
  const [desktopImageFailed, setDesktopImageFailed] = useState(false);
  const [mobileImageFailed, setMobileImageFailed] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  // Try to resolve the image URL based on different possible formats
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    
    // If it's already a full URL
    if (imagePath.startsWith('http')) return imagePath;
    
    // If it's a relative path from the server with /uploads
    if (imagePath.startsWith('/uploads/')) {
      return `${apiUrl}${imagePath}`;
    }
    
    // If it doesn't include /uploads prefix but has a slash
    if (imagePath.includes('/') && !imagePath.startsWith('/uploads/')) {
      return `${apiUrl}/uploads/${imagePath}`;
    }
    
    // If it's just a filename
    return `${apiUrl}/uploads/gametypes/${imagePath}`;
  };
  
  const handleDesktopImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`Failed to load desktop image for ${gameType.gameType}`);
    setDesktopImageFailed(true);
  };
  
  const handleMobileImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`Failed to load mobile image for ${gameType.gameType}`);
    setMobileImageFailed(true);
  };
  
  const handleDesktopImageLoad = () => {
    setDesktopImageLoaded(true);
  };
  
  const handleMobileImageLoad = () => {
    setMobileImageLoaded(true);
  };
  
  const desktopImageUrl = getImageUrl(gameType.image);
  const mobileImageUrl = getImageUrl(gameType.mobileBannerImage);
  
  // If both images failed or don't exist, show fallback
  if ((desktopImageFailed || !desktopImageUrl) && (mobileImageFailed || !mobileImageUrl)) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#1A1A1A]">
        <GamepadIcon className="h-12 w-12 text-gray-600" />
      </div>
    );
  }
  
  return (
    <div className="h-full w-full flex">
      {/* Desktop Preview */}
      <div className="flex-1 relative border-r border-[#3A3A3A]">
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded z-10">
          Desktop
        </div>
        {desktopImageUrl && !desktopImageFailed ? (
          <>
            <img 
              src={desktopImageUrl} 
              alt={`${gameType.gameType} - Desktop`} 
              className="h-full w-full object-cover"
              onError={handleDesktopImageError}
              onLoad={handleDesktopImageLoad}
            />
            {!desktopImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-[#1A1A1A]">
            <GamepadIcon className="h-8 w-8 text-gray-600" />
          </div>
        )}
      </div>
      
      {/* Mobile Preview */}
      <div className="flex-1 relative">
        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded z-10">
          Mobile
        </div>
        {mobileImageUrl && !mobileImageFailed ? (
          <>
            <img 
              src={mobileImageUrl} 
              alt={`${gameType.gameType} - Mobile`} 
              className="h-full w-full object-cover"
              onError={handleMobileImageError}
              onLoad={handleMobileImageLoad}
            />
            {!mobileImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-green-500"></div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-[#1A1A1A]">
            <GamepadIcon className="h-8 w-8 text-gray-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default GameTypeImage;
