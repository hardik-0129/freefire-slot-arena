import Footer from '@/components/Footer';
import { Header } from '@/components/Header';
import React from 'react';
import '../components/css/About.css';

const About: React.FC = () => {
  return (
    <>
      <Header />
      <main className="about-root">
        {/* Hero */}
        <section className="about-hero">
          <div className="about-container">
            <div className="about-badge">
              <div className="about-badge-dot" />
              <span>ABOUT US</span>
            </div>
            <h1 className="about-title">
              Building the Alpha Lions universe for competitive gamers and collectors
            </h1>
            <p className="about-subtitle">
              Alpha Lions is where high-signal competition meets culture. We craft fair, thrilling esports experiences and
              pair them with an evolving NFT-driven membership that unlocks status, access, and utilities across our platform.
              Our mission is simple: empower players, celebrate creators, and grow a world-class community that roars together.
            </p>
          </div>
        </section>

        {/* Content Grid */}
        <section className="about-content">
          <div className="about-container">
            <div className="about-grid">
              <div className="about-col-left">
                <div style={{
                  background: '#0b0b0b',
                  border: '1px solid #1f2937',
                  borderRadius: 16,
                  padding: 24
                }}>
                  <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 28 }}>Our Vision</h2>
                  <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>
                    We believe in the power of competitive play to bring people together. By blending top-tier tournaments with
                    community-first ownership, Alpha Lions is building a next-generation hub where your skill, contribution,
                    and commitment are recognized — on and off the battlefield.
                  </p>
                </div>

                <div style={{ height: 16 }} />

                <div style={{
                  background: '#0b0b0b',
                  border: '1px solid #1f2937',
                  borderRadius: 16,
                  padding: 24
                }}>
                  <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 28 }}>What We Do</h2>
                  <ul style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.8 }}>
                    <li>Host curated tournaments with transparent rules and real rewards</li>
                    <li>Deliver utility-focused NFT membership for status and access</li>
                    <li>Build tools for players, creators, and partners to grow together</li>
                    <li>Invest in long-term community programs and collaborations</li>
                  </ul>
                </div>
              </div>

              <div className="about-col-right">
                <div style={{
                  background: 'linear-gradient(180deg, rgba(255,139,0,0.08), rgba(255,139,0,0.02))',
                  border: '1px solid #1f2937',
                  borderRadius: 16,
                  padding: 24
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 24 }}>Core Principles</h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ background: '#0e0e0e', border: '1px solid #1f2937', borderRadius: 12, padding: 14 }}>
                      <strong>Fair Play</strong>
                      <div style={{ color: '#94a3b8', marginTop: '10px' }}>Anti-cheat policies, transparent systems, and integrity by design.</div>
                    </div>
                    <div style={{ background: '#0e0e0e', border: '1px solid #1f2937', borderRadius: 12, padding: 14 }}>
                      <strong>Community First</strong>
                      <div style={{ color: '#94a3b8', marginTop: '10px' }}>We build with and for our holders, players, and partners.</div>
                    </div>
                    <div style={{ background: '#0e0e0e', border: '1px solid #1f2937', borderRadius: 12, padding: 14 }}>
                      <strong>Craft & Culture</strong>
                      <div style={{ color: '#94a3b8', marginTop: '10px' }}>Premium art direction, brand consistency, and meaningful experiences.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="about-cta">
              <div className="about-cta-title">Join the Pride</div>
              <div className="about-cta-actions">
                <a className="btn" href="/task" style={{ background: '#000', borderColor: 'rgba(0,0,0,0.5)' }}>Explore Lions NFT</a>
                <a className="btn" href="/tournament" style={{ background: '#111', borderColor: 'rgba(0,0,0,0.5)' }}>Browse Tournaments</a>
                <a className="btn" href="/contact" style={{ background: '#111', borderColor: 'rgba(0,0,0,0.5)' }}>Contact Team</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default About;


