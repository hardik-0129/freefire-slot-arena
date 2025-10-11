import React, { useState } from "react";
import "../components/css/Features.css";

const Features = () => {
  const [activeTab, setActiveTab] = useState("contest");

  const renderContent = () => {
    switch (activeTab) {
      case "join":
        return (
          <div className="features-content">
            <h3>Join Contest</h3>
            <p>
              GaribAdda Application Gives You A Chance To Show Your Gaming Skills And In Return You Get Real Cash, So Don't Delay And Join Clash Adda Today
            </p>
            <div className="feature-details">
              <div className="detail-item">
                <div className="detail-icon">🎁</div>
                <h4>Free Contests</h4>
                <p>You can join any contest of your liking and of your desired time for free as a launch offer.</p>
              </div>
              <div className="detail-item">
                <div className="detail-icon">💰</div>
                <h4>Cash Prizes</h4>
                <p>As a true core gamer you will be competing some of the best players of india and also can win exiting cash prizes.</p>
              </div>
              <div className="detail-item">
                <div className="detail-icon">👤</div>
                <h4>Gamer Profile</h4>
                <p>You'll be given a gamer profile where you can showcase your skills and stats. Be popular in rising gaming community of india.</p>
              </div>
              <div className="detail-item">
                <div className="detail-icon">🏆</div>
                <h4>Leader Boards</h4>
                <p>There will be leader boards of all the pro players to see who got the guts and skills at the same time.</p>
              </div>
              <div className="detail-item">
                <div className="detail-icon">⚖️</div>
                <h4>Fair Play</h4>
                <p>With the respect of gaming community we have made some rules for the players. No Emulators, No Hackers.</p>
              </div>
              <div className="detail-item">
                <div className="detail-icon">📤</div>
                <h4>Share & Earn</h4>
                <p>You can Refer Other gamers to play on platform. You will get refer bonus of it.</p>
              </div>
            </div>
          </div>
        );
      case "participates":
        return (
          <div className="features-content">
            <h3>Participates</h3>
            <p>
              Various gaming modes and contest types available for all skill levels. Join tournaments that match your gaming style and compete with players from across India.
            </p>
            <div className="feature-details">
              <div className="detail-item">
                <div className="detail-icon">🔍</div>
                <h4>Various Modes</h4>
                <p>We will post daily new contests based on various modes such as Squad, Duo, Solo and also FPP and TPP matches.</p>
              </div>
              <div className="detail-item">
                <div className="detail-icon">⚠️</div>
                <h4>Strict Rules</h4>
                <p>Anytype of misconduct or cheating will not be allowed in all the games so you don't have to worry about fair play.</p>
              </div>
              <div className="detail-item">
                <div className="detail-icon">🚫</div>
                <h4>No Restrictions!</h4>
                <p>You can play as many free games as you want during the launch offer, So make sure you win that juicy prizes.</p>
              </div>
              <div className="detail-item">
                <div className="detail-icon">💀</div>
                <h4>Kill Prizes</h4>
                <p>In kill prizes match you will get prizes of decided per kill prize at the time of declaration.</p>
              </div>
            </div>
          </div>
        );
      case "contest":
      default:
        return (
          <div className="features-content">
            <h3>Contest Results</h3>
            <p>
              Fast and transparent results system ensures you get your winnings quickly and efficiently. Track your performance and earnings in real-time.
            </p>
            <div className="feature-details">
              <div className="detail-item">
                <div className="detail-icon">🎁</div>
                <h4>Big Prizes</h4>
                <p>All Winning Prizes will be given in just 30 minutes of match completion and you can also make withdraw requests of prize whenever you want.</p>
              </div>
              <div className="detail-item">
                <div className="detail-icon">❓</div>
                <h4>Community Support</h4>
                <p>We also provide community support to our players via email and WhatsApp too for better experience of tournaments incase anything goes wrong!</p>
              </div>
              <div className="detail-item">
                <div className="detail-icon">🔔</div>
                <h4>Notification</h4>
                <p>You'll be notified by the app once the results are available. You'll be also notified about the winnings of yours</p>
              </div>
              <div className="detail-item">
                <div className="detail-icon">💸</div>
                <h4>Fast Withdraw</h4>
                <p>We will process withdrawal request in 24 hours of submission.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <section className="features-section">
      <div className="features-header">
        <h2>FEATURES</h2>
        <p>
          Garib Adda Application Will Give You Stage To Play eSports On <br />
          Your Preferred Portable Games.
        </p>
      </div>

      {/* Tabs */}
      <div className="features-tabs">
        <span
          className={activeTab === "join" ? "active" : ""}
          onClick={() => setActiveTab("join")}
        >
          JOIN CONTEST
        </span>
        <span
          className={activeTab === "participates" ? "active" : ""}
          onClick={() => setActiveTab("participates")}
        >
          PARTICIPATES
        </span>
        <span
          className={activeTab === "contest" ? "active" : ""}
          onClick={() => setActiveTab("contest")}
        >
          CONTEST RESULTS
        </span>
      </div>

      {/* Tab Content */}
      {renderContent()}

    </section>
  );
};

export default Features;
