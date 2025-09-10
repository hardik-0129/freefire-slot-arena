import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { Autoplay, EffectFade } from 'swiper/modules';
import "./css/HeroBanner.css";

interface BannerData {
    _id?: string;
    title: string;
    description: string;
    buttonText: string;
    backgroundImage: string;
    bannerImages?: string[];
    isActive?: boolean;
}

export const HeroBannerFixed = () => {
    const defaultBanner = {
        title: `BOOK YOUR SPOT.DOMINATE THE ARENA.`,
        description: 'Join daily Free Fire & Squad Tournaments.Compete, Win, Get Rewarded.',
        buttonText: 'VIEW TOURNAMENTS',
        backgroundImage: '/assets/banner/banner.jpg'
    };
    
    const [bannerData, setBannerData] = useState<BannerData>(defaultBanner);
    const [bannerImages, setBannerImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    
    // You can set this to 'cover' or 'contain' based on your preference
    // 'cover' - Image will fill the entire container but may be cropped
    // 'contain' - Full image will be visible but may have empty space
    const imageDisplayMode = 'cover'; 

    useEffect(() => {
        fetchBannerData();
    }, []);

    const fetchBannerData = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banners`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (Array.isArray(data) && data.length > 0) {
                    const firstBanner = data[0];
                    
                    setBannerData({
                        _id: firstBanner._id,
                        title: firstBanner.title,
                        description: firstBanner.description,
                        buttonText: firstBanner.buttonText,
                        backgroundImage: firstBanner.backgroundImage,
                        isActive: firstBanner.isActive
                    });
                    
                    if (firstBanner.bannerImages && firstBanner.bannerImages.length > 0) {
                        setBannerImages(firstBanner.bannerImages);
                    } else {
                        setBannerImages([firstBanner.backgroundImage]);
                    }
                } else if (!Array.isArray(data)) {
                    setBannerData({
                        _id: data._id,
                        title: data.title,
                        description: data.description,
                        buttonText: data.buttonText,
                        backgroundImage: data.backgroundImage,
                        isActive: data.isActive
                    });
                    
                    if (data.bannerImages && data.bannerImages.length > 0) {
                        setBannerImages(data.bannerImages);
                    } else {
                        setBannerImages([data.backgroundImage]);
                    }
                } else {
                    setBannerImages([defaultBanner.backgroundImage]);
                }
            } else {
                setBannerImages([defaultBanner.backgroundImage]);
            }
        } catch (error) {
            console.error('Error fetching banner data:', error);
            setBannerImages([defaultBanner.backgroundImage]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="hero-banner w-full flex items-center justify-center bg-black" 
                 style={{ height: '700px', minHeight: '240px' }}>
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    // Handle image loading error
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = '/assets/banner/banner.jpg';
    };

    return (
        <div className="hero-banner w-full relative overflow-hidden bg-black">
            <Swiper
                modules={[Autoplay, EffectFade]}
                effect="fade"
                navigation={false}
                pagination={false}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false
                }}
                loop={true}
                className="w-full"
                breakpoints={{
                    1440: { height: 700 },
                    1024: { height: 550 },
                    768: { height: 425 },
                    0: { height: 240 }
                }}
            >
                {bannerImages.map((imageUrl, index) => (
                    <SwiperSlide key={index} className="relative bg-black">
                        <div className="w-full h-full flex items-center justify-center bg-black">
                            <div className="w-full h-full relative">
                                {/* Display the image with chosen mode */}
                                <img 
                                    src={imageUrl} 
                                    alt={`Banner ${index + 1}`}
                                    className={`w-full h-full object-${imageDisplayMode}`}
                                    onError={handleImageError}
                                    style={{backgroundColor: '#000'}}
                                />
                                
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
                                
                                {/* Content */}
                                <div className="absolute inset-0 flex items-center">
                                    <div className="container mx-auto px-4">
                                        <div className="max-w-2xl">
                                            <h2 className="text-[32px] sm:text-[36px] md:text-[42px] font-bold text-white mb-2 md:mb-4 leading-tight">
                                                {bannerData.title}
                                            </h2>
                                            <p className="text-[14px] sm:text-[15px] md:text-[16px] text-gray-200 mb-4 md:mb-8">
                                                {bannerData.description}
                                            </p>
                                            <Button
                                                size="lg"
                                                className="w-full sm:w-[160px] md:w-[191px] lg:w-[220px] h-[40px] md:h-[43px] lg:h-[50px] rounded-[8px] bg-[#000000] hover:bg-[#FF6B6B] text-white text-[12px] md:text-[13px] lg:text-[16px] flex items-center justify-center"
                                            >
                                                {bannerData.buttonText}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};
