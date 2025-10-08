
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
}

const CreditAllWinningsButton: React.FC<CreditAllWinningsButtonProps> = ({ winners, onSuccess }) => {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const handleCreditAll = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    let credited = 0, failed = 0;
    for (const winner of winners) {
      if (!winner.userId || winner.walletCredited) continue;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/add-winning`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId: winner.userId, amount: winner.winningPrice, winnerId: winner._id })
        });
        const data = await res.json();
        if (res.ok && data.success) credited++;
        else failed++;
      } catch (e) {
        failed++;
      }
    }
    setLoading(false);
    if (credited > 0) toast({ title: 'Success', description: `${credited} winnings credited.`, variant: 'default' });
    if (failed > 0) toast({ title: 'Error', description: `${failed} winnings failed.`, variant: 'destructive' });
    if (onSuccess) onSuccess();
  };

  // Only show if there are uncredited winners
  const hasUncredited = winners.some(w => w.userId && !w.walletCredited);
  if (!hasUncredited) return null;

  return (
    <button
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm mb-2"
      onClick={handleCreditAll}
      disabled={loading}
    >
      {loading ? 'Crediting All...' : 'Credit All Winnings'}
    </button>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | undefined>();

  // Player management states
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [selectedMatchForPlayers, setSelectedMatchForPlayers] = useState<Match | null>(null);
  const [slotBookings, setSlotBookings] = useState<{ [key: string]: { bookings: Booking[] } }>({});
  const [users, setUsers] = useState<any[]>([]); // Store users for phone lookup
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
        let userId = '';
        if (booking.user && booking.user._id) {
          userId = booking.user._id;
        } else if (booking.userId) {
          userId = booking.userId;
        }
        if (!userId) return '';
        const user = users.find(u => String(u._id) === String(userId));
        return user?.phone || '';
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
      const thirdPlaceCoin = Number(matchInfo?.thirdwin) ;

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
              const matchesWithBookings = matches.filter(match => slotBookings[match._id] && slotBookings[match._id].bookings.length > 0);
              const matchesToShow = matchesWithBookings.length > 0 ? matchesWithBookings : matches;

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
                    <CreditAllWinningsButton winners={winnersBySlot[match._id] || []} onSuccess={fetchCompletedMatches} />
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
                                  return Math.max(0, Math.floor(kills * perKill + bonus));
                                }, [match]);

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
                                    <td colSpan={6} className="text-center text-gray-400 py-4">No winners added yet.</td>
                                  </tr>
                                );
                            })()
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center text-gray-400 py-4">No winners added yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Booked Players Table - always visible */}
                  <div className="player-list mt-6">
                    {/* <h4 className="text-white font-semibold mb-2">Booked Players</h4> */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-[#232323] rounded-lg">
                        <thead>
                          <tr className="text-white">
                            <th className="px-3 py-2 text-white text-center w-20">Team</th>
                            <th className="px-3 py-2 text-white text-left min-w-[150px]">Player Name</th>
                            <th className="px-3 py-2 text-white text-left w-32">Mobile Number</th>
                            <th className="px-3 py-2 text-white text-center w-20">Kills</th>
                            <th className="px-3 py-2 text-white text-center w-20">Rank</th>
                            <th className="px-3 py-2 text-white text-center w-24">Winnings</th>
                            <th className="px-3 py-2 text-white text-center w-24">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(slotBookings[match._id]?.bookings?.length > 0) ? (
                            slotBookings[match._id].bookings.flatMap((booking, bookingIdx) => {
                              const playerNames = booking.playerNames ? Object.values(booking.playerNames).filter(Boolean) : [];
                              if (playerNames.length === 0) {
                                // fallback to booking.user.name
                                return [
                                  <BookingTableRow
                                    key={booking._id + '-single'}
                                    booking={booking}
                                    idx={bookingIdx + 1}
                                    playerName={booking.user?.name || ''}
                                    onSave={(winnerId, stats) => handleUpdatePlayerStats(winnerId, stats)}
                                    winnersBySlot={winnersBySlot}
                                    onWinnerChange={fetchCompletedMatches}
                                    slotId={match._id}
                                  />
                                ];
                              }
                              return playerNames.map((playerName, i) => (
                                <BookingTableRow
                                  key={booking._id + '-' + i}
                                  booking={booking}
                                  idx={bookingIdx + 1}
                                  playerName={playerName}
                                  onSave={(winnerId, stats) => handleUpdatePlayerStats(winnerId, stats)}
                                  winnersBySlot={winnersBySlot}
                                  onWinnerChange={fetchCompletedMatches}
                                  slotId={match._id}
                                  perKill={match.perKill}
                                  firstwin={match.firstwin}
                                  secwin={match.secwin}
                                  thirdwin={match.thirdwin}
                                />
                              ));
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center text-gray-400 py-4">No players booked for this match.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
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
}

const BookingTableRow: React.FC<BookingTableRowProps> = ({ booking, idx, playerName, onSave, winnersBySlot, onWinnerChange, slotId, perKill = 0, firstwin = 0, secwin = 0, thirdwin = 0 }) => {
  // Debug: log the phone number for each booking row
  const [kills, setKills] = React.useState(booking.gameStats?.kills || 0);
  const [rank, setRank] = React.useState(booking.gameStats?.position || 0);
  const [winningPrice, setWinningPrice] = React.useState(booking.gameStats?.winnings || 0);
  const [loading, setLoading] = React.useState(false);

  const calc = React.useCallback((k: number, r: number) => {
    let bonus = 0;
    if (r === 1) bonus = firstwin; else if (r === 2) bonus = secwin; else if (r === 3) bonus = thirdwin;
    return Math.max(0, Math.floor(k * (perKill || 0) + bonus));
  }, [perKill, firstwin, secwin, thirdwin]);

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
      // Always create a winner for this booking
      const winnerPayload = {
        playerName,
        gameName,
        rank,
        winningPrice,
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
    <tr className={`border-b border-[#333] ${isPlayerAlreadyWinner ? 'bg-red-900/20 opacity-60' : ''}`}>
      <td className="px-3 py-2 text-center text-white">Team {idx}</td>
      <td className="px-3 py-2 text-white">
        <div className="flex items-center gap-2">
          <span className="truncate">{playerName}</span>
          {isPlayerAlreadyWinner && (
            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded whitespace-nowrap">
              Already Winner
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2 text-white">{booking.user?.phone || "N/A"}</td>
      <td className="px-3 py-2 text-center">
        <input
          type="number"
          className={`w-16 rounded px-2 py-1 border text-center ${isPlayerAlreadyWinner 
            ? 'bg-[#2A2A2A] text-gray-500 border-[#555] cursor-not-allowed' 
            : 'bg-[#181818] text-white border-[#333]'}`}
          value={kills}
          min={0}
          onChange={e => setKills(Number(e.target.value))}
          disabled={isPlayerAlreadyWinner}
        />
      </td>
      <td className="px-3 py-2 text-center">
        <input
          type="number"
          className={`w-16 rounded px-2 py-1 border text-center ${isPlayerAlreadyWinner 
            ? 'bg-[#2A2A2A] text-gray-500 border-[#555] cursor-not-allowed' 
            : 'bg-[#181818] text-white border-[#333]'}`}
          value={rank}
          min={0}
          onChange={e => setRank(Number(e.target.value))}
          placeholder="Rank"
          disabled={isPlayerAlreadyWinner}
        />
      </td>
      <td className="px-3 py-2 text-center">
        <input
          type="number"
          className={`w-24 rounded px-2 py-1 border text-center ${isPlayerAlreadyWinner 
            ? 'bg-[#2A2A2A] text-gray-500 border-[#555] cursor-not-allowed' 
            : 'bg-[#181818] text-white border-[#333]'}`}
          value={winningPrice}
          min={0}
          onChange={e => setWinningPrice(Number(e.target.value))}
          disabled={isPlayerAlreadyWinner}
        />
      </td>
      <td className="px-3 py-2 text-center">
        <button
          className={`px-3 py-1 rounded text-sm ${
            isPlayerAlreadyWinner 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-[#52C41A] hover:bg-[#73D13D] text-white'
          }`}
          onClick={handleSave}
          disabled={loading || isPlayerAlreadyWinner}
        >
          {loading ? 'Saving...' : isPlayerAlreadyWinner ? 'Already Winner' : 'Save'}
        </button>
      </td>
    </tr>
  );
};
