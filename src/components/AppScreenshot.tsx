import React, { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import './css/AppScreenshot.css'

const AppScreenshot = () => {
  const [swiper, setSwiper] = useState<SwiperType | null>(null)

  // Generate array of 14 image paths
  const images = Array.from({ length: 14 }, (_, i) => `/assets/mobile/${i + 1}.png`)

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
            <span className="nav-arrow">‹</span>
          </button>
          <button 
            className="swiper-button-next-custom"
            onClick={() => swiper?.slideNext()}
            aria-label="Next slide"
          >
            <span className="nav-arrow">›</span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default AppScreenshot
