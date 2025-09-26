import React, { useRef, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {  Socket } from 'socket.io-client';
import Footer from '@/components/Footer';
import { Header } from '@/components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../components/css/SelectSlot.css';
import '../components/css/DetailsPage.css';
import AboutMatch from '@/components/AboutMatch';

interface Slot {
  _id: string;
  gameMode?: string;
  entryFee?: number;
  maxBookings?: number;
  rules?: string;
  specialRules?: string;
  status?: string;
  streamLink?: string;
  tournamentName?: string;
  hostName?: string;
  tournamentRules?: {
    accountNameVerification?: boolean;
    airdropType?: string;
    characterSkill?: string;
    gunAttributes?: string;
    limitedAmmo?: string;
    maxHeadshotRate?: number;
    minimumLevel?: number;
    mustRecordGameplay?: boolean;
    onlyMobileAllowed?: boolean;
    penaltySystem?: {
      violatingRules?: string;
      noRewards?: boolean;
      permanentBan?: boolean;
    };
    prohibitedActivities?: string[];
    recordFromJoining?: boolean;
    roomIdPasswordTime?: number;
    screenRecordingRequired?: boolean;
    teamRegistrationRules?: string;
  };
  [key: string]: any;
}

interface DecodedToken {
  userId: string;
  [key: string]: any;
}

const SelectSlot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const slotData: Slot | null = location.state?.slotData || null;
  // Ensure page opens at the top on navigation to this screen
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (_) {
      window.scrollTo(0, 0);
    }
  }, []);
  // --- SOCKET.IO LOGIC (inside component) ---
  const socketRef = useRef<Socket | null>(null);
  const [lockedPositions, setLockedPositions] = useState<{ [team: string]: string[] }>({});
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPositions, setSelectedPositions] = useState<{ [key: string]: string[] }>({});
  const [playerNames, setPlayerNames] = useState<{ [key: string]: string }>({});
  const [bookedPositions, setBookedPositions] = useState<{ [key: string]: string[] }>({});
  const [isJoining, setIsJoining] = useState(false);

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setWalletBalance(0);
        setIsLoading(false);
        return;
      }

      // Decode JWT token to get user ID
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const userId = decoded.userId;

        if (!userId) {
          console.error('No userId found in decoded token');
          setWalletBalance(0);
          setIsLoading(false);
          return;
        }

        // Fetch wallet balance using user ID
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/wallet/balance?id=${userId}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();

          // Try different possible response formats
          let balance = 0;
          if (data.wallet !== undefined) {
            balance = data.wallet;
          } else if (data.balance !== undefined) {
            balance = data.balance;
          } else if (data.amount !== undefined) {
            balance = data.amount;
          } else if (typeof data === 'number') {
            balance = data;
          }

          setWalletBalance(balance);
        } else {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          setWalletBalance(0);
        }
      } catch (decodeError) {
        console.error('Error decoding JWT token:', decodeError);
        setWalletBalance(0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch booked positions for this slot
  const fetchBookedPositions = async () => {
    if (!slotData?._id) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/slot/${slotData._id}`);
      if (response.ok) {
        const bookings = await response.json();
        const booked: { [key: string]: string[] } = {};
        // Map numbers to letters for positions
        const posMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };

        bookings.data.forEach((booking: any) => {
          if (booking.selectedPositions) {
            Object.entries(booking.selectedPositions).forEach(([teamKey, arr]: [string, any]) => {
              // SOLO MODE: teamA:[n] => Team n, position A
              if (gameMode === 'solo' && teamKey === 'teamA') {
                arr.forEach((pos: any) => {
                  const teamNum = Number(pos);
                  const uiTeamKey = `Team ${teamNum}`;
                  if (!booked[uiTeamKey]) booked[uiTeamKey] = [];
                  if (!booked[uiTeamKey].includes('A')) booked[uiTeamKey].push('A');
                });
                return;
              }
              // DUO/SQUAD: teamA:[n], teamB:[n], ...
              let teamNum = null;
              let uiTeamKey = teamKey;
              // Try to extract team number from key
              const numMatch = teamKey.match(/team(\d+)/i);
              if (numMatch) {
                teamNum = parseInt(numMatch[1], 10);
                uiTeamKey = `Team ${teamNum}`;
              } else {
                // Try to extract from 'teamA', 'teamB', etc.
                const letterMatch = teamKey.match(/team([a-z])/i);
                if (letterMatch) {
                  teamNum = letterMatch[1].toLowerCase().charCodeAt(0) - 96;
                  uiTeamKey = `Team ${teamNum}`;
                }
              }
              // Fallback: if already 'Team 1', 'Team 2', etc.
              if (/^Team \d+$/i.test(teamKey)) {
                uiTeamKey = teamKey;
              }

              // For each position, map to letter (A/B/C/D) for UI
              arr.forEach((pos: any) => {
                const posStr = String(pos);
                let posLetter = posMap[posStr] || posStr;
                if (!booked[uiTeamKey]) booked[uiTeamKey] = [];
                if (!booked[uiTeamKey].includes(posLetter)) booked[uiTeamKey].push(posLetter);
              });
            });
          }
        });

        setBookedPositions(booked);
      } else {
        console.error('Failed to fetch booked positions:', response.status);
      }
    } catch (error) {
      console.error('Error fetching booked positions:', error);
    }
  };

  useEffect(() => {
    fetchWalletBalance();
    fetchBookedPositions();
  }, [slotData]);

  // Handle position selection
  const handlePositionSelect = (teamName: string, position: string, isSelected: boolean) => {

    // Check if position is already booked or locked by another user
    const isBooked = bookedPositions[teamName]?.includes(position);
    const isLocked = lockedPositions[teamName]?.includes(position);
    if (isBooked || isLocked) {
      return; // Don't allow selection of booked or locked positions
    }

    // Emit lock/unlock event to socket
    if (socketRef.current) {
      if (isSelected) {
        socketRef.current.emit('lock-position', {
          slotId: slotData?._id,
          team: teamName,
          position,
        });
      } else {
        socketRef.current.emit('unlock-position', {
          slotId: slotData?._id,
          team: teamName,
          position,
        });
      }
    }

    setSelectedPositions(prev => {
      const teamPositions = prev[teamName] || [];
      if (isSelected) {
        return {
          ...prev,
          [teamName]: [...teamPositions, position]
        };
      } else {
        // Clean up the selected positions
        const newTeamPositions = teamPositions.filter(p => p !== position);
        const newSelectedPositions = {
          ...prev,
          [teamName]: newTeamPositions
        };

        // If no positions left for this team, remove the team entry
        if (newTeamPositions.length === 0) {
          delete newSelectedPositions[teamName];
        }

        return newSelectedPositions;
      }
    });


    // Clean up player names when position is deselected
    if (!isSelected) {
      const key = `${teamName}-${position}`;
      setPlayerNames(prev => {
        const newPlayerNames = { ...prev };
        delete newPlayerNames[key];
        return newPlayerNames;
      });
    }
  };

  // Handle player name input
  const handlePlayerNameChange = (key: string, value: string) => {
    // Check for duplicate names (case-insensitive)
    const trimmedValue = value.trim();
    if (trimmedValue !== '') {
      const existingNames = Object.values(playerNames).map(name => name.trim().toLowerCase());
      const isDuplicate = existingNames.includes(trimmedValue.toLowerCase());
      
      if (isDuplicate) {
        toast.error('This Free Fire game name is already used! Please enter a different name.');
        return; // Don't update the state if it's a duplicate
      }
    }
    
    setPlayerNames(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle cancel button click
  const handleCancel = () => {
    navigate('/');
  };

  // Join match API call
  const handleJoinMatch = async () => {
    if (!slotData) {
      alert('No slot data available');
      return;
    }

    if (!hasSufficientBalance && normalizedGameMode !== 'free matches') {
      alert('Insufficient balance to join this match');
      return;
    }

    // Validate that at least one position is selected
    const hasSelectedPositions = Object.values(selectedPositions).some(positions => positions.length > 0);
    if (!hasSelectedPositions) {
      alert('Please select at least one position');
      return;
    }

    // Validate player names for selected positions (flat key: TeamX-Y)
    const missingNames = [];
    const duplicateNames = [];
    const enteredNames = [];
    
    Object.entries(selectedPositions).forEach(([team, positions]) => {
      positions.forEach(position => {
        const key = `${team}-${position}`;
        const playerName = playerNames[key];
        
        if (!playerName || playerName.trim() === '') {
          missingNames.push(`${team} Position${position}`);
        } else {
          const trimmedName = playerName.trim().toLowerCase();
          if (enteredNames.includes(trimmedName)) {
            duplicateNames.push(`${team} Position${position}: "${playerName.trim()}"`);
          } else {
            enteredNames.push(trimmedName);
          }
        }
      });
    });

    if (missingNames.length > 0) {
      toast.error(`Please enter player names for: ${missingNames.join(', ')}`);
      return;
    }

    if (duplicateNames.length > 0) {
      toast.error(`Duplicate Free Fire game names found: ${duplicateNames.join(', ')}. Please use different names.`);
      return;
    }

    setIsJoining(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to join the match');
        return;
      }

      // Decode JWT token to get userId
      let userId = '';
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        userId = decoded.userId;
        if (!userId) {
          alert('Invalid token. Please login again.');
          return;
        }
      } catch (decodeError) {
        console.error('Error decoding JWT token:', decodeError);
        alert('Invalid token. Please login again.');
        return;
      }

      // Calculate playerIndex for each selected position based on mode
      const playerIndex: number[] = [];
      Object.entries(selectedPositions).forEach(([teamName, positions]) => {
        const normalizedTeamName = teamName.replace(/\s+/g, "");
        const teamNumber = parseInt(normalizedTeamName.replace("team", "").replace(/[^0-9]/g, ""), 10);
        positions.forEach(pos => {
          if (normalizedGameMode === 'solo') {
            // For solo, each team is a position (1-48)
            if (!isNaN(teamNumber)) {
              playerIndex.push(teamNumber);
            }
          } else if (normalizedGameMode === 'duo' || normalizedGameMode === 'full map duo') {
            // For duo, index: (teamNumber-1)*2 + (A=1, B=2)
            if (!isNaN(teamNumber) && (pos === 'A' || pos === 'B')) {
              const posNum = pos === 'A' ? 1 : 2;
              playerIndex.push((teamNumber - 1) * 2 + posNum);
            }
          } else if (normalizedGameMode === 'squad') {
            // For squad, index: (teamNumber-1)*4 + (A=1, B=2, C=3, D=4)
            if (!isNaN(teamNumber) && ['A','B','C','D'].includes(pos)) {
              const posMap = {A:1,B:2,C:3,D:4};
              playerIndex.push((teamNumber - 1) * 4 + posMap[pos]);
            }
          }
        });
      });
      // Group selectedPositions and playerNames by team (teamA, teamB, etc.)
      const groupedSelectedPositions = {};
      const groupedPlayerNames = {};
      const posMap = { a: 1, b: 2, c: 3, d: 4, A: 1, B: 2, C: 3, D: 4 };
      Object.entries(selectedPositions).forEach(([team, positions]) => {
        let teamKey = '';
        if (normalizedGameMode === 'solo') {
          teamKey = 'teamA';
        } else if (normalizedGameMode === 'duo' || normalizedGameMode === 'full map duo') {
          // Use teamA for column A, teamB for column B
          teamKey = '';
        } else if (normalizedGameMode === 'squad') {
          // Use teamA for column A, teamB for B, etc.
          teamKey = '';
        }
        const normalizedTeamName = team.replace(/\s+/g, "");
        let teamNumber = parseInt(normalizedTeamName.replace("team", "").replace(/[^0-9]/g, ""), 10);
        if (isNaN(teamNumber)) {
          const match = team.match(/(\d+)/);
          teamNumber = match ? parseInt(match[1], 10) : 1;
        }
        positions.forEach(position => {
          // Calculate player index for this team/position
          let playerIdx = null;
          if (normalizedGameMode === 'solo') {
            if (!isNaN(teamNumber)) playerIdx = teamNumber;
            teamKey = 'teamA';
          } else if (normalizedGameMode === 'duo' || normalizedGameMode === 'full map duo') {
            if (!isNaN(teamNumber) && (position === 'A' || position === 'B')) {
              const posNum = position === 'A' ? 1 : 2;
              playerIdx = (teamNumber - 1) * 2 + posNum;
              teamKey = position === 'A' ? 'teamA' : 'teamB';
            }
          } else if (normalizedGameMode === 'squad') {
            if (!isNaN(teamNumber) && ['A','B','C','D'].includes(position)) {
              const posMap = {A:1,B:2,C:3,D:4};
              playerIdx = (teamNumber - 1) * 4 + posMap[position];
              if (position === 'A') teamKey = 'teamA';
              else if (position === 'B') teamKey = 'teamB';
              else if (position === 'C') teamKey = 'teamC';
              else if (position === 'D') teamKey = 'teamD';
            }
          }
          if (playerIdx !== null) {
            if (!groupedSelectedPositions[teamKey]) groupedSelectedPositions[teamKey] = [];
            groupedSelectedPositions[teamKey].push(playerIdx);
            // Find player name for this position
            const playerNameKey = `${team}-${position}`;
            const playerName = playerNames[playerNameKey] || '';
            groupedPlayerNames[`${teamKey}-${playerIdx}`] = playerName;
          }
        });
      });

      // Always calculate totalAmount as entryFee * number of selected positions (unless free match)
      const selectedPositionsCount = Object.values(selectedPositions).reduce((total, positions) => total + positions.length, 0);
      const bookingTotalAmount = normalizedGameMode === 'free matches' ? 0 : entryFee * selectedPositionsCount;
      const bookingData = {
        slotId: slotData._id,
        selectedPositions: groupedSelectedPositions,
        playerNames: groupedPlayerNames,
        totalAmount: bookingTotalAmount, // Always entryFee * count (or 0 for free matches)
        slotType: normalizedGameMode.charAt(0).toUpperCase() + normalizedGameMode.slice(1),
        entryFee: normalizedGameMode === 'free matches' ? 0 : (slotData?.entryFee || 5), // Explicitly set 0 for free matches
        gameMode: normalizedGameMode,
        userId: userId,// Add userId to the booking data
        playerIndex: playerIndex // Add player index for future use
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Successfully joined the match!');
        // Clear the form after successful booking
        setSelectedPositions({});
        setPlayerNames({});
        // Refresh wallet balance and booked positions
        fetchWalletBalance();
        fetchBookedPositions();
        // Redirect to ongoing page after successful booking
        setTimeout(() => {
          navigate(`/ongoing`);
        }, 1500); // Small delay to show success message
      } else {
        const error = await response.json();
        toast.error(`Failed to join match: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error joining match:', error);
      toast.error('An error occurred while joining the match');
    } finally {
      setIsJoining(false);
    }
  };


  // --- REFACTORED: Use only gameMode for all logic below ---
  const gameMode = slotData?.gameMode?.toLowerCase() || 'squad';

  // Helper: Normalize gameMode (map 'deo' to 'duo')
  const normalizedGameMode = gameMode;

  // Helper: Get positions for gameMode
  const getPositionsForGameMode = (mode: string) => {
    switch (mode) {
      case 'solo':
        return ['A'];
      case 'duo':
        return ['A', 'B'];
      case 'squad':
      default:
        return ['A', 'B', 'C', 'D'];
    }
  };

  const maxbooking = slotData?.maxBookings || 0;
  // Helper: Get total teams for gameMode
  const getTotalTeamsForGameMode = (mode: string) => {
    switch (mode) {
      case 'solo':
        return maxbooking / 1;
      case 'duo':
        return maxbooking / 2;
      case 'squad':
        return maxbooking / 4;
      default:
        return 12;
    }
  };

  const positions = getPositionsForGameMode(normalizedGameMode);
  const totalTeams = getTotalTeamsForGameMode(normalizedGameMode);

  // Calculate total cost based on actually selected positions
  // For Free Matches, entry fee should be 0
  const entryFee = normalizedGameMode === 'free matches' ? 0 : (slotData?.entryFee || 5);
  const selectedPositionsCount = Object.values(selectedPositions).reduce((total, positions) => total + positions.length, 0);
  const totalCost = entryFee * selectedPositionsCount;
  const hasSufficientBalance = normalizedGameMode === 'free matches' ? true : (walletBalance >= totalCost);

  // Generate player slots based on game mode
  const generatePlayerSlots = (mode: string) => {
    switch (mode) {
      case 'solo':
        return [false];
      case 'duo':
        return [false, false];
      case 'squad':
      default:
        return [false, false, false, false];
    }
  };

  // Dummy player data based on game mode
  const teams = Array.from({ length: totalTeams }, (_, i) => ({
    name: `Team ${i + 1}`,
    players: generatePlayerSlots(normalizedGameMode),
  }));



  const renderTable = (teamList) => (
    <div className="match-slot">
      <table>
        <thead>
          <tr>
            <th className="Table-title">TEAM</th>
            {positions.map((position) => (
              <th className="Table-title" key={position}>{position}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teamList.map((team, teamIndex) => (
            <tr key={teamIndex}>
              <td>{team.name}</td>
              {team.players.map((isChecked, playerIndex) => {
                const position = positions[playerIndex];
                const isSelected = selectedPositions[team.name]?.includes(position) || false;
                const isBooked = bookedPositions[team.name]?.includes(position) || false;
                const isLocked = lockedPositions[team.name]?.includes(position) || false;

                return (
                  <td key={playerIndex}>
                    <input
                      type="checkbox"
                      checked={isSelected || isBooked}
                      onChange={(e) => handlePositionSelect(team.name, position, e.target.checked)}
                      disabled={isBooked || isLocked}
                      className={isBooked ? 'orange' : isLocked ? 'locked' : ''}
                      title={isBooked ? 'This position is already booked' : isLocked ? 'This position is being selected by another user' : ''}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Divide teams into tables based on game mode
  const getTableLayout = () => {
    if (normalizedGameMode === 'clash squad') {
      // For Clash Squad, show both teams in a single table
      return {
        leftTeams: teams,
        rightTeams: []
      };
    } else if (normalizedGameMode === 'solo' || normalizedGameMode === 'lone wolf') {
      // For Solo/Lone Wolf, split into 2 tables
      const half = Math.ceil(teams.length / 2);
      return {
        leftTeams: teams.slice(0, half),
        rightTeams: teams.slice(half)
      };
    } else if (normalizedGameMode === 'survival') {
      // For Survival, split 15 teams into 2 tables (8 + 7)
      return {
        leftTeams: teams.slice(0, 8),
        rightTeams: teams.slice(8, 15)
      };
    } else if (normalizedGameMode === 'duo' || normalizedGameMode === 'Full Map Duo') {
      // For Duo, split 25 teams into 2 tables
      const half = Math.ceil(teams.length / 2);
      return {
        leftTeams: teams.slice(0, half),
        rightTeams: teams.slice(half)
      };
    } else if (normalizedGameMode === 'squad') {
      // For squad mode (12 teams), split into 2 tables of 6 teams each
      return {
        leftTeams: teams.slice(0, 6),
        rightTeams: teams.slice(6, 12)
      };
    } else {
      // For other modes, split in half
      const half = Math.ceil(teams.length / 2);
      return {
        leftTeams: teams.slice(0, half),
        rightTeams: teams.slice(half)
      };
    }
  };

  const { leftTeams, rightTeams } = getTableLayout();

  return (
    <>
      <Header />
      <div className='container'>
        <h2 className="text-[42px] font-bold text-center pt-14 mb-2">
          {`${normalizedGameMode.toUpperCase()} MODE`}
        </h2>

        <div className="match-slot-wrapper ">
          {renderTable(leftTeams)}
          {rightTeams.length > 0 && renderTable(rightTeams)}
        </div>

        <section className="match-details-container">
          <div className="match-form-box">
            <h3 className="form-heading">FILL YOUR DETAILS</h3>

            <table className="details-table">
  <thead>
    <tr>
      <th>No.</th>
      <th>TEAM</th>
      <th>POSITION</th>
      <th>FF SAME GAME NAME</th>
    </tr>
  </thead>
  <tbody>
    {Object.entries(selectedPositions)
      .flatMap(([teamName, positions]) =>
        positions.map((position) => ({ teamName, position }))
      )
      .map(({ teamName, position }, index) => {
        const key = `${teamName}-${position}`;
        return (
          <tr key={key}>
            <td>{index + 1}</td>
            <td><span className="team-badge">TEAM : {teamName.replace('Team', '')}</span></td>
            <td><span className="position-badge">POSITION :{position}</span></td>
            <td>
              <input
                type="text"
                value={playerNames[key] || ''}
                onChange={(e) => handlePlayerNameChange(key, e.target.value)}
                placeholder="Enter FF Game Name"
                className="input-name"
              />
            </td>
          </tr>
        );
      })}
    {Object.keys(selectedPositions).length === 0 && (
      <tr>
        <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          Please select positions from the tables above to enter player details
        </td>
      </tr>
    )}
  </tbody>
</table>
          </div>

          <div className="payment-details">
            <p>Your Current Balance: <img src="/assets/vector/Coin.png" />
              <span className='Current-Balance'>
                {isLoading ? 'Loading...' : walletBalance.toFixed(2)}
              </span>
            </p>
            <p>Match Entry Free Per Person: <img src="/assets/vector/Coin.png" />
              <span className='Current-Balance'>{normalizedGameMode === 'free matches' ? 'FREE' : entryFee.toFixed(2)}</span>
            </p>
            <p>Selected Positions: <span className='Current-Balance'>{selectedPositionsCount}</span></p>
            <p>Total Payable Amount: <img src="/assets/vector/Coin.png" />
              <span className='Current-Balance'>{normalizedGameMode === 'free matches' ? 'FREE' : totalCost.toFixed(2)}</span>
            </p>

            {!hasSufficientBalance && !isLoading && totalCost > 0 && (
              <div className="error-note" style={{ color: '#ffffffff', fontWeight: 'bold' }}>
                Insufficient Balance! You need {(totalCost - walletBalance).toFixed(2)} more coins to join this match.
              </div>
            )}
            <div className="error-note">Note - Please Enter Your In Game Username/Name.</div>
          </div>

          <div className="booking-buttons">
            <button className="cancel-btn" onClick={handleCancel}>CANCEL</button>
            <button
              className={`join-btn ${!hasSufficientBalance || isLoading || isJoining || selectedPositionsCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!hasSufficientBalance || isLoading || isJoining || selectedPositionsCount === 0}
              onClick={handleJoinMatch}
              title={!hasSufficientBalance ? 'Insufficient balance' : selectedPositionsCount === 0 ? 'Please select positions first' : ''}
            >
              <img src="/assets/vector/Coin.png" alt="Coin" />
              {normalizedGameMode === 'free matches'
                ? (isJoining ? 'JOINING...' : isLoading ? 'LOADING...' : 'JOIN FREE')
                : `${totalCost.toFixed(0)} ${isJoining ? 'JOINING...' : isLoading ? 'LOADING...' : 'JOIN'}`
              }
            </button>
          </div>
        </section>
        {/* Map Slot to SlotData for AboutMatch */}
        <AboutMatch slotData={{
          _id: slotData?._id || '',
          slotType: slotData?.slotType || 'Squad',
          entryFee: slotData?.entryFee ?? 0,
          matchTime: slotData?.matchTime || '',
          perKill: slotData?.perKill ?? 0,
          totalWinningPrice: slotData?.totalWinningPrice ?? 0,
          maxBookings: slotData?.maxBookings ?? 0,
          remainingBookings: slotData?.remainingBookings ?? 0,
          customStartInMinutes: slotData?.customStartInMinutes ?? 0,
          createdAt: slotData?.createdAt || '',
          updatedAt: slotData?.updatedAt || '',
          banList: slotData?.banList,
          contactInfo: slotData?.contactInfo,
          discordLink: slotData?.discordLink,
          gameMode: slotData?.gameMode,
          mapName: slotData?.mapName,
          matchDescription: slotData?.matchDescription,
          prizeDistribution: slotData?.prizeDistribution,
          rules: slotData?.rules,
          specialRules: slotData?.specialRules,
          status: slotData?.status,
          streamLink: slotData?.streamLink,
          tournamentName: slotData?.tournamentName,
          hostName: slotData?.hostName,
          tournamentRules: slotData?.tournamentRules,
        }} />
      </div>
      <Footer />
    </>
  );
};

export default SelectSlot;
