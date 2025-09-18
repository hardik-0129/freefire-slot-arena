import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
// Import required Swiper modules
import { Autoplay } from 'swiper/modules';
// Import custom CSS
import "./css/HeroBanner.css";

interface BannerData {
    _id?: string;
    title: string;
    description: string;
    buttonText: string;
    backgroundImage: string;
    bannerImages?: string[];
    imageGallery?: Array<{
        url: string;
        title?: string;
        description?: string;
        buttonText?: string;
    }>;
    isActive?: boolean;
}

export const HeroBanner = () => {
    const fallbackImage = '/assets/banner/banner.jpg';
    
    const [bannerData, setBannerData] = useState<BannerData>();
    const [bannerImages, setBannerImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBannerData();
    }, []);

    const fetchBannerData = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banner`); // Using "banners" endpoint
            if (response.ok) {
                const data = await response.json();
                console.log('[HeroBanner] GET /api/banner response:', data);
                const toArray = Array.isArray(data) ? data : [data];
                const active = toArray.find((b: any) => b && b.isActive) || toArray[0];
                console.log('[HeroBanner] Selected active banner:', active);
                if (active) {
                    setBannerData({
                        _id: active._id,
                        title: active.title || '',
                        description: active.description || '',
                        buttonText: active.buttonText || '',
                        backgroundImage: active.backgroundImage || fallbackImage,
                        imageGallery: Array.isArray(active.imageGallery) ? active.imageGallery : [],
                        isActive: active.isActive
                    });
                    if (Array.isArray(active.bannerImages) && active.bannerImages.length > 0) {
                        setBannerImages(active.bannerImages);
                        console.log('[HeroBanner] Using bannerImages:', active.bannerImages);
                    } else {
                        const single = [active.backgroundImage || fallbackImage];
                        console.log('[HeroBanner] Using single background image:', single);
                        setBannerImages(single);
                    }
                } else {
                    setBannerData({
                        title: '',
                        description: '',
                        buttonText: '',
                        backgroundImage: fallbackImage
                    } as any);
                    console.log('[HeroBanner] No active banner. Falling back to image:', fallbackImage);
                    setBannerImages([fallbackImage]);
                }
            } else {
                console.error('Failed to fetch banner data, status:', response.status);
                setBannerImages([fallbackImage]);
            }
        } catch (error) {
            console.error('[HeroBanner] Error fetching banner data:', error);
            setBannerImages([fallbackImage]);
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

    // Build slides with per-image metadata when available
    const slides = (bannerData?.imageGallery && bannerData.imageGallery.length > 0)
        ? bannerData.imageGallery.map(g => ({
            url: g.url,
            title: g.title || '',
            description: g.description || '',
            buttonText: g.buttonText || ''
          }))
        : bannerImages.map(url => ({
            url,
            title: bannerData?.title || '',
            description: bannerData?.description || '',
            buttonText: bannerData?.buttonText || ''
          }));

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
                {slides.map((s, index) => (
                    <SwiperSlide key={index} className="relative">
                        {/* Background Image with optional overlay */}
                        <div className="w-full h-full relative">
                            <img 
                                src={s.url} 
                                alt={`Banner ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                            />
                            { (s.title || s.description || s.buttonText) && (
                              <>
                                {/* Gradient Overlay for better text visibility */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
                                {/* Content Overlay */}
                                <div className="absolute inset-0 flex items-center">
                                  <div className="container mx-auto px-4">
                                    <div className="max-w-2xl">
                                      {s.title && (
                                        <h2 className="text-[32px] sm:text-[36px] md:text-[42px] font-bold text-white mb-2 md:mb-4 leading-tight">{s.title}</h2>
                                      )}
                                      {s.description && (
                                        <p className="text-[14px] sm:text-[15px] md:text-[16px] text-gray-200 mb-4 md:mb-8">{s.description}</p>
                                      )}
                                      {s.buttonText && (
                                        <Button
                                          size="lg"
                                          className="w-full sm:w-[160px] md:w-[191px] lg:w-[220px] h-[40px] md:h-[43px] lg:h-[50px] rounded-[8px] bg-[#000000] text-white text-[12px] md:text-[13px] lg:text-[16px] flex items-center justify-center"
                                          onClick={() => navigate('/tournament')}>
                                          {s.buttonText}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};