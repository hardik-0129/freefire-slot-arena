import React from 'react'
import { Header } from '@/components/Header'
import Footer from '@/components/Footer'

const sectionStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: 24
}

const titleStyle: React.CSSProperties = { marginTop: 0, marginBottom: 10, fontSize: 28 }
const h3Style: React.CSSProperties = { marginTop: 0, marginBottom: 10, fontSize: 20 }
const textStyle: React.CSSProperties = { margin: 0, color: '#000', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }
const listStyle: React.CSSProperties = { margin: 0, color: '#000', lineHeight: 1.8, paddingLeft: 18 }

const containerStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: '0 auto',
  padding: '24px 16px'
}

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  border: '1px solid #000',
  borderRadius: 9999,
  padding: '6px 12px',
  fontSize: 12,
  letterSpacing: 0.4
}

const dotStyle: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 9999,
  background: '#000'
}

const pageTitleStyle: React.CSSProperties = {
  marginTop: 12,
  marginBottom: 12,
  fontSize: 32,
  lineHeight: 1.2,
  color: '#000'
}

const subStyle: React.CSSProperties = { margin: 0, color: '#000' }

const Terms: React.FC = () => {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 24, paddingBottom: 24 }}>
        <section>
          <div style={containerStyle}>
            <div style={badgeStyle}><span style={dotStyle} />TERMS & CONDITIONS</div>
            <h1 style={pageTitleStyle}>Terms & Conditions</h1>
            <p style={subStyle}>Effective Date: <strong>01/10/2025</strong></p>
          </div>
        </section>

        <section>
          <div style={containerStyle}>
            <div style={sectionStyle}>
              <h2 style={titleStyle}>Welcome</h2>
              <p style={textStyle}>
                Welcome to Alpha Lions Esports (esports.alphalions.io). These Terms & Conditions ("Terms") govern your
                use of our website, esports tournaments, Alpha Coin system, and related services. By registering,
                accessing, or participating, you agree to these Terms. If you do not agree, please stop using our
                services.
              </p>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>1. Eligibility</h2>
              <ul style={listStyle}>
                <li>You must be at least 18 years old to participate in paid tournaments.</li>
                <li>Users under 18 may participate only with parental/guardian consent.</li>
                <li>You must provide accurate details (name, Free Fire UID, email, phone number, etc.). False or duplicate accounts may be suspended.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>2. Account Registration</h2>
              <p style={textStyle}>When you create an account, you agree to:</p>
              <ul style={listStyle}>
                <li>Provide accurate and complete information.</li>
                <li>Keep your login credentials secure.</li>
                <li>Be responsible for all activities under your account.</li>
                <li>Not create multiple accounts to exploit rewards, coins, or tournaments.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>3. Fair Play & Cheating Policy</h2>
              <p style={textStyle}>We strictly prohibit cheating, unfair gameplay, or misuse of the platform, including:</p>
              <ul style={listStyle}>
                <li>Use of hacks, scripts, mods, unauthorized tools, or emulators (if not allowed).</li>
                <li>Fake match results, match-fixing, or teaming with opponents.</li>
                <li>Impersonating other players or using false Free Fire UIDs.</li>
                <li>Offensive usernames, abusive behavior, or harassment.</li>
              </ul>
              <p style={{ ...textStyle, marginTop: 8 }}>Violation may result in suspension, banning, or forfeiture of winnings and Alpha Coins.</p>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>4. Tournaments & Matches</h2>
              <ul style={listStyle}>
                <li>We conduct both free and paid esports tournaments.</li>
                <li>Entry fees, if applicable, must be paid before joining.</li>
                <li>Tournament schedules, rules, and rewards will be displayed on the website.</li>
                <li>Our decision regarding winners, disputes, or disqualifications is final and binding.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>5. Alpha Coins & Rewards</h2>
              <ul style={listStyle}>
                <li>Winners will receive rewards in Alpha Coins.</li>
                <li>Alpha Coins can be used for entry fees, withdrawals, or other services on our platform.</li>
                <li>Alpha Coins have no real-world monetary value outside our platform.</li>
                <li>Any attempt to exploit or manipulate the Alpha Coin system may result in account suspension.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>6. Deposits & Withdrawals</h2>
              <ul style={listStyle}>
                <li>Users can add money using approved payment gateways.</li>
                <li>Withdrawals must be requested via our platform and may take [X working days] to process.</li>
                <li>Identity verification may be required before processing withdrawals.</li>
                <li>We are not responsible for delays caused by third-party payment providers.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>7. Refund Policy</h2>
              <ul style={listStyle}>
                <li>Entry fees and deposits are non-refundable, except in cases of technical error or tournament cancellation by us.</li>
                <li>If you are disqualified for violating rules, you will not be eligible for a refund.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>8. Limitation of Liability</h2>
              <ul style={listStyle}>
                <li>We are not responsible for internet issues, device failures, or disruptions on your end.</li>
                <li>We do not guarantee continuous, error-free access to the platform.</li>
                <li>Our liability is limited to the amount you paid for the specific tournament or service.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>9. User Conduct</h2>
              <p style={textStyle}>By using our platform, you agree not to:</p>
              <ul style={listStyle}>
                <li>Harass, abuse, or threaten other players.</li>
                <li>Upload or share offensive, illegal, or harmful content.</li>
                <li>Engage in fraudulent activity, impersonation, or spam.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>10. Account Termination</h2>
              <ul style={listStyle}>
                <li>We may suspend or terminate accounts for cheating or unfair play.</li>
                <li>Fraudulent withdrawals or transactions.</li>
                <li>Violation of these Terms or illegal/abusive activity.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>11. Intellectual Property</h2>
              <p style={textStyle}>
                All content, branding, and software on esports.alphalions.io are owned by Alpha Lions Esports. You may
                not copy, distribute, or use them without permission.
              </p>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>12. Underage Users</h2>
              <p style={textStyle}>
                Our services are not intended for children under 13 years. If you are between 13–18 years, you must use
                the platform with parental/guardian consent.
              </p>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>13. Dispute Resolution</h2>
              <ul style={listStyle}>
                <li>In case of disputes, first contact our support team.</li>
                <li>Our decision in tournament disputes or winnings is final.</li>
                <li>Legal disputes are governed by the laws of India, with jurisdiction in [Your City/State].</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>14. Changes to Terms</h2>
              <p style={textStyle}>
                We may update these Terms at any time. Continued use of our platform means you accept the updated Terms.
              </p>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>15. Contact Us</h2>
              <p style={textStyle}>
                {/* Grievance Officer: [Your Officer Name] */}
                Email: support@alphalions.io
                {'\n'}Website: https://esports.alphalions.io
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Terms


