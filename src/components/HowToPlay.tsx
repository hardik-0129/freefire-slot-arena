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
                            <li>You can join a tournament whatever works for you (modes: Top Position, Most Kills or Damage).</li>
                            <li>Top 10 winners get prizes up to $50.</li>
                        </ul>

                        <h3 className="subheading">Duo Mode:</h3>
                        <ul className="list">
                            <li>Play PUBG with your friend and you both can win cash prizes.</li>
                            <li>Just invite your teammate and join 100-team tournament.</li>
                            <li>The top prize is $100. It’s possible to join 3 tournaments at once.</li>
                        </ul>
                    </div>
                </div>

                <div className="section">
                    <div className="text-container">
                        <h2 className="subheading">What To Do</h2>

                        <h3 className="subheading">Registration</h3>
                        <ul className="list">
                            <li>Create a free account</li>
                            <li>Connect your Steam account or play PUBG via consoles (PS4, Xbox One)</li>
                            <li>That’s all! You’re ready to play.</li>
                        </ul>

                        <h3 className="subheading">Additional Information</h3>
                        <ul className="list">
                            <li>FREE PUBG tournaments are available 24/7.</li>
                            <li>We support both SOLO and DUO modes.</li>
                            <li>When competing, always try to do your best/get more kills.</li>
                            <li>The top 10 winners get prizes up to $50.</li>
                            <li>Your chances to win are 1 to 10 (places 6–10 win $1).</li>
                            <li>There is no limit; participate in PUBG tournaments as often as you want.</li>
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
                            Once you win your first tournament, you can request your earnings to be withdrawn from your Battlemania account.
                        </p>
                        <p>It’s also possible to keep playing to get bigger prizes.</p>
                        <p>The following payment systems are supported on our website:</p>
                    </div>
                </div>
                </div>
            </div>
        </>
    )
}

export default HowToPlay
