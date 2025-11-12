import React, { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import { Download } from 'lucide-react'
import 'swiper/css'
import './css/AppScreenshot.css'

const AppScreenshot = () => {
  const [swiper, setSwiper] = useState<SwiperType | null>(null)

  // Generate array of 14 image paths
  const images = Array.from({ length: 14 }, (_, i) => `/assets/mobile/${i + 1}.png`)

  const handleDownloadApk = async () => {
    try {
      const base = import.meta?.env?.VITE_API_URL;
      const res = await fetch(`${base}/api/apk/latest/public`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const url = (data && (data.downloadUrl || data.url)) ?
          ((data.downloadUrl?.startsWith('http') || data.url?.startsWith('http')) ? (data.downloadUrl || data.url) : `${base}${data.downloadUrl || data.url}`)
          : undefined;
        if (url) {
          window.location.href = url;
          return;
        }
      }
      // Fallback to static path if API fails
      window.location.href = `https://api1.alphalions.io/uploads/apk/alpha_lions_v008.apk`;
    } catch (e) {
      // Final fallback: open current known file
      const base = import.meta?.env?.VITE_API_URL || '';
      window.open(`https://api1.alphalions.io/uploads/apk/alpha_lions_v008.apk`, '_blank');
    }
  };

  return (
    <section className="app-screenshot-section">
      <div className="content">
        <h2>APP SCREENSHOT</h2>
        <p>Check the screenshots below to get an idea of the app flow and the features.</p>
      </div>
      
      <div className="screenshot-slider-container">
        <Swiper
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 30,
            },
          }}
          onSwiper={setSwiper}
          className="screenshot-swiper"
        >
          {images.map((imagePath, index) => (
            <SwiperSlide key={index} className="screenshot-slide">
              <div className="phone-mockup">
                <img 
                  src={imagePath} 
                  alt={`App Screenshot ${index + 1}`}
                  className="screenshot-image"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        <div className="slider-navigation">
          <button 
            className="swiper-button-prev-custom"
            onClick={() => swiper?.slidePrev()}
            aria-label="Previous slide"
          >
            <span className="nav-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" x="0" y="0" viewBox="0 0 32 32" ><g><path d="M16 1a15 15 0 1 0 15 15A15.017 15.017 0 0 0 16 1zm2.707 20.293a1 1 0 1 1-1.414 1.414l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 1.414L13.414 16z" fill="#000000" opacity="1" data-original="#000000"></path></g></svg>
              </span>
          </button>
          <button 
            className="swiper-button-next-custom"
            onClick={() => swiper?.slideNext()}
            aria-label="Next slide"
          >
            <span className="nav-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" x="0" y="0" viewBox="0 0 512 512"><g><path d="M256 0C114.837 0 0 114.837 0 256s114.837 256 256 256 256-114.837 256-256S397.163 0 256 0zm79.083 271.083L228.416 377.749A21.275 21.275 0 0 1 213.333 384a21.277 21.277 0 0 1-15.083-6.251c-8.341-8.341-8.341-21.824 0-30.165L289.835 256l-91.584-91.584c-8.341-8.341-8.341-21.824 0-30.165s21.824-8.341 30.165 0l106.667 106.667c8.341 8.341 8.341 21.823 0 30.165z" fill="#000" opacity="1" data-original="#000"></path></g></svg> </span>
          </button>
        </div>
      </div>

      <div className="download-app-container">
        <button 
          className="download-app-button" 
          onClick={handleDownloadApk}
          title="Download App"
          aria-label="Download App"
        >
          <span className="download-text">Download App</span>
          <Download className="download-icon" />
        </button>
      </div>
    </section>
  )
}

export default AppScreenshot
