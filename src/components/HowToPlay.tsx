import React from 'react'
import './css/HowToPlay.css'

const HowToPlay = () => {
    return (
        <>
            <div className="how-to-play-container">
            <h1 className="title">HOW TO PLAY</h1>
            <p className="subtitle">Begin Your Game Now</p>
                <div className="container">
                <div className="section">
                    <div className="image-container">
                        <img src="image1.png" alt="Game" className="image" />
                    </div>
                    <div className="text-container">
                        <h2 className="subheading">How To Play</h2>
                        <h3 className="subheading">Solo Mode:</h3>
                        <ul className="list">
                            <li>You can join a tournament whatever works for you (modes: Top Position, Most Kills).</li>
                            <li>Get Price if you kill someone and get up to 50INR.</li>
                            <li>Top 3 winners get prizes up to 2000INR.</li>
                        </ul>

                        <h3 className="subheading">Duo Mode:</h3>
                        <ul className="list">
                            <li>Play PUBG with your friend and you both can win cash prizes.</li>
                            <li>Just invite your teammate and join 100-team tournament.</li>
                            <li>The top prize is up to 2000INR. It’s possible to join 3 tournaments at once.</li>
                        </ul>
                    </div>
                </div>

                <div className="section">
                    <div className="text-container">
                        <h2 className="subheading">What To Do</h2>

                        <h3 className="subheading">Registration</h3>
                        <ul className="list">
                            <li>Create a free account</li>
                            <li>Book your slote and play Free fire and BGMI on Mobile/Tablet</li>
                            <li>That’s all! You’re ready to play.</li>
                        </ul>

                        <h3 className="subheading">Additional Information</h3>
                        <ul className="list">
                            <li>FREE BGMI and Free fire tournaments are available 12hr.</li>
                            <li>We support SOLO, DUO and SQUAD modes.</li>
                            <li>When competing, always try to do your best/get more kills.</li>
                            <li>The top 3 winners get prizes up to 5000INR.</li>
                            <li>There is no limit; participate in BGMI and Free fire tournaments as often as you want.</li>
                        </ul>
                    </div>
                    <div className="image-container">
                        <img src="image2.png" alt="Info" className="image" />
                    </div>
                </div>

                <div className="section">
                    <div className="image-container">
                        <img src="image3.png" alt="Prizes" className="image" />
                    </div>
                    <div className="text-container">
                        <h2 className="subheading">Money Prizes</h2>
                        <p>
                            Once you win your first tournament, you can request your earnings to be withdrawn from your Alpha Lions Esports account.
                        </p>
                        <p>It’s also possible to keep playing to get bigger prizes.</p>
                        <p>The following payment systems are supported on our website: UPI, Bank Transfer, Paytm, Google Pay and PhonePe.</p>
                    </div>
                </div>
                </div>
            </div>
        </>
    )
}

export default HowToPlay
