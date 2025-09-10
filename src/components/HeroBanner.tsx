import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
// Import required Swiper modules
import { Autoplay, EffectFade } from 'swiper/modules';
// Import custom CSS
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

export const HeroBanner = () => {
    const defaultBanner = {
        title: `BOOK YOUR SPOT.DOMINATE THE ARENA.`,
        description: 'Join daily Free Fire & Squad Tournaments.Compete, Win, Get Rewarded.',
        buttonText: 'VIEW TOURNAMENTS',
        backgroundImage: '/assets/banner/banner.jpg'
    };
    
    const [bannerData, setBannerData] = useState<BannerData>(defaultBanner);
    const [bannerImages, setBannerImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBannerData();
    }, []);

    const fetchBannerData = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banner`); // Using "banners" endpoint
            if (response.ok) {
                const data = await response.json();
                
                // Check if the response is an array
                if (Array.isArray(data) && data.length > 0) {
                    // Use the first banner from the array
                    const firstBanner = data[0];
                    // Set the banner data
                    setBannerData({
                        _id: firstBanner._id,
                        title: firstBanner.title,
                        description: firstBanner.description,
                        buttonText: firstBanner.buttonText,
                        backgroundImage: firstBanner.backgroundImage,
                        isActive: firstBanner.isActive
                    });
                    
                    // Set banner images for the slider
                    if (firstBanner.bannerImages && firstBanner.bannerImages.length > 0) {
                        setBannerImages(firstBanner.bannerImages);
                    } else {
                        // If no banner images, use the single background image
                        setBannerImages([firstBanner.backgroundImage]);
                    }
                } else if (!Array.isArray(data)) {
                    
                    // Set the banner data
                    setBannerData({
                        _id: data._id,
                        title: data.title,
                        description: data.description,
                        buttonText: data.buttonText,
                        backgroundImage: data.backgroundImage,
                        isActive: data.isActive
                    });
                    
                    // Set banner images for the slider
                    if (data.bannerImages && data.bannerImages.length > 0) {
                        setBannerImages(data.bannerImages);
                    } else {
                        setBannerImages([data.backgroundImage]);
                    }
                } else {
                    console.error('No banner data found in response');
                    // Use default image if no data
                    setBannerImages([defaultBanner.backgroundImage]);
                }
            } else {
                console.error('Failed to fetch banner data, status:', response.status);
                // Use default image if API fails
                setBannerImages([defaultBanner.backgroundImage]);
            }
        } catch (error) {
            console.error('Error fetching banner data:', error);
            // Use default image if API fails
            setBannerImages([defaultBanner.backgroundImage]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="hero-banner w-full flex items-center justify-center bg-gray-900" 
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
        <div className="hero-banner w-full relative overflow-hidden">
            <Swiper
                modules={[Autoplay]} /* Removed Navigation and Pagination modules */
                navigation={false} /* Disabled navigation arrows */
                pagination={false} /* Disabled pagination dots */
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false
                }}
                loop={true}
                className="w-full"
                breakpoints={{
                    // When screen width is >= 1440px
                    1440: {
                        height: 1100
                    },
                    // When screen width is >= 1024px
                    1024: {
                        height: 550
                    },
                    // When screen width is >= 768px
                    768: {
                        height: 425
                    },
                    // When screen width is < 768px
                    0: {
                        height: 240
                    }
                }}
            >
                {bannerImages.map((imageUrl, index) => (
                    <SwiperSlide key={index} className="relative">
                        {/* Background Image with Image fallback */}
                        <div className="w-full h-full relative">
                            <img 
                                src={imageUrl} 
                                alt={`Banner ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                            />
                            
                            {/* Gradient Overlay for better text visibility */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
                            
                            {/* Content Overlay */}
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
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};