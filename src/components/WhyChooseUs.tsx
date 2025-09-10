import React from 'react'
import "./css/WhyChooseUs.css"

const WhyChooseUs = () => {
    return (
        <div className='container mx-auto px-4 md:px-6'>
            <h2 className="text-[32px] md:text-[42px] font-bold text-center mb-6 md:mb-10">Why Choose Us?</h2>
            <div className="features-wrapper">
                <div className="features">
                    <div className="feature-card">
                        <img src="/assets/images/Frame.png" alt="Daily Matches" />
                        <h3>DAILY MATCHES</h3>
                        <p>Tournaments every day for BGMI & Free Fire.</p>
                    </div>
                    <div className="feature-card">
                        <img src="/assets/images/Frame (1).png" alt="Entry from ₹1" />
                        <h3>ENTRY FROM ₹1</h3>
                        <p>Affordable slots for everyone.</p>
                    </div>
                    <div className="feature-card">
                        <img src="/assets/images/Frame (2).png" alt="Instant Rewards" />
                        <h3>INSTANT REWARDS</h3>
                        <p>Get your prize within minutes of winning.</p>
                    </div>
                    <div className="feature-card">
                        <img src="/assets/images/Frame (3).png" alt="Fair & Secure" />
                        <h3>FAIR & SECURE</h3>
                        <p>No cheating. No scams. 100% verified results.</p>
                    </div>
                    <div className="feature-card">
                        <img src="/assets/images/Frame (4).png" alt="Mobile Friendly" />
                        <h3>MOBILE FRIENDLY</h3>
                        <p>Play, book, and earn straight from your phone.</p>
                    </div>
                    <div className="feature-card">
                        <img src="/assets/images/Frame (5).png" alt="Community Support" />
                        <h3>COMMUNITY SUPPORT</h3>
                        <p>24/7 player support via WhatsApp & Discord.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WhyChooseUs
