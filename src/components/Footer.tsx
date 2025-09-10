import React from 'react'
import './css/Footer.css';

const Footer = () => {
    return (    
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-left">
                    <ul>
                        <li><a href="#">FAQ</a></li>
                        <li><a href="/tournament">TOURNAMENT</a></li>
                        <li><a href="#">RULES AND REGULATION</a></li>
                        <li><a href="#">CONTACT US</a></li>
                        <li><a href="#">PRIVACY POLICY</a></li>
                        <li><a href="#">TERMS & CONDITIONS</a></li>
                        <li><a href="#">ABOUT US</a></li>
                    </ul>
                    <span className="copyright">© 2025 ALPHA LIONS ALL RIGHTS RESERVED.</span>
                </div>

                <div className="footer-right">
                    <h2>ALPHA LIONS<br /><span>E–TOURNAMENT</span></h2>
                    <div className="footer-bottom-row">
                        <div className="social-section">
                            <p>FOLLOW US ON</p>
                            <div className="social-icons">
                                <img src="/assets/vector/twitter.png" alt="Twitter" />
                                <img src="/assets/vector/Instagram.png" alt="Instagram" />
                                <img src="/assets/vector/discord.png" alt="Discord" />
                                <img src="/assets/vector/youtube.png" alt="YouTube" />
                            </div>
                        </div>

                        <div className="language-section">
                            <p>CHOOSE LANGUAGE</p>
                            <div className="language-dropdown">
                                <span className="language-text">ENGLISH</span>
                                <span className="arrow">▼</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>

    )
}

export default Footer
