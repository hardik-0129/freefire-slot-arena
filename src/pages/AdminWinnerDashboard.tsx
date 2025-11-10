

import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Users, Trophy, Target, Coins } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';





interface Winner {

  _id: string;

  rank: number;

  playerName: string;

  gameName: string;

  winningPrice: number;

  kills: number;

  userId?: string;

  walletCredited?: boolean;

}



interface Match {

  _id: string;

  matchTitle: string;

  slotType: string;

  matchTime: string;

  entryFee: number;

  totalWinningPrice: number;

  perKill: number;

  winners: Winner[];

  firstwin?: number;

  secwin?: number;

  thirdwin?: number;

}



interface PlayerStats {

  kills: number;

  position: number;

  winnings: number;

}





interface Booking {

  selectedPositions: any;

  _id: string;

  user: {

    _id: string;

    name: string;

    email: string;

    phone: string;

    freeFireUsername: string;

  };

  userId?: string;

  playerNames: { [key: string]: string };

  totalAmount: number;

  status: string;

  createdAt: string;

  gameStats?: PlayerStats;

}



interface CreditAllWinningsButtonProps {

  winners: Winner[];

  onSuccess?: () => void;

  bookingsForMatch?: { bookings: Booking[] };

  match?: Match;

}



const CreditAllWinningsButton: React.FC<CreditAllWinningsButtonProps> = ({ winners, onSuccess, bookingsForMatch, match }) => {

  const [loading, setLoading] = React.useState(false);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [hasCredited, setHasCredited] = React.useState(false);

  // Persist disabled state by match (first-time confirmation/credit)
  React.useEffect(() => {
    try {
      const key = match?._id ? `credit_all_disabled_${match._id}` : '';
      if (key) {
        const stored = localStorage.getItem(key);
        if (stored === 'true') setHasCredited(true);
      }
    } catch {}
  }, [match?._id]);

  const { toast } = useToast();

  const handleCreditAll = async () => {

    setLoading(true);

    const token = localStorage.getItem('adminToken');

    let credited = 0, failed = 0;
    // Count winners that cannot be credited because they are not saved/linked to a user yet
    const unsavedCountBase = (winners || []).filter(w => !w.userId).length;



    // Step 1: auto-create missing winners from bookings if provided

    try {

      if (bookingsForMatch && match) {

        const existingNames = new Set<string>((winners || []).map(w => (w.playerName || '').toLowerCase().trim()));

        const safeNum = (v: any) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

        const perKill = safeNum(match.perKill);

        const first = safeNum(match.firstwin);

        const second = safeNum(match.secwin);

        const third = safeNum(match.thirdwin);

        const usedRanks = new Set<number>((winners || []).map(w => safeNum(w.rank)).filter(r => r > 0));

        // Find the next available rank starting at 3

        let nextAutoRank = 3;

        while (usedRanks.has(nextAutoRank)) nextAutoRank++;



        // Track how many winners exist per rank to split rank bonuses fairly
        const rankToCount: Record<number, number> = {};
        (winners || []).forEach(w => {
          const r = safeNum(w.rank);
          if (r > 0) rankToCount[r] = (rankToCount[r] || 0) + 1;
        });

        for (const booking of bookingsForMatch.bookings || []) {

          const names: string[] = booking.playerNames ? Object.values(booking.playerNames).filter(Boolean).map(n => String(n)) : (booking.user?.name ? [booking.user.name] : []);

          const baseUserId = (booking.user && (booking.user as any)._id) ? (booking.user as any)._id : (booking as any).userId || '';

          for (const name of names) {

            const norm = (name || '').toLowerCase().trim();

            if (!norm || existingNames.has(norm)) continue;

            const kills = safeNum((booking.gameStats as any)?.kills);

            let rank = safeNum((booking.gameStats as any)?.position);

            if (!rank || rank < 1) {

              // Assign rank sequentially (3,4,5,...) ensuring uniqueness

              rank = Math.max(3, nextAutoRank);

              while (usedRanks.has(rank)) rank++;

              usedRanks.add(rank);

              nextAutoRank = rank + 1;

            } else {

              usedRanks.add(rank);

              if (rank >= nextAutoRank) nextAutoRank = rank + 1;

            }

            let bonus = 0; if (rank === 1) bonus = first; else if (rank === 2) bonus = second; else if (rank === 3) bonus = third;
            // Split the bonus across players sharing the same rank (including this one)
            const currentCount = (rankToCount[rank] || 0) + 1; // include this new winner
            const share = currentCount > 0 ? (bonus / currentCount) : 0;
            const winningPrice = Math.max(0, Math.floor(kills * perKill + share));

            try {

              const resCreate = await fetch(`${import.meta.env.VITE_API_URL}/api/winners`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ playerName: name, gameName: 'Free Fire', rank, winningPrice, kills, slotId: match._id, userId: baseUserId }) });

              const created = await resCreate.json();

              if (resCreate.ok && created?._id) {
                existingNames.add(norm);
                winners.push({ _id: created._id, rank, playerName: name, gameName: 'Free Fire', winningPrice, kills, userId: baseUserId, walletCredited: false });
                // Increment count for this rank so the next one gets a smaller share
                rankToCount[rank] = (rankToCount[rank] || 0) + 1;
              }

            } catch { }

          }

        }

      }

    } catch { }



    // Step 2: credit all winners

    for (const winner of winners) {

      if (!winner.userId || winner.walletCredited) continue;

      try {

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/add-winning`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            userId: winner.userId,
            amount: winner.winningPrice,
            winnerId: winner._id,
            // Include matchIndex in description so Wallet History shows the match number
            description: match && (match as any).matchIndex != null
              ? `Winning credited for match - #${(match as any).matchIndex}`
              : 'Winning credited'
          })
        });

        const data = await res.json();

        if (res.ok && data.success) credited++; else failed++;

      } catch (e) { failed++; }

    }



    setLoading(false);

    // Build friendly summary messages
    const unsavedCount = (winners || []).filter(w => !w.userId).length || unsavedCountBase;
    if (credited > 0) {
      toast({ title: 'Success', description: `${credited} winnings credited successfully.`, variant: 'default' });
    }
    if (unsavedCount > 0) {
      toast({ title: 'Info', description: `${unsavedCount} winner${unsavedCount > 1 ? 's' : ''} not saved/linked to user. Save winners first to credit them.`, variant: 'default' });
    }
    if (failed > 0 && credited === 0 && unsavedCount === 0) {
      // Only true failures remain
      toast({ title: 'Notice', description: `${failed} winning${failed > 1 ? 's' : ''} could not be credited. Please retry.`, variant: 'default' });
    }

    if (onSuccess) onSuccess();

    // Mark as credited after successful operation
    if (credited > 0) {
      setHasCredited(true);
    }

    // Close modal after processing
    setShowConfirmModal(false);

  };

  const handleButtonClick = () => {
    if (!hasCredited) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirm = () => {
    // Disable immediately after user confirmation (first-time click)
    try {
      const key = match?._id ? `credit_all_disabled_${match._id}` : '';
      if (key) localStorage.setItem(key, 'true');
    } catch {}
    setHasCredited(true);
    handleCreditAll();
  };

  // Show when uncredited winners exist or we can auto-create from bookings
  const hasUncredited = winners.some(w => w.userId && !w.walletCredited) || (!!bookingsForMatch && !!match);

  // Check if all winners are already credited
  const allCredited = winners.length > 0 && winners.every(w => !w.userId || w.walletCredited) && (!bookingsForMatch || !match);

  // If everything became credited (e.g., via another action), also disable
  React.useEffect(() => {
    if (winners.length > 0 && allCredited) {
      setHasCredited(true);
      try {
        const key = match?._id ? `credit_all_disabled_${match._id}` : '';
        if (key) localStorage.setItem(key, 'true');
      } catch {}
    }
  }, [winners, allCredited, match?._id]);

  if (!hasUncredited && allCredited) return null;

  const isDisabled = hasCredited || loading || allCredited;

  return (
    <>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleButtonClick}
        disabled={isDisabled}
      >
        {loading ? 'Processing...' : hasCredited ? 'Winnings Credited' : 'Save & Credit All Winnings'}
    </button>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-[#0F0F0F] border border-[#2A2A2A] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Confirm Credit All Winnings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-300">
              Are you sure you want to credit all winnings to the winners? This action will credit the winning amounts to all eligible players' wallets.
            </p>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-3">
              <p className="text-sm text-gray-400 mb-2">Summary:</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Total winners: {winners.length}</li>
                <li>• Winners with user accounts: {winners.filter(w => w.userId).length}</li>
                <li>• Already credited: {winners.filter(w => w.walletCredited).length}</li>
                <li>• To be credited: {winners.filter(w => w.userId && !w.walletCredited).length}</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Processing...' : 'Confirm & Credit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

};



const AdminWinnerDashboard: React.FC<{ filterSlotId?: string }> = ({ filterSlotId }) => {

  // Winner data state

  const [winnersBySlot, setWinnersBySlot] = useState<{ [slotId: string]: Winner[] }>({});



  // Fetch winners for all matches/slots

  const fetchWinnersForSlots = async (matchesList: Match[]) => {

    try {

      const token = localStorage.getItem('adminToken');

      if (!token) return;

      const winnersData: { [slotId: string]: Winner[] } = {};

      for (const match of matchesList) {

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/winners?slotId=${match._id}`, {

          headers: { 'Authorization': `Bearer ${token}` }

        });

        if (response.ok) {

          const data = await response.json();

          // Backend now returns an array without slotId

          winnersData[match._id] = Array.isArray(data) ? data : [];

        } else {

          winnersData[match._id] = [];

        }

      }

      setWinnersBySlot(winnersData);

    } catch (err) {

      setWinnersBySlot({});

    }

  };

  const navigate = useNavigate();

  const [matches, setMatches] = useState<Match[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedMatch, setSelectedMatch] = useState<Match | undefined>();



  // Player management states

  const [showPlayersModal, setShowPlayersModal] = useState(false);

  const [selectedMatchForPlayers, setSelectedMatchForPlayers] = useState<Match | null>(null);

  const [slotBookings, setSlotBookings] = useState<{ [key: string]: { bookings: Booking[] } }>({});

  const [users, setUsers] = useState<any[]>([]); // Store users for phone lookup

  // Cancel match states - using player key (bookingId + playerName) for unique selection
  const [selectedPlayers, setSelectedPlayers] = useState<{ [slotId: string]: Set<string> }>({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedMatchForCancel, setSelectedMatchForCancel] = useState<Match | null>(null);
  const [selectedPlayersForRefund, setSelectedPlayersForRefund] = useState<{ [playerKey: string]: boolean }>({});
  const [cancelling, setCancelling] = useState(false);
  // Track refunded players by match ID and player key
  const [refundedPlayers, setRefundedPlayers] = useState<{ [slotId: string]: Set<string> }>({});
  
  // Helper function to create unique player key
  const getPlayerKey = (bookingId: string, playerName: string) => {
    return `${bookingId}_${playerName}`;
  };

  // Fetch all users for phone lookup

  const fetchUsers = async () => {

    try {

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {

        headers: {

          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`

        }

      });

      if (response.ok) {

        const data = await response.json();

        // Add phone number to each user if available

        const usersWithPhone = Array.isArray(data.users)

          ? data.users.map(user => ({

            ...user,

            phone: user.phone || user.mobile || user.mobileNumber || ''

          }))

          : [];

        setUsers(usersWithPhone);

      }

    } catch (error) {

      console.error('Error fetching users:', error);

    }

  };



  const { toast } = useToast();



  // Check token on component mount

  useEffect(() => {

    const token = localStorage.getItem('adminToken');

    if (!token) {

      toast({

        title: "Authentication Required",

        description: "Please log in to access the admin panel",

        variant: "destructive",

      });

      navigate('/al-admin-128900441');

      return;

    }

    fetchUsers();

    fetchCompletedMatches();

  }, [navigate]);



  // Run fetchAllSlotBookings only after both users and matches are loaded

  useEffect(() => {

    if (users.length > 0 && matches.length > 0) {

      fetchAllSlotBookings(matches);

    }

  }, [users, matches]);

  // Refetch when filterSlotId changes
  useEffect(() => {
    if (filterSlotId) {
      // Reset state when filter changes
      setMatches([]);
      setWinnersBySlot({});
      setSlotBookings({});
      fetchCompletedMatches();
    }
  }, [filterSlotId]);



  // Helper function to handle API responses and token expiration

  const handleApiResponse = async (response: Response) => {

    if (response.status === 401) {

      toast({

        title: "Session Expired",

        description: "Your session has expired. Please log in again.",

        variant: "destructive",

      });

      localStorage.removeItem('adminToken');

      navigate('/al-admin-128900441');

      throw new Error('Token expired');

    }

    return response;

  };



  const fetchCompletedMatches = async () => {

    try {

      setLoading(true);

      setError(null);



      const token = localStorage.getItem('adminToken');

      if (!token) {

        navigate('/al-admin-128900441');

        return;

      }



      // Fetch all slots/matches instead of just completed ones

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots`, {

        headers: {

          'Authorization': `Bearer ${token}`

        }

      });



      await handleApiResponse(response);

      const data = await response.json();



      if (data.success) {

        let matchesWithBookings: Match[] = data.slots || [];

        // If a filter is provided, keep only that match

        if (filterSlotId) {

          matchesWithBookings = matchesWithBookings.filter((m: Match) => String(m._id) === String(filterSlotId));

        }

        setMatches(matchesWithBookings);

        // Preselect filtered match for players view

        if (filterSlotId && matchesWithBookings.length > 0) {

          setSelectedMatch(matchesWithBookings[0]);

          setSelectedMatchForPlayers(matchesWithBookings[0]);

        }

        // fetchAllSlotBookings will be called by useEffect when users and matches are both loaded

        fetchWinnersForSlots(matchesWithBookings);

      } else {

        setError(data.error || 'Failed to fetch matches');

      }

    } catch (err: any) {

      if (err.message !== 'Token expired') {

        setError(`Failed to fetch matches: ${err.message}`);

        console.error('Error fetching matches:', err);

      }

    } finally {

      setLoading(false);

    }

  };



  const fetchAllSlotBookings = async (matchesList: Match[]) => {

    try {

      const token = localStorage.getItem('adminToken');

      if (!token) {

        navigate('/al-admin-128900441');

        return;

      }



      const bookingsData: { [key: string]: { bookings: Booking[] } } = {};



      // Helper to get phone from users list (compare as strings)

      // Accepts booking, checks booking.user._id or booking.userId

      const getUserPhone = (booking: any) => {
        // First check if booking.user already has phone number directly from API
        if (booking.user?.phone) return booking.user.phone;
        let userId = '';

        if (booking.user && booking.user._id) {

          userId = booking.user._id;

        } else if (booking.userId) {

          userId = booking.userId;

        }

        if (!userId) return '';

        const user = users.find(u => String(u._id) === String(userId));

        if (user) {
          return user.phone || '';
        }

        return '';

      };



      for (const match of matchesList) {

        try {

          // Use the provided API endpoint for fetching bookings

          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/slot/${match._id}`, {

            headers: {

              'Authorization': `Bearer ${token}`

            }

          });

          if (response.status === 404) {

            bookingsData[match._id] = { bookings: [] };

            continue;

          }

          await handleApiResponse(response);

          if (response.ok) {

            const data = await response.json();



            // Merge phone into each booking.user

            if (data.status && Array.isArray(data.data)) {

              // Debug: log the full booking object to inspect user reference fields

              data.data.forEach((booking: any) => {

              });

              const bookingsWithPhone = data.data.map((booking: any) => {

                const phone = getUserPhone(booking);

                if (booking.user) {

                  return {
                    ...booking,
                    user: {
                      ...booking.user,
                      phone
                      
                    }

                  };

                } else {

                  return {

                    ...booking,

                    user: {

                      phone

                    }

                  };

                }

              });

              bookingsData[match._id] = { bookings: bookingsWithPhone };

            } else {

              bookingsData[match._id] = { bookings: [] };

            }

          }

        } catch (error: any) {

          if (error.message === 'Token expired') {

            return;

          }

          console.error(`Error fetching bookings for match ${match._id}:`, error);

        }

      }



      setSlotBookings(bookingsData);

    } catch (error) {

      console.error('Error fetching all slot bookings:', error);

    }

  };



  const handleUpdatePlayerStats = async (

    winnerId: string,

    stats: {

      playerName: string,

      gameName: string,

      rank: number,

      winningPrice: number,

      kills: number,

      slotId: string

    },

    onSuccess?: (kills: number, winnings: number) => void

  ) => {

    try {

      const token = localStorage.getItem('adminToken');

      if (!token) {

        toast({

          title: "Authentication Required",

          description: "Please log in to update winner stats.",

          variant: "destructive",

        });

        navigate('/al-admin-128900441');

        return;

      }



      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/api/winners/${winnerId}`,

        {

          method: 'PUT',

          headers: {

            'Content-Type': 'application/json',

            'Authorization': `Bearer ${token}`,

          },

          body: JSON.stringify(stats),

        }

      );



      const data = await response.json();





      if (response.ok && data._id) {

        toast({

          title: "Success",

          description: "Winner updated successfully.",

          variant: "default",

        });

        if (onSuccess) {

          onSuccess(stats.kills, stats.winningPrice);

        }

        fetchCompletedMatches();

      } else {

        toast({

          title: "Error",

          description: data.error || "Failed to update winner.",

          variant: "destructive",

        });

      }

    } catch (err) {

      toast({

        title: "Error",

        description: "An error occurred while updating winner.",

        variant: "destructive",

      });

      console.error(err);

    }

  };

  // Handle checkbox selection for cancel match - using player name for unique selection
  const handlePlayerCheckboxChange = (slotId: string, bookingId: string, playerName: string, checked: boolean) => {
    const playerKey = getPlayerKey(bookingId, playerName);
    setSelectedPlayers(prev => {
      const newState = { ...prev };
      if (!newState[slotId]) {
        newState[slotId] = new Set<string>();
      }
      if (checked) {
        newState[slotId].add(playerKey);
      } else {
        newState[slotId].delete(playerKey);
      }
      return newState;
    });
  };

  // Handle select all checkboxes for a match - using player keys
  const handleSelectAllPlayers = (slotId: string, checked: boolean, displayedRows: Array<{ booking: any; playerName: string }>) => {
    setSelectedPlayers(prev => {
      const newState = { ...prev };
      if (checked) {
        const playerKeys = displayedRows
          .filter(row => row.booking && row.playerName)
          .map(row => getPlayerKey(row.booking._id, row.playerName));
        newState[slotId] = new Set(playerKeys);
      } else {
        newState[slotId] = new Set();
      }
      return newState;
    });
  };

  // Open cancel modal
  const handleOpenCancelModal = (match: Match) => {
    const selected = selectedPlayers[match._id] || new Set();
    if (selected.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one player to cancel the match.",
        variant: "destructive",
      });
      return;
    }
    setSelectedMatchForCancel(match);
    // Initialize all selected players as selected for refund
    const refundState: { [playerKey: string]: boolean } = {};
    selected.forEach(playerKey => {
      refundState[playerKey] = true;
    });
    setSelectedPlayersForRefund(refundState);
    setCancelReason('');
    setShowCancelModal(true);
  };

  // Handle cancel match
  const handleCancelMatch = async () => {
    if (!selectedMatchForCancel) return;
    if (!cancelReason.trim()) {
      toast({
        title: "Cancel Reason Required",
        description: "Please provide a reason for cancelling the match.",
        variant: "destructive",
      });
      return;
    }

    const selectedForRefund = Object.entries(selectedPlayersForRefund)
      .filter(([_, selected]) => selected)
      .map(([playerKey]) => playerKey);

    if (selectedForRefund.length === 0) {
      toast({
        title: "No Players Selected",
        description: "Please select at least one player to refund.",
        variant: "destructive",
      });
      return;
    }

    setCancelling(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to cancel matches.",
          variant: "destructive",
        });
        navigate('/al-admin-128900441');
        return;
      }

      // Extract booking IDs and player names from player keys
      const refundData = selectedForRefund.map(playerKey => {
        const [bookingId, ...playerNameParts] = playerKey.split('_');
        const playerName = playerNameParts.join('_'); // In case player name contains underscores
        return { bookingId, playerName };
      });

      // Call cancel match API with selective refund
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots/${selectedMatchForCancel._id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cancelReason: cancelReason.trim(),
          refundPlayers: refundData // Send array of {bookingId, playerName}
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Match Cancelled",
          description: `Match cancelled successfully. ${selectedForRefund.length} player(s) refunded.`,
          variant: "default",
        });
        
        // Mark refunded players as disabled
        setRefundedPlayers(prev => {
          const newState = { ...prev };
          if (!newState[selectedMatchForCancel._id]) {
            newState[selectedMatchForCancel._id] = new Set();
          }
          selectedForRefund.forEach(playerKey => {
            newState[selectedMatchForCancel._id].add(playerKey);
          });
          return newState;
        });
        
        setShowCancelModal(false);
        setSelectedMatchForCancel(null);
        setCancelReason('');
        setSelectedPlayersForRefund({});
        // Clear selected players for this match
        setSelectedPlayers(prev => {
          const newState = { ...prev };
          newState[selectedMatchForCancel._id] = new Set();
          return newState;
        });
        // Refresh matches
        fetchCompletedMatches();
      } else {
        toast({
          title: "Error",
          description: data.error || data.msg || "Failed to cancel match.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "An error occurred while cancelling the match.",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };



  // PlayerStatCard Component

  interface PlayerStatCardProps {

    booking: Booking;

    index: number;

    matchInfo: Match;

    onUpdateStats: (bookingId: any, stats: any) => void;

  }



  const PlayerStatCard: React.FC<PlayerStatCardProps> = ({ booking, index, matchInfo, onUpdateStats }) => {

    const [isEditing, setIsEditing] = useState(false);

    const [stats, setStats] = useState({

      playerName: booking.user?.name || '',

      gameName: 'Free Fire',

      rank: booking.gameStats?.position || 0,

      winningPrice: booking.gameStats?.winnings || 0,

      kills: booking.gameStats?.kills || 0,

      slotId: matchInfo._id

    });



    const calculateWinnings = (kills: number, rank: number) => {

      const perKillCoin = Number(matchInfo?.perKill);

      const firstPlaceCoin = Number(matchInfo?.firstwin);

      const secondPlaceCoin = Number(matchInfo?.secwin);

      const thirdPlaceCoin = Number(matchInfo?.thirdwin);



      let positionReward = 0;

      if (rank === 1) positionReward = firstPlaceCoin;

      else if (rank === 2) positionReward = secondPlaceCoin;

      else if (rank === 3) positionReward = thirdPlaceCoin;



      return Math.max(0, Math.floor(kills * perKillCoin + positionReward));

    };



    const handleSave = () => {

      const calculatedWinnings = calculateWinnings(stats.kills, stats.rank);

      const finalStats = { ...stats, winningPrice: calculatedWinnings };

      onUpdateStats(

        booking._id,

        {

          kills: stats.kills,

          position: stats.rank,

          winnings: calculatedWinnings

        }

      );

      setStats(finalStats);

      setIsEditing(false);

    };



    const handleEditClick = () => {

      setIsEditing(true);

    };



    return (

      <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#3A3A3A] hover:border-[#FF4D4F] transition-all duration-300">

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 bg-[#FF4D4F] rounded-full flex items-center justify-center text-white font-bold">

              {index + 1}

            </div>

            <div>

              <h3 className="text-white font-bold text-lg">{booking.user.name}</h3>

              <p className="text-gray-400 text-sm">{booking.user.freeFireUsername}</p>

            </div>

          </div>

          <div className="text-right">

            <div className="text-gray-400 text-sm">Entry Fee</div>

            <div className="text-[#52C41A] font-bold">₹{booking.totalAmount}</div>

          </div>

        </div>



        {/* Player Names */}

        {booking.playerNames && Object.keys(booking.playerNames).length > 0 && (

          <div className="mb-4">

            <div className="text-gray-400 text-xs mb-2">Team Members:</div>

            <div className="flex flex-wrap gap-2">

              {Object.entries(booking.playerNames).map(([position, playerName]: [string, any]) => (

                <span key={position} className="bg-[#3A3A3A] px-2 py-1 rounded text-xs text-white">

                  {String(playerName)}

                </span>

              ))}

            </div>

          </div>

        )}



        {/* Game Statistics */}

        <div className="space-y-3">

          <div className="grid grid-cols-3 gap-4">

            <div className="bg-[#1A1A1A] p-3 rounded-lg">

              <div className="flex items-center gap-2 mb-2">

                <Target className="h-4 w-4 text-red-500" />

                <span className="text-gray-400 text-sm">Kills</span>

              </div>

              {isEditing ? (

                <Input

                  type="number"

                  min="0"

                  value={stats.kills}

                  onChange={(e) => setStats({ ...stats, kills: parseInt(e.target.value) || 0 })}

                  className="bg-[#2A2A2A] text-white border-[#3A3A3A] h-8"

                />

              ) : (

                <div className="text-white font-bold text-xl">{stats.kills}</div>

              )}

            </div>



            <div className="bg-[#1A1A1A] p-3 rounded-lg">

              <div className="flex items-center gap-2 mb-2">

                <Trophy className="h-4 w-4 text-yellow-500" />

                <span className="text-gray-400 text-sm">Position</span>

              </div>

              {isEditing ? (

                <Select

                  value={stats.rank.toString()}

                  onValueChange={(value) => setStats({ ...stats, rank: parseInt(value) })}

                >

                  <SelectTrigger className="bg-[#2A2A2A] text-white border-[#3A3A3A] h-8">

                    <SelectValue />

                  </SelectTrigger>

                  <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">

                    <SelectItem value="0" className="text-white">Not Placed</SelectItem>

                    <SelectItem value="1" className="text-white">🥇 1st Place</SelectItem>

                    <SelectItem value="2" className="text-white">🥈 2nd Place</SelectItem>

                    <SelectItem value="3" className="text-white">🥉 3rd Place</SelectItem>

                    {[...Array(17)].map((_, i) => (

                      <SelectItem key={i + 4} value={(i + 4).toString()} className="text-white">

                        {i + 4}th Place

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              ) : (

                <div className="text-white font-bold text-xl">

                  {stats.rank === 0 ? '-' :

                    stats.rank === 1 ? '🥇 1st' :

                      stats.rank === 2 ? '🥈 2nd' :

                        stats.rank === 3 ? '🥉 3rd' :

                          `#${stats.rank}`}

                </div>

              )}

            </div>



            <div className="bg-[#1A1A1A] p-3 rounded-lg">

              <div className="flex items-center gap-2 mb-2">

                <Coins className="h-4 w-4 text-green-500" />

                <span className="text-gray-400 text-sm">Winnings</span>

              </div>

              <div className="text-[#52C41A] font-bold text-xl">₹{stats.winningPrice}</div>

            </div>

          </div>



          {/* Action Buttons */}

          <div className="flex gap-2 pt-2">

            {isEditing ? (

              <>

                <Button

                  onClick={handleSave}

                  className="flex-1 bg-[#52C41A] hover:bg-[#73D13D] text-white"

                >

                  Save Stats

                </Button>

                <Button

                  onClick={() => setIsEditing(false)}

                  variant="outline"

                  className="flex-1 border-[#3A3A3A] text-white hover:bg-[#2A2A2A]"

                >

                  Cancel

                </Button>

              </>

            ) : (

              <Button

                onClick={handleEditClick}

                className="w-full bg-[#FF4D4F] hover:bg-[#FF7875] text-white"

              >

                Edit Stats

              </Button>

            )}

          </div>

        </div>

      </div>

    );

  };





  const handleWinnerAdded = () => {

    fetchCompletedMatches();

  };



  const formatDateTime = (dateString: string) => {

    return new Date(dateString).toLocaleString('en-IN', {

      day: '2-digit',

      month: 'short',

      year: 'numeric',

      hour: '2-digit',

      minute: '2-digit'

    });

  };



  if (loading) {

    return (

      <div className="min-h-screen bg-[#121212] p-6">

        <div className="animate-pulse">

          <div className="h-8 bg-[#2A2A2A] rounded w-64 mb-6"></div>

          {[1, 2, 3, 4, 5].map((i) => (

            <div key={i} className="bg-[#1A1A1A] p-6 rounded-lg mb-4">

              <div className="h-6 bg-[#2A2A2A] rounded w-48 mb-2"></div>

              <div className="h-4 bg-[#2A2A2A] rounded w-32 mb-4"></div>

              <div className="h-10 bg-[#2A2A2A] rounded w-32"></div>

            </div>

          ))}

        </div>

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-[#121212] p-6">

      <div className="max-w-8xl mx-auto">

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-2xl font-bold text-white">Winners Management</h1>

          <button

            onClick={fetchCompletedMatches}

            className="bg-[#52C41A] hover:bg-[#73D13D] text-white px-4 py-2 rounded"

          >

            Refresh

          </button>

        </div>



        {error && (

          <div className="bg-red-900/20 border border-red-500/30 text-red-100 p-4 rounded mb-6">

            <div className="flex items-center justify-between">

              <span>{error}</span>

              {error.includes('Authentication') || error.includes('Token') ? (

                <Button

                  onClick={() => navigate('/al-admin-128900441')}

                  className="bg-[#FF4D4F] hover:bg-[#FF7875] text-white ml-4"

                >

                  Login Again

                </Button>

              ) : null}

            </div>

          </div>

        )}



        <div className="grid gap-6">

          {matches.length === 0 ? (

            <div className="text-center py-12">

              <div className="text-gray-400 text-xl mb-2">No matches found</div>

              <div className="text-gray-500">Matches with registered players will appear here</div>

            </div>

          ) : (

            (() => {

              // If filterSlotId is provided, only show that match
              let matchesToShow = matches;
              if (filterSlotId) {
                matchesToShow = matches.filter(match => String(match._id) === String(filterSlotId));
              } else {
                const matchesWithBookings = matches.filter(match => slotBookings[match._id] && slotBookings[match._id].bookings.length > 0);
                matchesToShow = matchesWithBookings.length > 0 ? matchesWithBookings : matches;
              }



              return matchesToShow.map((match) => (

                <div key={match._id} className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">

                  <div className="flex justify-between items-start mb-4">

                    <div>

                      <h3 className="text-xl font-semibold text-white mb-2">

                        {`${match.slotType} Match`}

                      </h3>

                      <div className="text-gray-400 space-y-1">

                        <p>🎮 {match.slotType}</p>

                        <p>📅 {formatDateTime(match.matchTime)}</p>

                        <p>💰 Entry Fee: ₹{match.entryFee}</p>

                        <p>🏆 Total Prize: ₹{match.totalWinningPrice}</p>

                      </div>

                    </div>

                  </div>



                  {/* Winners Table */}

                  <div className="winner-list mt-4 mb-8">

                    {/* <h4 className="text-white font-semibold mb-2">Winners</h4> */}

                    <CreditAllWinningsButton winners={winnersBySlot[match._id] || []} onSuccess={fetchCompletedMatches} bookingsForMatch={slotBookings[match._id]} match={match} />

                    <div className="overflow-x-auto mt-2">

                      <table className="min-w-full bg-[#232323] rounded-lg">

                        <thead>

                          <tr className="text-white">

                            <th className="px-3 py-2 text-white text-center w-16">Rank</th>

                            <th className="px-3 py-2 text-white text-left min-w-[150px]">Player Name</th>

                            <th className="px-3 py-2 text-white text-left w-32">Game Name</th>

                            <th className="px-3 py-2 text-white text-center w-20">Kills</th>

                            <th className="px-3 py-2 text-white text-left min-w-[120px]">Winning Price</th>

                            <th className="px-3 py-2 text-white text-center w-24">Actions</th>

                          </tr>

                        </thead>

                        <tbody>

                          {(winnersBySlot[match._id]?.length ?? 0) > 0 ? (

                            (() => {

                              const filteredWinners = winnersBySlot[match._id];

                              // Winner Row Component with editable fields and update logic

                              const WinnerRow: React.FC<{ winner: any; onSuccess: () => void; match: Match }> = ({ winner, onSuccess, match }) => {

                                const [editing, setEditing] = React.useState(false);

                                const [loading, setLoading] = React.useState(false);

                                const [deleteLoading, setDeleteLoading] = React.useState(false);

                                const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

                                const [fields, setFields] = React.useState({

                                  rank: winner.rank,

                                  kills: winner.kills,

                                  winningPrice: winner.winningPrice

                                });

                                const { toast } = useToast();



                                const calc = React.useCallback((kills: number, rank: number) => {

                                  const perKill = Number(match?.perKill) || 0;

                                  const first = Number(match?.firstwin) || 0;

                                  const second = Number(match?.secwin) || 0;

                                  const third = Number(match?.thirdwin) || 0;

                                  let bonus = 0;

                                  if (rank === 1) bonus = first; else if (rank === 2) bonus = second; else if (rank === 3) bonus = third;

                                  // Split the positional bonus among all winners sharing that rank
                                  let splitBy = 1;
                                  const list = winnersBySlot?.[match._id] || [];
                                  if (Array.isArray(list)) {
                                    const sameRankCount = list.filter((w: any) => Number(w.rank) === Number(rank)).length;
                                    splitBy = Math.max(1, sameRankCount || 1);
                                  }
                                  const share = bonus / splitBy;

                                  return Math.max(0, Math.floor(kills * perKill + share));

                                }, [match, winnersBySlot]);



                                // Ensure initial price is populated if 0

                                React.useEffect(() => {

                                  if (!fields.winningPrice || fields.winningPrice === 0) {

                                    setFields(f => ({ ...f, winningPrice: calc(f.kills, f.rank) }));

                                  }

                                }, [calc]);



                                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

                                  const { name, value } = e.target;

                                  const numeric = Number(value);

                                  setFields(f => {

                                    const next = { ...f, [name]: name === 'rank' || name === 'kills' || name === 'winningPrice' ? numeric : value } as any;

                                    // auto recalc when kills or rank change

                                    if (name === 'rank' || name === 'kills') {

                                      next.winningPrice = calc(name === 'kills' ? numeric : next.kills, name === 'rank' ? numeric : next.rank);

                                    }

                                    return next;

                                  });

                                };



                                const handleUpdate = async () => {

                                  setLoading(true);

                                  try {

                                    const token = localStorage.getItem('adminToken');

                                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/winners/${winner._id}`, {

                                      method: 'PUT',

                                      headers: {

                                        'Content-Type': 'application/json',

                                        'Authorization': `Bearer ${token}`

                                      },

                                      body: JSON.stringify(fields)

                                    });

                                    const data = await res.json();

                                    if (res.ok && data._id) {

                                      toast({ title: 'Success', description: 'Winner updated successfully.', variant: 'default' });

                                      setEditing(false);

                                      if (onSuccess) onSuccess();

                                    } else {

                                      toast({ title: 'Error', description: data.error || 'Failed to update winner.', variant: 'destructive' });

                                    }

                                  } catch (err) {

                                    toast({ title: 'Error', description: 'Error updating winner.', variant: 'destructive' });

                                  } finally {

                                    setLoading(false);

                                  }

                                };



                                const handleDelete = async () => {

                                  setDeleteLoading(true);

                                  try {

                                    const token = localStorage.getItem('adminToken');

                                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/winners/${winner._id}`, {

                                      method: 'DELETE',

                                      headers: {

                                        'Authorization': `Bearer ${token}`

                                      }

                                    });

                                    const data = await res.json();

                                    if (res.ok) {

                                      toast({ title: 'Success', description: 'Winner deleted successfully.', variant: 'default' });

                                      setShowDeleteConfirm(false);

                                      if (onSuccess) onSuccess();

                                    } else {

                                      toast({ title: 'Error', description: data.error || 'Failed to delete winner.', variant: 'destructive' });

                                    }

                                  } catch (err) {

                                    toast({ title: 'Error', description: 'Error deleting winner.', variant: 'destructive' });

                                  } finally {

                                    setDeleteLoading(false);

                                  }

                                };



                                return (

                                  <>

                                    <tr className="border-b border-[#333]">

                                      <td className="px-3 py-2 text-center text-white">

                                        {editing ? <input name="rank" type="number" value={fields.rank} onChange={handleChange} className="w-12 bg-[#181818] text-white rounded px-2 py-1 border border-[#333] text-center" disabled={loading} /> : fields.rank}

                                      </td>

                                      <td className="px-3 py-2 text-white">{winner.playerName}</td>

                                      <td className="px-3 py-2 text-white">{winner.gameName}</td>

                                      <td className="px-3 py-2 text-center text-white">

                                        {editing ? <input name="kills" type="number" value={fields.kills} onChange={handleChange} className="w-12 bg-[#181818] text-white rounded px-2 py-1 border border-[#333] text-center" disabled={loading} /> : fields.kills}

                                      </td>

                                      <td className="px-3 py-2 text-white">

                                        {editing ? <input name="winningPrice" type="number" value={fields.winningPrice} onChange={handleChange} className="w-16 bg-[#181818] text-white rounded px-2 py-1 border border-[#333] text-center" disabled={loading} /> : `₹${fields.winningPrice}`}

                                      </td>

                                      <td className="px-3 py-2 text-center">

                                        {editing ? (

                                          <div className="flex gap-1 justify-center">

                                            <button onClick={handleUpdate} disabled={loading} className="px-2 py-1 rounded text-xs bg-yellow-600 hover:bg-yellow-700 text-white">{loading ? 'Saving...' : 'Save'}</button>

                                            <button onClick={() => setShowDeleteConfirm(true)} disabled={loading} className="px-2 py-1 rounded text-xs bg-red-600 hover:bg-red-700 text-white">Delete</button>

                                          </div>

                                        ) : (

                                          <button onClick={() => setEditing(true)} className="px-2 py-1 rounded text-xs bg-blue-600 hover:bg-blue-700 text-white">Edit</button>

                                        )}

                                      </td>

                                    </tr>

                                    {/* Delete Confirmation Dialog */}

                                    {showDeleteConfirm && (

                                      <tr>

                                        <td colSpan={6} className="px-3 py-2 bg-red-900/20 border border-red-500/30">

                                          <div className="flex items-center justify-between">

                                            <span className="text-red-100 text-sm">

                                              Are you sure you want to delete this winner entry?

                                            </span>

                                            <div className="flex gap-2">

                                              <button

                                                onClick={handleDelete}

                                                disabled={deleteLoading}

                                                className="px-3 py-1 rounded text-xs bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"

                                              >

                                                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}

                                              </button>

                                              <button

                                                onClick={() => setShowDeleteConfirm(false)}

                                                className="px-3 py-1 rounded text-xs bg-gray-600 hover:bg-gray-700 text-white"

                                              >

                                                Cancel

                                              </button>

                                            </div>

                                          </div>

                                        </td>

                                      </tr>

                                    )}

                                  </>

                                );

                              };
                              return filteredWinners.length > 0
                                ? filteredWinners.map((winner, idx) => (
                                  <WinnerRow key={winner._id || idx} winner={winner} onSuccess={fetchCompletedMatches} match={match} />
                                ))
                                : (

                                  <tr>

                                    <td colSpan={6} className="text-center text-gray-400">No winners added yet.</td>

                                  </tr>

                                );

                            })()

                          ) : (

                            <tr>

                              <td colSpan={6} className="text-center text-gray-400">No winners added yet.</td>

                            </tr>

                          )}

                        </tbody>

                      </table>

                    </div>

                  </div>

                  {/* Booked Players Table - two full-width stacked tables */}

                  <div className="player-list mt-6">

                    {/* Cancel Match Button - appears when checkboxes are selected */}
                    {(selectedPlayers[match._id]?.size || 0) > 0 && (
                      <div className="mb-4">
                        <button
                          onClick={() => handleOpenCancelModal(match)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold"
                        >
                          Cancel Match ({selectedPlayers[match._id]?.size || 0} selected)
                        </button>
                      </div>
                    )}

                    {/* <h4 className="text-white font-semibold mb-2">Booked Players</h4> */}

                    <div className="grid gap-4" 
                      style={{
                        gridTemplateColumns: (() => {
                          const bookings = slotBookings[match._id]?.bookings || [];
                          let playerCount = 0;
                          const modeOuter = String(match.slotType || '').toLowerCase();
                          const groupedOuter = modeOuter.includes('duo') || modeOuter.includes('squad');
                          if (bookings.length > 0) {
                            if (!groupedOuter) {
                              bookings.forEach((b: any) => {
                                const names = Object.values(b.playerNames || {}).filter(Boolean);
                                playerCount += names.length > 0 ? names.length : 1;
                              });
                            } else {
                              bookings.forEach((b: any) => {
                                const names = Object.values(b.playerNames || {}).filter(Boolean);
                                playerCount += names.length;
                              });
                            }
                          }
                          const twoCols = playerCount > 24;
                          return twoCols ? 'repeat(2,minmax(0,1fr))' : 'repeat(1,minmax(0,1fr))';
                        })()
                      }}
                    >
                      {/* First Table: Players 1-24 */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-[#232323] rounded-lg">

                        <thead>

                          <tr className="text-white">
                          <th className="px-3 py-2 text-white text-center w-12">
                            {(() => {
                              // Calculate if all displayed rows are selected
                              const bookings = slotBookings[match._id]?.bookings || [];
                              if (bookings.length === 0) return null;
                              
                              const mode = String(match.slotType || '').toLowerCase();
                              const isGrouped = mode.includes('duo') || mode.includes('squad');
                              
                              // Build combined rows to count actual displayed rows
                              type Row = { booking: any; playerName: string; seat: number; isTeamHeader?: boolean; teamNum?: number };
                              const combined: Row[] = [];
                              
                              if (!isGrouped) {
                                bookings.forEach((booking: any) => {
                                  const entries = Object.entries(booking.playerNames || {}).filter(([, n]) => !!n);
                                  if (entries.length === 0) {
                                    combined.push({ booking, playerName: booking.user?.name || '', seat: Number.MAX_SAFE_INTEGER });
                                    return;
                                  }
                                  entries.forEach(([key, name]) => {
                                    const m = String(key).match(/^(?:team[\w]+)-(\d+)$/i);
                                    const seat = m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
                                    combined.push({ booking, playerName: String(name), seat });
                                  });
                                });
                                combined.sort((a, b) => a.seat - b.seat);
                              } else {
                                type Member = { booking: any; playerName: string; teamNum: number; posLetter: string };
                                const groups: Record<string, Member[]> = {};
                                bookings.forEach((booking: any) => {
                                  const entries = Object.entries(booking.playerNames || {}).filter(([, n]) => !!n);
                                  entries.forEach(([key, name]) => {
                                    const m = String(key).match(/^team([A-Za-z]+)-(\d+)$/i);
                                    const posLetter = m ? String(m[1]).toUpperCase() : '?';
                                    const teamNum = m ? parseInt(m[2], 10) : Number.MAX_SAFE_INTEGER;
                                    const k = String(teamNum);
                                    if (!groups[k]) groups[k] = [];
                                    groups[k].push({ booking, playerName: String(name), teamNum, posLetter });
                                  });
                                });
                                const orderedTeams = Object.keys(groups).map(n => parseInt(n, 10)).sort((a, b) => a - b);
                                orderedTeams.forEach((team) => {
                                  combined.push({ booking: null, playerName: '', seat: team, isTeamHeader: true, teamNum: team });
                                  groups[String(team)]
                                    .sort((a, b) => a.posLetter.localeCompare(b.posLetter))
                                    .forEach((member) => {
                                      combined.push({ booking: member.booking, playerName: member.playerName, seat: member.teamNum });
                                    });
                                });
                              }
                              
                              // Count displayed rows (excluding team headers) in first 24
                              const first24 = combined.slice(0, 24);
                              const displayedRows = first24.filter(row => !row.isTeamHeader && row.booking && row.playerName);
                              const selectedRows = displayedRows.filter(row => {
                                if (!row.booking || !row.playerName) return false;
                                const playerKey = getPlayerKey(row.booking._id, row.playerName);
                                return selectedPlayers[match._id]?.has(playerKey) || false;
                              });
                              
                              const allSelected = displayedRows.length > 0 && selectedRows.length === displayedRows.length;
                              
                              return (
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  onChange={(e) => handleSelectAllPlayers(match._id, e.target.checked, displayedRows)}
                                  className="cursor-pointer"
                                />
                              );
                            })()}
                          </th>
                          <th className="px-3 py-2 text-white text-left w-24">Position</th>
                            <th className="px-3 py-2 text-white text-center w-20">No. </th>

                          <th className="px-3 py-2 text-white text-left min-w-[150px]">Player Name</th>

                          <th className="px-3 py-2 text-white text-left w-48">Email</th>

                          <th className="px-3 py-2 text-white text-left w-32">Mobile Number</th>

                            <th className="px-3 py-2 text-white text-center w-20">Kills</th>

                            <th className="px-3 py-2 text-white text-center w-20">Rank</th>

                            <th className="px-3 py-2 text-white text-center w-24">Winnings</th>

                            <th className="px-3 py-2 text-white text-center w-24">Actions</th>

                          </tr>

                        </thead>

                        <tbody>

                          {(slotBookings[match._id]?.bookings?.length > 0) ? (

                            (() => {
                              const mode = String(match.slotType || '').toLowerCase();
                              const isGrouped = mode.includes('duo') || mode.includes('squad');
                              
                              // Build combined rows array
                              type Row = { booking: any; playerName: string; seat: number; isTeamHeader?: boolean; teamNum?: number };
                              const combined: Row[] = [];
                              
                              if (!isGrouped) {
                                // Default flat list
                                slotBookings[match._id].bookings.forEach((booking: any) => {
                                  const entries = Object.entries(booking.playerNames || {}).filter(([, n]) => !!n);
                                  if (entries.length === 0) {
                                    combined.push({ booking, playerName: booking.user?.name || '', seat: Number.MAX_SAFE_INTEGER });
                                    return;
                                  }
                                  entries.forEach(([key, name]) => {
                                    const m = String(key).match(/^(?:team[\w]+)-(\d+)$/i);
                                    const seat = m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
                                    combined.push({ booking, playerName: String(name), seat });
                                  });
                                });
                                combined.sort((a, b) => a.seat - b.seat);
                              } else {
                                // Group Duo/Squad by team number with a team header row
                                type Member = { booking: any; playerName: string; teamNum: number; posLetter: string };
                                const groups: Record<string, Member[]> = {};
                                slotBookings[match._id].bookings.forEach((booking: any) => {
                                  const entries = Object.entries(booking.playerNames || {}).filter(([, n]) => !!n);
                                  entries.forEach(([key, name]) => {
                                    const m = String(key).match(/^team([A-Za-z]+)-(\d+)$/i);
                                    const posLetter = m ? String(m[1]).toUpperCase() : '?';
                                    const teamNum = m ? parseInt(m[2], 10) : Number.MAX_SAFE_INTEGER;
                                    const k = String(teamNum);
                                    if (!groups[k]) groups[k] = [];
                                    groups[k].push({ booking, playerName: String(name), teamNum, posLetter });
                                  });
                                });
                                const orderedTeams = Object.keys(groups).map(n => parseInt(n, 10)).sort((a, b) => a - b);
                                orderedTeams.forEach((team) => {
                                  combined.push({ booking: null, playerName: '', seat: team, isTeamHeader: true, teamNum: team });
                                  groups[String(team)]
                                    .sort((a, b) => a.posLetter.localeCompare(b.posLetter))
                                    .forEach((member) => {
                                      combined.push({ booking: member.booking, playerName: member.playerName, seat: member.teamNum });
                                    });
                                });
                              }

                              // Split into two arrays: first 24 and remaining
                              const first24 = combined.slice(0, 24);
                              
                              let seq = 0;
                              
                              return (
                                <>
                                  {first24.map((row, i) => {
                                    if (row.isTeamHeader) {
                                      return (
                                        <tr key={`header-${row.teamNum}-first`}>
                                          <td colSpan={10} className="px-3 py-2 text-white bg-[#111] border border-[#333]" style={{ fontWeight: 700 }}>Team-{row.teamNum}</td>
                                        </tr>
                                      );
                                    }
                                    seq += 1;
                                    return (
                                      <BookingTableRow
                                        key={(row.booking?._id || 'b') + '-first-' + i}
                                        booking={row.booking}
                                        idx={seq}
                                        playerName={row.playerName}
                                        onSave={(winnerId, stats) => handleUpdatePlayerStats(winnerId, stats)}
                                        winnersBySlot={winnersBySlot}
                                        onWinnerChange={fetchCompletedMatches}
                                        slotId={match._id}
                                        perKill={match.perKill}
                                        firstwin={match.firstwin}
                                        secwin={match.secwin}
                                        thirdwin={match.thirdwin}
                                        isSelected={(() => {
                                          if (!row.booking || !row.playerName) return false;
                                          const playerKey = getPlayerKey(row.booking._id, row.playerName);
                                          return selectedPlayers[match._id]?.has(playerKey) || false;
                                        })()}
                                        isRefunded={(() => {
                                          if (!row.booking || !row.playerName) return false;
                                          const playerKey = getPlayerKey(row.booking._id, row.playerName);
                                          return refundedPlayers[match._id]?.has(playerKey) || false;
                                        })()}
                                        onCheckboxChange={(checked) => handlePlayerCheckboxChange(match._id, row.booking?._id, row.playerName, checked)}
                                      />
                                    );
                                  })}
                                  {first24.length === 0 && (
                                    <tr>
                                      <td colSpan={10} className="text-center text-gray-400">No players in this range.</td>
                                    </tr>
                                  )}
                                </>
                              );
                            })()

                          ) : (

                            <tr>

                              <td colSpan={10} className="text-center text-gray-400">No players booked for this match.</td>

                            </tr>

                          )}

                        </tbody>

                      </table>

                    </div>

                      {/* Second Table: Players 25+ (render only when exists) */}
                      {(() => {
                        if (!(slotBookings[match._id]?.bookings?.length > 0)) return null;
                              const mode = String(match.slotType || '').toLowerCase();
                              const isGrouped = mode.includes('duo') || mode.includes('squad');
                              type Row = { booking: any; playerName: string; seat: number; isTeamHeader?: boolean; teamNum?: number };
                              const combined: Row[] = [];
                              if (!isGrouped) {
                                slotBookings[match._id].bookings.forEach((booking: any) => {
                                  const entries = Object.entries(booking.playerNames || {}).filter(([, n]) => !!n);
                                  if (entries.length === 0) {
                                    combined.push({ booking, playerName: booking.user?.name || '', seat: Number.MAX_SAFE_INTEGER });
                                    return;
                                  }
                                  entries.forEach(([key, name]) => {
                                    const m = String(key).match(/^(?:team[\w]+)-(\d+)$/i);
                                    const seat = m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
                                    combined.push({ booking, playerName: String(name), seat });
                                  });
                                });
                                combined.sort((a, b) => a.seat - b.seat);
                              } else {
                                type Member = { booking: any; playerName: string; teamNum: number; posLetter: string };
                                const groups: Record<string, Member[]> = {};
                                slotBookings[match._id].bookings.forEach((booking: any) => {
                                  const entries = Object.entries(booking.playerNames || {}).filter(([, n]) => !!n);
                                  entries.forEach(([key, name]) => {
                                    const m = String(key).match(/^team([A-Za-z]+)-(\d+)$/i);
                                    const posLetter = m ? String(m[1]).toUpperCase() : '?';
                                    const teamNum = m ? parseInt(m[2], 10) : Number.MAX_SAFE_INTEGER;
                                    const k = String(teamNum);
                                    if (!groups[k]) groups[k] = [];
                                    groups[k].push({ booking, playerName: String(name), teamNum, posLetter });
                                  });
                                });
                                const orderedTeams = Object.keys(groups).map(n => parseInt(n, 10)).sort((a, b) => a - b);
                                orderedTeams.forEach((team) => {
                                  combined.push({ booking: null, playerName: '', seat: team, isTeamHeader: true, teamNum: team });
                                  groups[String(team)]
                                    .sort((a, b) => a.posLetter.localeCompare(b.posLetter))
                                    .forEach((member) => {
                                      combined.push({ booking: member.booking, playerName: member.playerName, seat: member.teamNum });
                                    });
                                });
                              }
                        const remaining = combined.slice(24);
                        if (remaining.length === 0) return null; // Do not render second table if empty
                        let seq = 24;
                              return (
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-[#232323] rounded-lg">
                              <thead>
                                <tr className="text-white">
                                  <th className="px-3 py-2 text-white text-center w-12">
                                    {(() => {
                                      // Calculate if all displayed rows are selected (for second table)
                                      const bookings = slotBookings[match._id]?.bookings || [];
                                      if (bookings.length === 0) return null;
                                      
                                      const mode = String(match.slotType || '').toLowerCase();
                                      const isGrouped = mode.includes('duo') || mode.includes('squad');
                                      
                                      type Row = { booking: any; playerName: string; seat: number; isTeamHeader?: boolean; teamNum?: number };
                                      const combined: Row[] = [];
                                      
                                      if (!isGrouped) {
                                        bookings.forEach((booking: any) => {
                                          const entries = Object.entries(booking.playerNames || {}).filter(([, n]) => !!n);
                                          if (entries.length === 0) {
                                            combined.push({ booking, playerName: booking.user?.name || '', seat: Number.MAX_SAFE_INTEGER });
                                            return;
                                          }
                                          entries.forEach(([key, name]) => {
                                            const m = String(key).match(/^(?:team[\w]+)-(\d+)$/i);
                                            const seat = m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
                                            combined.push({ booking, playerName: String(name), seat });
                                          });
                                        });
                                        combined.sort((a, b) => a.seat - b.seat);
                                      } else {
                                        type Member = { booking: any; playerName: string; teamNum: number; posLetter: string };
                                        const groups: Record<string, Member[]> = {};
                                        bookings.forEach((booking: any) => {
                                          const entries = Object.entries(booking.playerNames || {}).filter(([, n]) => !!n);
                                          entries.forEach(([key, name]) => {
                                            const m = String(key).match(/^team([A-Za-z]+)-(\d+)$/i);
                                            const posLetter = m ? String(m[1]).toUpperCase() : '?';
                                            const teamNum = m ? parseInt(m[2], 10) : Number.MAX_SAFE_INTEGER;
                                            const k = String(teamNum);
                                            if (!groups[k]) groups[k] = [];
                                            groups[k].push({ booking, playerName: String(name), teamNum, posLetter });
                                          });
                                        });
                                        const orderedTeams = Object.keys(groups).map(n => parseInt(n, 10)).sort((a, b) => a - b);
                                        orderedTeams.forEach((team) => {
                                          combined.push({ booking: null, playerName: '', seat: team, isTeamHeader: true, teamNum: team });
                                          groups[String(team)]
                                            .sort((a, b) => a.posLetter.localeCompare(b.posLetter))
                                            .forEach((member) => {
                                              combined.push({ booking: member.booking, playerName: member.playerName, seat: member.teamNum });
                                            });
                                        });
                                      }
                                      
                                      const remaining = combined.slice(24);
                                      const displayedRows = remaining.filter(row => !row.isTeamHeader && row.booking && row.playerName);
                                      const selectedRows = displayedRows.filter(row => {
                                        if (!row.booking || !row.playerName) return false;
                                        const playerKey = getPlayerKey(row.booking._id, row.playerName);
                                        return selectedPlayers[match._id]?.has(playerKey) || false;
                                      });
                                      
                                      const allSelected = displayedRows.length > 0 && selectedRows.length === displayedRows.length;
                                      
                                      return (
                                        <input
                                          type="checkbox"
                                          checked={allSelected}
                                          onChange={(e) => handleSelectAllPlayers(match._id, e.target.checked, displayedRows)}
                                          className="cursor-pointer"
                                        />
                                      );
                                    })()}
                                  </th>
                                  <th className="px-3 py-2 text-white text-left w-24">Position</th>
                                  <th className="px-3 py-2 text-white text-center w-20">No. </th>
                                  <th className="px-3 py-2 text-white text-left min-w-[150px]">Player Name</th>
                                  <th className="px-3 py-2 text-white text-left w-48">Email</th>
                                  <th className="px-3 py-2 text-white text-left w-32">Mobile Number</th>
                                  <th className="px-3 py-2 text-white text-center w-20">Kills</th>
                                  <th className="px-3 py-2 text-white text-center w-20">Rank</th>
                                  <th className="px-3 py-2 text-white text-center w-24">Winnings</th>
                                  <th className="px-3 py-2 text-white text-center w-24">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                  {remaining.map((row, i) => {
                                    if (row.isTeamHeader) {
                                      return (
                                        <tr key={`header-${row.teamNum}-second`}>
                                          <td colSpan={10} className="px-3 py-2 text-white bg-[#111] border border-[#333]" style={{ fontWeight: 700 }}>Team-{row.teamNum}</td>
                                        </tr>
                                      );
                                    }
                                    seq += 1;
                                    return (
                                      <BookingTableRow
                                        key={(row.booking?._id || 'b') + '-second-' + i}
                                        booking={row.booking}
                                        idx={seq}
                                        playerName={row.playerName}
                                        onSave={(winnerId, stats) => handleUpdatePlayerStats(winnerId, stats)}
                                        winnersBySlot={winnersBySlot}
                                        onWinnerChange={fetchCompletedMatches}
                                        slotId={match._id}
                                        perKill={match.perKill}
                                        firstwin={match.firstwin}
                                        secwin={match.secwin}
                                        thirdwin={match.thirdwin}
                                        isSelected={(() => {
                                          if (!row.booking || !row.playerName) return false;
                                          const playerKey = getPlayerKey(row.booking._id, row.playerName);
                                          return selectedPlayers[match._id]?.has(playerKey) || false;
                                        })()}
                                        isRefunded={(() => {
                                          if (!row.booking || !row.playerName) return false;
                                          const playerKey = getPlayerKey(row.booking._id, row.playerName);
                                          return refundedPlayers[match._id]?.has(playerKey) || false;
                                        })()}
                                        onCheckboxChange={(checked) => handlePlayerCheckboxChange(match._id, row.booking?._id, row.playerName, checked)}
                                      />
                                    );
                                  })}
                        </tbody>
                      </table>
                    </div>
                        );
                      })()}
                  </div>

                  </div>

                </div>

              ));

            })()

          )}

        </div>

      </div>

      {/* Player Management Modal */}

      <Dialog open={showPlayersModal} onOpenChange={setShowPlayersModal}>

        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#0F0F0F] border border-[#2A2A2A] text-white overflow-y-auto">

          <DialogHeader>

            <div className="flex items-center gap-3">

              <div className="p-2 bg-gradient-to-r from-[#FF4D4F] to-[#FF7875] rounded-lg">

                <Users className="h-6 w-6 text-white" />

              </div>

              <div>

                <DialogTitle className="text-xl font-bold text-white">

                  Player Management

                </DialogTitle>

                <p className="text-gray-400 text-sm">

                  Update player statistics and calculate winnings

                </p>

              </div>

            </div>

          </DialogHeader>



          {selectedMatchForPlayers && slotBookings[selectedMatchForPlayers._id] && (

            <div className="space-y-6">

              {/* Match Info */}

              <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2A2A2A]">

                <h3 className="text-white font-semibold mb-2">

                  {selectedMatchForPlayers.matchTitle || selectedMatchForPlayers.slotType.toUpperCase()} TOURNAMENT

                </h3>

                <div className="grid grid-cols-3 gap-4 text-sm">

                  <div>

                    <span className="text-yellow-500">Entry Fee: </span>

                    <span className="text-white">₹{selectedMatchForPlayers.entryFee}</span>

                  </div>

                  <div>

                    <span className="text-yellow-500">Per Kill: </span>

                    <span className="text-white">₹{selectedMatchForPlayers.perKill}</span>

                  </div>

                  <div>

                    <span className="text-yellow-500">Winner Prize: </span>

                    <span className="text-white">₹{selectedMatchForPlayers.totalWinningPrice}</span>

                  </div>

                </div>

              </div>



              {/* Players List */}

              <div className="space-y-4">

                <h4 className="text-white font-semibold">

                  Registered Players {(slotBookings[selectedMatchForPlayers?._id]?.bookings?.length ?? 0) > 0 ? `(${slotBookings[selectedMatchForPlayers._id].bookings.length})` : ''}

                </h4>



                <div className="space-y-3">

                  {(slotBookings[selectedMatchForPlayers?._id]?.bookings ?? []).map((booking: Booking, index: number) => (

                    <PlayerStatCard

                      key={booking._id}

                      booking={booking}

                      index={index}

                      matchInfo={selectedMatchForPlayers}

                      onUpdateStats={handleUpdatePlayerStats}

                    />

                  ))}

                </div>

              </div>

            </div>

          )}

        </DialogContent>

      </Dialog>

      {/* Cancel Match Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] bg-[#0F0F0F] border border-[#2A2A2A] text-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Cancel Match
            </DialogTitle>
          </DialogHeader>
          
          {selectedMatchForCancel && (
            <div className="space-y-6 py-4">
              {/* Match Info */}
              <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2A2A2A]">
                <h3 className="text-white font-semibold mb-2">
                  {selectedMatchForCancel.matchTitle || selectedMatchForCancel.slotType.toUpperCase()} TOURNAMENT
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-yellow-500">Entry Fee: </span>
                    <span className="text-white">₹{selectedMatchForCancel.entryFee}</span>
                  </div>
                  <div>
                    <span className="text-yellow-500">Match Time: </span>
                    <span className="text-white">{formatDateTime(selectedMatchForCancel.matchTime)}</span>
                  </div>
                </div>
              </div>

              {/* Cancel Reason */}
              <div className="space-y-2">
                <label className="text-white font-semibold">
                  Cancel Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter the reason for cancelling this match..."
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4D4F] min-h-[100px]"
                  rows={4}
                />
              </div>

              {/* Selected Players for Refund */}
              <div className="space-y-2">
                <label className="text-white font-semibold">
                  Select Players to Refund Entry Fee
                </label>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4 max-h-[300px] overflow-y-auto">
                  {(() => {
                    // Get all selected players and display them individually
                    const selectedPlayerKeys = selectedPlayers[selectedMatchForCancel._id] || new Set();
                    const playersList: Array<{ playerKey: string; booking: Booking; playerName: string }> = [];
                    
                    slotBookings[selectedMatchForCancel._id]?.bookings?.forEach((booking) => {
                      const playerNames = Object.entries(booking.playerNames || {}).filter(([, n]) => !!n);
                      if (playerNames.length === 0) {
                        // If no player names, use user name
                        const playerName = booking.user?.name || 'Unknown Player';
                        const playerKey = getPlayerKey(booking._id, playerName);
                        if (selectedPlayerKeys.has(playerKey)) {
                          playersList.push({ playerKey, booking, playerName });
                        }
                      } else {
                        // Each player name is a separate entry
                        playerNames.forEach(([_, name]) => {
                          const playerName = String(name);
                          const playerKey = getPlayerKey(booking._id, playerName);
                          if (selectedPlayerKeys.has(playerKey)) {
                            playersList.push({ playerKey, booking, playerName });
                          }
                        });
                      }
                    });
                    
                    return playersList.length > 0 ? (
                      playersList.map(({ playerKey, booking, playerName }) => (
                        <div key={playerKey} className="flex items-center gap-3 py-2 border-b border-[#2A2A2A] last:border-b-0">
                          <input
                            type="checkbox"
                            checked={selectedPlayersForRefund[playerKey] || false}
                            onChange={(e) => {
                              setSelectedPlayersForRefund(prev => ({
                                ...prev,
                                [playerKey]: e.target.checked
                              }));
                            }}
                            className="cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="text-white font-medium">{playerName}</div>
                            <div className="text-gray-400 text-sm">
                              {booking.user?.email || 'N/A'} • {booking.user?.phone || 'N/A'}
                            </div>
                            <div className="text-yellow-500 text-sm">
                              Entry Fee: ₹{booking.totalAmount || selectedMatchForCancel.entryFee}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-center py-4">No players selected</div>
                    );
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setSelectedPlayersForRefund({});
                  }}
                  className="border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
                  disabled={cancelling}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCancelMatch}
                  disabled={cancelling || !cancelReason.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Match & Refund'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sidebar hidden when embedded from AdminDashboard with a specific match */}

      {/* Sidebar removed per requirement - showing only header and content */}

    </div>

  );

};



export default AdminWinnerDashboard;



// Table row component for bookings table

interface BookingTableRowProps {

  booking: Booking;

  idx: number;

  playerName: string;

  onSave: (winnerId: string, stats: {

    playerName: string;

    gameName: string;

    rank: number;

    winningPrice: number;

    kills: number;

    slotId: string;

  }) => void;

  winnersBySlot?: { [slotId: string]: Winner[] };

  onWinnerChange?: () => void;

  slotId: string;

  perKill?: number;

  firstwin?: number;

  secwin?: number;

  thirdwin?: number;

  isSelected?: boolean;

  isRefunded?: boolean;

  onCheckboxChange?: (checked: boolean) => void;

}



const BookingTableRow: React.FC<BookingTableRowProps> = ({ booking, idx, playerName, onSave, winnersBySlot, onWinnerChange, slotId, perKill = 0, firstwin = 0, secwin = 0, thirdwin = 0, isSelected = false, isRefunded = false, onCheckboxChange }) => {

  // Debug: log the phone number for each booking row

  const [kills, setKills] = React.useState(booking.gameStats?.kills || 0);

  const [rank, setRank] = React.useState(booking.gameStats?.position || 0);

  const [winningPrice, setWinningPrice] = React.useState(booking.gameStats?.winnings || 0);

  const [loading, setLoading] = React.useState(false);



  const calc = React.useCallback((k: number, r: number) => {

    let bonus = 0;

    if (r === 1) bonus = firstwin; else if (r === 2) bonus = secwin; else if (r === 3) bonus = thirdwin;

    // Split positional bonus among players sharing that rank.
    // Preview includes this pending save, so use existing winners count + 1.
    let splitBy = 1;
    const list = winnersBySlot?.[slotId] || [];
    if (Array.isArray(list)) {
      const sameRankCount = list.filter((w: any) => Number(w.rank) === Number(r)).length;
      splitBy = Math.max(1, (sameRankCount + 1));
    }
    const share = bonus / splitBy;

    return Math.max(0, Math.floor(k * (perKill || 0) + share));

  }, [perKill, firstwin, secwin, thirdwin, winnersBySlot, slotId]);



  React.useEffect(() => {

    setWinningPrice(calc(kills, rank));

  }, [kills, rank, calc]);



  // Get userId from booking

  let userId = '';

  if (booking.user && booking.user._id) {

    userId = booking.user._id;

  } else if (booking.userId) {

    userId = booking.userId;

  }



  // Check if this player name already exists in winners for this slot

  const isPlayerAlreadyWinner = React.useMemo(() => {

    if (!winnersBySlot || !winnersBySlot[slotId]) return false;

    return winnersBySlot[slotId].some(winner =>

      winner.playerName.toLowerCase().trim() === playerName.toLowerCase().trim()

    );

  }, [winnersBySlot, slotId, playerName]);



  // Determine booked position for this player from playerNames keys (e.g., { teamB-48: "name" })

  const bookedPosition = React.useMemo(() => {
    try {
      const entries = Object.entries(booking.playerNames || {});
      for (const [posKey, name] of entries) {
        if ((String(name) || '').toLowerCase().trim() === playerName.toLowerCase().trim()) {
          const m = String(posKey).match(/^team([A-Za-z]+)-(\d+)$/i);
          if (m) {
            // Convert from "Team-A 1" style to desired "Team-1 (A)"
            return `Team-${m[2]} (${m[1].toUpperCase()})`;
          }
          // Fallback formatting: try to convert common patterns to Team-<num> (<letter>)
          const m2 = String(posKey).match(/^team\s*(\d+)\s*[-_ ]\s*([A-Za-z])$/i);
          if (m2) {
            return `Team-${m2[1]} (${m2[2].toUpperCase()})`;
          }
          return String(posKey)
            .replace(/^team\s*(\d+)\s*[-_ ]\s*([A-Za-z])$/i, (_s, n, l) => `Team-${n} (${String(l).toUpperCase()})`)
            .replace(/^team/i, 'Team-')
            .toUpperCase();
        }
      }
      // Fallback to playerIndex seat number if available
      const values = Object.values(booking.playerNames || {});
      const idx = values.findIndex(n => (String(n) || '').toLowerCase().trim() === playerName.toLowerCase().trim());
      const anyBooking: any = booking as any;
      if (idx >= 0 && Array.isArray(anyBooking.playerIndex)) {
        const seat = anyBooking.playerIndex[idx];
        if (seat) return `Seat ${seat}`;
      }
      return '';
    } catch {
      return '';
    }
  }, [booking, playerName]);



  // Resolve team position for this player from booking.selectedPositions, if available

  const resolvedPosition = React.useMemo(() => {

    try {

      const positions = booking.selectedPositions || {} as any;

      // Attempt to find the team (teamA, teamB, etc.) that contains this player position by index

      // If playerNames mapping exists, use index to map to same order

      const namesEntries = Object.entries(booking.playerNames || {});

      let idxInNames = namesEntries.findIndex(([, name]) => (name || '').toLowerCase().trim() === playerName.toLowerCase().trim());

      if (idxInNames === -1) idxInNames = 0;

      const teamKey = Object.keys(positions)[0];

      const list = teamKey ? (positions as any)[teamKey] : [];

      const pos = Array.isArray(list) ? (list[idxInNames] || list[0]) : undefined;

      return pos ? `${teamKey?.toUpperCase()}-${pos}` : '';

    } catch {

      return '';

    }

  }, [booking, playerName]);



  const handleSave = async () => {

    if (!slotId) {

      alert('slotId is missing for this booking. Cannot update winner.');

      return;

    }

    if (!playerName) {

      alert('playerName is required to create a winner.');

      return;

    }

    if (isPlayerAlreadyWinner) {

      alert('This player is already added as a winner. Cannot add duplicate entries.');

      return;

    }

    setLoading(true);

    const gameName = 'Free Fire';

    try {

      const token = localStorage.getItem('adminToken');

      if (!token) {

        alert('Not authenticated');

        setLoading(false);

        return;

      }

      // Determine split by including this new winner
      const existingForRank = Array.isArray(winnersBySlot?.[slotId]) ? winnersBySlot![slotId].filter((w: any) => Number(w.rank) === Number(rank)) : [];
      const splitBy = Math.max(1, (existingForRank.length + 1));
      let baseBonus = 0;
      if (rank === 1) baseBonus = firstwin; else if (rank === 2) baseBonus = secwin; else if (rank === 3) baseBonus = thirdwin;
      const share = baseBonus / splitBy;

      // Create a winner with split amount applied
      const winnerPayload = {

        playerName,

        gameName,

        rank,

        winningPrice: Math.max(0, Math.floor(kills * (perKill || 0) + share)),

        kills,

        slotId,

        userId // Pass userId to backend

      };

      const postRes = await fetch(`${import.meta.env.VITE_API_URL}/api/winners`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          'Authorization': `Bearer ${token}`

        },

        body: JSON.stringify(winnerPayload)

      });

      try {

        const postData = await postRes.json();

        if (postRes.ok && postData._id) {

          // Update all winners of this rank to the same split
          const targets = Array.isArray(winnersBySlot?.[slotId]) ? winnersBySlot![slotId].filter((w: any) => Number(w.rank) === Number(rank)) : [];
          const allTargets = [...targets, { _id: postData._id, kills }];
          for (const t of allTargets) {
            try {
              await fetch(`${import.meta.env.VITE_API_URL}/api/winners/${t._id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ winningPrice: Math.max(0, Math.floor((Number(t.kills) || 0) * (perKill || 0) + share)), rank })
              });
            } catch { }
          }

          if (onWinnerChange) onWinnerChange();

        } else {

          alert('Failed to create winner: ' + (postData.error || 'Unknown error'));

        }

      } catch (e) {

        alert('Error parsing winner create response');

      }

    } catch (err) {

      alert('Error saving winner');

    } finally {

      setLoading(false);

    }

  };



  // ...existing code...

  return (

    <tr className={`border-b border-[#333] ${isPlayerAlreadyWinner ? 'bg-red-900/20 opacity-60' : ''} ${isRefunded ? 'bg-gray-900/40 opacity-50' : ''}`}>

      {/* Checkbox column */}
      <td className="px-3 py-2 text-center">
        {onCheckboxChange && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onCheckboxChange(e.target.checked)}
            className="cursor-pointer"
            disabled={isPlayerAlreadyWinner || isRefunded}
          />
        )}
      </td>

      {/* Position first to match header */}
      <td className="px-3 py-2 text-white">{bookedPosition}</td>

      {/* No. */}
      <td className="px-3 py-2 text-center text-white">{idx}</td>

      <td className="px-3 py-2 text-white">

        <div className="flex items-center gap-2">

          <span className="truncate">{playerName}</span>

          {/* {isPlayerAlreadyWinner && (

            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded whitespace-nowrap">
              Already Winner
            </span>
          )} */}

        </div>

      </td>

      {/* Email */}
      <td className="px-3 py-2 text-white">{booking.user?.email || "N/A"}</td>

      {/* Player team position moved to first column above */}

      <td className="px-3 py-2 text-white">{booking.user?.phone || "N/A"}</td>

      <td className="px-3 py-2 text-center">

        <input

          type="number"

          className={`w-16 rounded px-2 py-1 border text-center ${isPlayerAlreadyWinner || isRefunded

            ? 'bg-[#2A2A2A] text-gray-500 border-[#555] cursor-not-allowed'

            : 'bg-[#181818] text-white border-[#333]'}`}

          value={kills}

          min={0}

          onChange={e => setKills(Number(e.target.value))}

          disabled={isPlayerAlreadyWinner || isRefunded}

        />

      </td>

      <td className="px-3 py-2 text-center">

        <input

          type="number"

          className={`w-16 rounded px-2 py-1 border text-center ${isPlayerAlreadyWinner || isRefunded

            ? 'bg-[#2A2A2A] text-gray-500 border-[#555] cursor-not-allowed'

            : 'bg-[#181818] text-white border-[#333]'}`}

          value={rank}

          min={0}

          onChange={e => setRank(Number(e.target.value))}

          placeholder="Rank"

          disabled={isPlayerAlreadyWinner || isRefunded}

        />

      </td>

      <td className="px-3 py-2 text-center">

        <input

          type="number"

          className={`w-24 rounded px-2 py-1 border text-center ${isPlayerAlreadyWinner || isRefunded

            ? 'bg-[#2A2A2A] text-gray-500 border-[#555] cursor-not-allowed'

            : 'bg-[#181818] text-white border-[#333]'}`}

          value={winningPrice}

          min={0}

          onChange={e => setWinningPrice(Number(e.target.value))}

          disabled={isPlayerAlreadyWinner || isRefunded}

        />

      </td>

      <td className="px-3 py-2 text-center">

        <button

          className={`px-3 py-1 rounded text-sm ${isPlayerAlreadyWinner || isRefunded

            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'

            : 'bg-[#52C41A] hover:bg-[#73D13D] text-white'

            }`}

          onClick={handleSave}

          disabled={loading || isPlayerAlreadyWinner || isRefunded}

        >

          {loading ? 'Saving...' : isRefunded ? 'Refunded' : isPlayerAlreadyWinner ? 'Already Winner' : 'Save'}

        </button>

      </td>

    </tr>

  );

};

