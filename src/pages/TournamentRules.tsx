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

const TournamentRules: React.FC = () => {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 24, paddingBottom: 24 }}>
        <section>
          <div style={containerStyle}>
            <div style={badgeStyle}><span style={dotStyle} />TOURNAMENT RULES</div>
            <h1 style={pageTitleStyle}>Tournament Rules – Alpha Lions Esports</h1>
            <p style={subStyle}>Effective Date: <strong>01/10/2025</strong></p>
          </div>
        </section>

        <section>
          <div style={containerStyle}>
            <div style={sectionStyle}>
              <h2 style={titleStyle}>Introduction</h2>
              <p style={textStyle}>
                These Tournament Rules ("Rules") govern participation in tournaments hosted on esports.alphalions.io.
                By registering or joining any tournament, you agree to abide by these Rules along with our Terms &
                Conditions and Privacy Policy.
              </p>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>1. Eligibility</h2>
              <ul style={listStyle}>
                <li>Players must have a valid account on esports.alphalions.io.</li>
                <li>Only one account per player is allowed. Multiple or fake accounts may result in disqualification.</li>
                <li>Paid tournaments are open only to players 18 years or older (or with parental/guardian consent if under 18).</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>2. Registration & Participation</h2>
              <ul style={listStyle}>
                <li>Players must register with correct details (Name, Free Fire UID, Email, Phone).</li>
                <li>Tournament entry fees (if applicable) must be paid in advance.</li>
                <li>Lobby details will be shared on the platform, email, or WhatsApp (as announced per event).</li>
                <li>Players must join the lobby on time. Late entries may not be allowed.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>3. Match Rules</h2>
              <ul style={listStyle}>
                <li>Each match will follow the official Free Fire / game mode rules announced for the tournament.</li>
                <li>Players must play on their own account and UID.</li>
                <li>Use of hacks, emulators (if not permitted), scripts, or third-party tools is strictly prohibited.</li>
                <li>Players must not team up outside of permitted squad/duo formats.</li>
                <li>Any intentional disconnection, AFK behavior, or match manipulation may result in disqualification.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>4. Fair Play & Conduct</h2>
              <ul style={listStyle}>
                <li>No abusive, offensive, racist, or sexist behavior is tolerated in chats, nicknames, or communications.</li>
                <li>Nicknames or profile photos that are abusive, offensive, or impersonating Alpha Lions/officials may result in suspension.</li>
                <li>Match-fixing, collusion, or exchanging kills to gain unfair advantage is prohibited.</li>
                <li>Alpha Lions admins have the final authority to disqualify players for misconduct.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>5. Scoring & Results</h2>
              <ul style={listStyle}>
                <li>Tournament scoring will follow the points system announced before each tournament.</li>
                <li>In case of disputes about scores, players must submit proof (screenshot/video) within [X] minutes of match completion.</li>
                <li>Admin decisions regarding final scores and winners are binding and non-contestable.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>6. Rewards & Alpha Coins</h2>
              <ul style={listStyle}>
                <li>Winners will be awarded Alpha Coins or cash prizes (as per the tournament announcement).</li>
                <li>Alpha Coins can be used for entry fees, redeemed, or withdrawn as per platform rules.</li>
                <li>Any attempt to manipulate or exploit the reward system may result in forfeiture of prizes and account ban.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>7. Disqualification</h2>
              <p style={textStyle}>A player/team may be disqualified if:</p>
              <ul style={listStyle}>
                <li>They provide false details during registration.</li>
                <li>They are found using hacks, mods, or unauthorized tools.</li>
                <li>They do not join the lobby on time.</li>
                <li>They engage in toxic behavior or harassment.</li>
                <li>They collude or manipulate match results.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>8. Refund Policy</h2>
              <ul style={listStyle}>
                <li>Entry fees are non-refundable, except in cases of technical errors or tournament cancellation by Alpha Lions.</li>
                <li>Disqualified players are not eligible for refunds.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>9. Dispute Resolution</h2>
              <ul style={listStyle}>
                <li>Players must raise disputes via support@alphalions.io within [X] hours of match completion.</li>
                <li>Disputes without valid evidence will not be considered.</li>
                <li>The decision of the Alpha Lions Admin Team is final in all cases.</li>
              </ul>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>Penalty Criteria for Misconduct</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #000', padding: 10, textAlign: 'left' }}>Misconduct</th>
                      <th style={{ border: '1px solid #000', padding: 10, textAlign: 'left' }}>First Offense</th>
                      <th style={{ border: '1px solid #000', padding: 10, textAlign: 'left' }}>Repeated/Severe Offense</th>
                      <th style={{ border: '1px solid #000', padding: 10, textAlign: 'left' }}>Penalty</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Use of hacks, cheats, mods, scripts, unauthorized tools</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Immediate disqualification</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Permanent ban</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Account ban + forfeiture of Alpha Coins & prizes</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Fake account, false Free Fire UID, multiple accounts</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Disqualification</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Permanent ban</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Loss of entry + winnings</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Teaming with opponents (outside allowed squad/duo)</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Disqualification from match</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Tournament ban</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Removal from leaderboard</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Match-fixing / manipulating results</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Immediate disqualification</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Permanent ban</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Forfeiture of rewards + account ban</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Offensive nickname, abusive chat, harassment</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Warning + temporary suspension (up to 7 days)</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Ban from future tournaments</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Loss of entry fee</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Inappropriate profile photo (offensive/impersonation)</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Immediate profile reset</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>30-day ban</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Removal of account photo</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: 10 }}>AFK / not playing fairly in match</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Match points deducted</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Disqualification from tournament</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Loss of rewards</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Not joining lobby on time</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Marked as “No Show” (match forfeited)</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Repeated no-shows → suspension</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>No refund of entry fee</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Exploiting bugs or glitches in-game</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Disqualification from match</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Permanent ban</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Forfeiture of Alpha Coins & prizes</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Abusing refund/withdrawal system</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Suspension of withdrawals</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Permanent ban</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Loss of account balance</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Sharing personal info of other players</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Disqualification + warning</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Permanent ban</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Account deletion</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Toxic behavior towards admins / spreading false info</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Warning</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>Tournament ban / permanent ban</td>
                      <td style={{ border: '1px solid #000', padding: 10 }}>No refunds + account review</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ height: 16 }} />

            <div style={sectionStyle}>
              <h2 style={titleStyle}>10. Changes to Rules</h2>
              <p style={textStyle}>
                Alpha Lions reserves the right to update these Tournament Rules at any time. Players will be notified of
                major changes through the website or official communication channels.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default TournamentRules


