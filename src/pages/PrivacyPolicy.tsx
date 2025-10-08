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

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 24, paddingBottom: 24 }}>
        <section>
          <div style={containerStyle}>
            <div style={badgeStyle}><span style={dotStyle} />PRIVACY POLICY</div>
            <h1 style={pageTitleStyle}>Privacy Policy</h1>
            <p style={subStyle}>Effective Date: <strong>01/10/2025</strong></p>
          </div>
        </section>

        <section>
          <div style={containerStyle}>
            <div style={sectionStyle}>
              <h2 style={titleStyle}>1. Introduction</h2>
              <p style={textStyle}>
                Alpha Lions Esports ("Company", "we", "our", or "us") respects your privacy and is committed to
                protecting the personal information you share with us. This Privacy Policy explains how we collect,
                use, store, and protect your data when you use our website (https://esports.alphalions.io), participate
                in esports tournaments, deposit or withdraw money, or use Alpha Coins. By using our platform, you agree
                to the terms of this Privacy Policy. If you do not agree, please discontinue use of our services.
              </p>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>2. Information We Collect</h2>
              <h3 style={h3Style}>Personal Information</h3>
              <ul style={listStyle}>
                <li>Name</li>
                <li>Email Address</li>
                <li>Phone Number</li>
                <li>Password (encrypted)</li>
                <li>Profile Photo</li>
              </ul>
              <h3 style={{ ...h3Style, marginTop: 16 }}>Gaming Information</h3>
              <ul style={listStyle}>
                <li>Free Fire UID (and other in-game IDs if applicable)</li>
              </ul>
              <h3 style={{ ...h3Style, marginTop: 16 }}>Financial and Transaction Information</h3>
              <ul style={listStyle}>
                <li>Deposit/withdrawal details processed via third-party payment gateways (we do not store card numbers)</li>
                <li>Alpha Coins transactions, winnings, and balance</li>
              </ul>
              <h3 style={{ ...h3Style, marginTop: 16 }}>Usage and Technical Data</h3>
              <ul style={listStyle}>
                <li>Device, browser, IP address, and approximate location</li>
                <li>Log data (pages visited, actions taken, timestamps)</li>
                <li>Cookies and analytics identifiers</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>3. How We Use Your Information</h2>
              <ul style={listStyle}>
                <li>Register and manage your account</li>
                <li>Organize paid and free esports tournaments</li>
                <li>Verify your identity and prevent fraudulent activity</li>
                <li>Provide winnings in Alpha Coins or other rewards</li>
                <li>Enable secure deposits and withdrawals</li>
                <li>Communicate important updates, tournament details, or promotions</li>
                <li>Improve our services, user experience, and platform security</li>
                <li>Comply with legal, regulatory, and tax obligations</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>4. Sharing Your Information</h2>
              <p style={textStyle}>
                We do not sell or rent your personal information. We may share limited information as needed with:
              </p>
              <ul style={listStyle}>
                <li><strong>Service Providers</strong>: payment gateways, hosting, analytics, customer support</li>
                <li><strong>Legal and Compliance</strong>: where required by law, regulation, or court order</li>
                <li><strong>Fraud Prevention and Security</strong>: to protect the integrity of our platform and users</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>5. Security of Information</h2>
              <p style={textStyle}>
                We use encryption, firewalls, access controls, and secure servers to protect your data. Passwords are
                stored in encrypted form and cannot be retrieved in plain text. However, no system is 100% secure, and
                we cannot guarantee absolute security.
              </p>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>6. Data Retention</h2>
              <p style={textStyle}>
                We retain your information while your account is active or as needed to provide services. If you delete
                your account, we may retain limited information for legal, regulatory, accounting, dispute resolution,
                or fraud-prevention purposes.
              </p>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>7. Underage Users</h2>
              <p style={textStyle}>
                Our services are intended for users aged 18 or older. If you are under 18, you may only use our platform
                with parental or guardian consent. If we discover an underage user without consent, we may suspend or
                delete the account.
              </p>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>8. Your Rights</h2>
              <ul style={listStyle}>
                <li>Access and update your account details</li>
                <li>Request deletion of your personal information (subject to legal requirements)</li>
                <li>Withdraw consent for marketing communications</li>
                <li>Object to or restrict certain processing in accordance with applicable laws</li>
              </ul>
              <p style={{ ...textStyle, marginTop: 8 }}>
                To exercise rights, contact us using the details below. We may need to verify your identity before
                completing certain requests.
              </p>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>9. Cookies and Tracking</h2>
              <p style={textStyle}>
                We use cookies and analytics tools to enhance user experience, analyze usage, and show relevant content.
                You can disable cookies in your browser settings, but some features may not function properly.
              </p>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>10. International Data Transfers</h2>
              <p style={textStyle}>
                Your information may be processed in countries other than where you reside. Where required, we implement
                appropriate safeguards to protect your information during such transfers.
              </p>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>11. Changes to This Policy</h2>
              <p style={textStyle}>
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with the
                updated Effective Date. Continued use of our services means you accept the revised policy.
              </p>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>12. Contact Us</h2>
              <p style={textStyle}>
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

export default PrivacyPolicy


