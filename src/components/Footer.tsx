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
                                <a href="https://x.com/AlphaLionsArena" target="_blank" rel="noopener noreferrer">
                                    <img src="/assets/vector/twitter.png" alt="Twitter" />
                                </a>
                                <a href="https://www.instagram.com/alphalionesport/" target="_blank" rel="noopener noreferrer">
                                    <img src="/assets/vector/Instagram.png" alt="Instagram" />
                                </a>
                                <a href="https://discord.gg/d8jM7P3SQj" target="_blank" rel="noopener noreferrer">
                                    <img src="/assets/vector/discord.png" alt="Discord" />
                                </a>
                                <a href="https://www.youtube.com/@AlphaLionsEsport" target="_blank" rel="noopener noreferrer">
                                    <img src="/assets/vector/youtube.png" alt="YouTube" />
                                </a>
                            </div>
                        </div>

                        {/* <div className="language-section">
                            <p>CHOOSE LANGUAGE</p>
                            <div className="language-dropdown">
                                <span className="language-text">ENGLISH</span>
                                <span className="arrow">▼</span>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </footer>

    )
}

export default Footer
