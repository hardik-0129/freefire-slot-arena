import AnnouncementSender from '../components/AnnouncementSender';
import SendSlotCredentials from "@/components/SendSlotCredentials";
import { KeyRound } from "lucide-react";

import { Mail } from "lucide-react";
import ContactMessagesTable from "@/components/ContactMessagesTable";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import GameTypeImage from "@/components/GameTypeImage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import WithdrawalManagement from "@/components/WithdrawalManagement";
import AdminWinnerDashboard from "./AdminWinnerDashboard";
import {
  LayoutDashboard,
  Users,
  GamepadIcon,
  DollarSign,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Image,
  Edit,
  Trash,
  Trophy
} from "lucide-react";

interface SlotFormData {
  firstwin: string;
  secwin: string;
  thirdwin: string;
  slotType: string;
  entryFee: string;
  matchTime: string;
  customStartInMinutes: string;
  perKill: string;
  totalWinningPrice: string;
  maxBookings: string;
  remainingBookings: string;
  // Enhanced match information
  matchTitle: string;
  matchDescription: string;
  mapName: string;
  gameMode: string;
  tournamentName: string;
  hostName: string;
  maxPlayers: string;
  registrationDeadline: string;
  rules: string;
  prizeDistribution: string;
  contactInfo: string;
  streamLink: string;
  discordLink: string;
  specialRules: string;
  banList: string;
  bannerImage: string; // Add banner image field
}

interface PlayerStats {
  kills: number;
  position: number;
  winnings: number;
}

// Player Statistics Card Component
const PlayerStatCard = ({ booking, index, slotInfo, onUpdateStats }: {
  booking: any;
  index: number;
  slotInfo: any;
  onUpdateStats: (bookingId: string, stats: PlayerStats) => void;
}) => {
  const [stats, setStats] = useState<PlayerStats>({
    kills: 0,
    position: 0,
    winnings: 0
  });
  const [isEditing, setIsEditing] = useState(false);

  const calculateWinnings = (kills: number, position: number) => {
    let winnings = kills * slotInfo.perKill;

    // Add position-based winnings
    if (position === 1) {
      winnings += Math.floor(slotInfo.totalWinningPrice * 0.5); // 50% for 1st place
    } else if (position === 2) {
      winnings += Math.floor(slotInfo.totalWinningPrice * 0.3); // 30% for 2nd place
    } else if (position === 3) {
      winnings += Math.floor(slotInfo.totalWinningPrice * 0.2); // 20% for 3rd place
    }

    return winnings;
  };

  const handleSaveStats = () => {
    const calculatedWinnings = calculateWinnings(stats.kills, stats.position);
    const finalStats = { ...stats, winnings: calculatedWinnings };
    onUpdateStats(booking._id, finalStats);
    setIsEditing(false);
  };

  return (
    <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2A2A2A]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF4D4F] rounded-full flex items-center justify-center text-white font-bold text-sm">
            {index + 1}
          </div>
          <div>
            <h5 className="text-white font-semibold">{booking.user.name}</h5>
            <p className="text-gray-400 text-sm">Entry: ₹{booking.totalAmount}</p>
          </div>
        </div>
        <Button
          size="sm"
          className={`${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-3 py-1 text-xs`}
          onClick={isEditing ? handleSaveStats : () => setIsEditing(true)}
        >
          {isEditing ? 'Save Stats' : 'Edit Stats'}
        </Button>
      </div>

      {/* Free Fire Names */}
      {booking.playerNames && (
        <div className="mb-3">
          <p className="text-gray-400 text-xs mb-1">FF Names:</p>
          <div className="flex flex-wrap gap-1">
            {Object.values(booking.playerNames).map((playerName: any, nameIndex: number) => (
              <span key={nameIndex} className="bg-[#2A2A2A] px-2 py-1 rounded text-xs text-white">
                {String(playerName)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Player Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-gray-400 text-xs">Kills</label>
          {isEditing ? (
            <Input
              type="number"
              min="0"
              value={stats.kills}
              onChange={(e) => setStats({ ...stats, kills: Number(e.target.value) })}
              className="text-white bg-[#2A2A2A] border-[#3A3A3A] h-8 text-sm"
            />
          ) : (
            <div className="text-white font-semibold">{stats.kills}</div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-gray-400 text-xs">Position</label>
          {isEditing ? (
            <Input
              type="number"
              min="0"
              value={stats.position}
              onChange={(e) => setStats({ ...stats, position: Number(e.target.value) })}
              className="text-white bg-[#2A2A2A] border-[#3A3A3A] h-8 text-sm"
            />
          ) : (
            <div className="text-white font-semibold">
              {stats.position > 0 ? `#${stats.position}` : '-'}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-gray-400 text-xs">Winnings</label>
          <div className="text-yellow-500 font-semibold">
            ₹{isEditing ? calculateWinnings(stats.kills, stats.position) : stats.winnings}
          </div>
        </div>
      </div>
    </div>
  );
};

const initialFormData: SlotFormData = {
  firstwin: "",
  secwin: "",
  thirdwin: "",
  slotType: "Solo",
  entryFee: "",
  matchTime: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
  customStartInMinutes: "10",
  perKill: "",
  totalWinningPrice: "",
  maxBookings: "",
  remainingBookings: "",
  // Enhanced match information defaults
  matchTitle: "",
  matchDescription: "",
  mapName: "Bermuda",
  gameMode: "Classic",
  tournamentName: "#ALPHALIONS",
  hostName: "ALPHA LIONS",
  maxPlayers: "48",
  registrationDeadline: new Date().toISOString().slice(0, 16),
  rules: "Standard Free Fire rules apply",
  prizeDistribution: "Winner takes all",
  contactInfo: "",
  streamLink: "",
  discordLink: "",
  specialRules: "RYDEN BAN",
  banList: "RYDEN",
  bannerImage: "" // Add banner image field
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [slots, setSlots] = useState([]);
  const [users, setUsers] = useState([]);
  const [slotBookings, setSlotBookings] = useState({});
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showTournamentRules, setShowTournamentRules] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [formData, setFormData] = useState<SlotFormData>(initialFormData);
  const [showEditSlot, setShowEditSlot] = useState(false);
  const [editData, setEditData] = useState<any>({});
  // Edit banner image state
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null);
  const [editBannerPreview, setEditBannerPreview] = useState<string>('');

  // Save Rules handler
  const handleSaveRules = async () => {
    if (!selectedSlotId) {
      toast({ title: 'No slot selected', description: 'Please select a slot to update rules.', variant: 'destructive' });
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots/${selectedSlotId}/tournament-rules`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ rules: formData.rules })
      });
      if (response.ok) {
        toast({ title: 'Rules updated', description: 'Tournament rules updated successfully.' });
        setShowTournamentRules(false);
      } else {
        throw new Error('Failed to update rules');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update rules', variant: 'destructive' });
    }
  };

  // Open Edit Modal with selected slot data
  const handleOpenEditSlot = (slot: any) => {
    setSelectedSlotId(slot._id);
    setEditData({
      matchTitle: slot.matchTitle || '',
      slotType: slot.slotType || 'Solo',
      entryFee: slot.entryFee ?? '',
      perKill: slot.perKill ?? '',
      totalWinningPrice: slot.totalWinningPrice ?? '',
      matchTime: slot.matchTime ? new Date(slot.matchTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      bannerImage: slot.bannerImage || '',
      status: slot.status || 'upcoming'
    });
    // Reset edit banner state
    setEditBannerFile(null);
    setEditBannerPreview('');
    setShowEditSlot(true);
  };

  // Submit Edit API
  const handleUpdateSlot = async () => {
    if (!selectedSlotId) return;
    try {
      const token = localStorage.getItem('adminToken');
      let response: Response;
      if (editBannerFile) {
        const form = new FormData();
        form.append('matchTitle', editData.matchTitle || '');
        form.append('slotType', editData.slotType || 'Solo');
        if (editData.entryFee !== '') form.append('entryFee', String(Number(editData.entryFee)));
        if (editData.perKill !== '') form.append('perKill', String(Number(editData.perKill)));
        if (editData.totalWinningPrice !== '') form.append('totalWinningPrice', String(Number(editData.totalWinningPrice)));
        if (editData.matchTime) form.append('matchTime', editData.matchTime);
        if (editData.status) form.append('status', editData.status);
        form.append('bannerImage', editBannerFile);

        response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots/${selectedSlotId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: form
        });
      } else {
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots/${selectedSlotId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...editData,
            // ensure numbers are numbers if provided as strings
            entryFee: editData.entryFee === '' ? undefined : Number(editData.entryFee),
            perKill: editData.perKill === '' ? undefined : Number(editData.perKill),
            totalWinningPrice: editData.totalWinningPrice === '' ? undefined : Number(editData.totalWinningPrice)
          })
        });
      }

      if (response.ok) {
        toast({ title: 'Updated', description: 'Match updated successfully.' });
        setShowEditSlot(false);
        await fetchSlots();
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.msg || 'Failed to update match');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || 'Failed to update match' });
    }
  };

  // Edit banner file change handler
  const handleEditBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setEditBannerFile(null);
      setEditBannerPreview('');
      return;
    }
    if (!file.type.startsWith('image/')) return;
    setEditBannerFile(file);
    setEditBannerPreview(URL.createObjectURL(file));
  };

  // Banner image state for slot creation
  const [slotBannerFile, setSlotBannerFile] = useState<File | null>(null);
  const [slotBannerPreview, setSlotBannerPreview] = useState<string>('');

  // const [tournamentRulesData, setTournamentRulesData] = useState<TournamentRulesData>({
  //   minimumLevel: 40,
  //   onlyMobileAllowed: true,
  //   maxHeadshotRate: 70,
  //   prohibitedActivities: [
  //     'Using any type of emulator, hack or third-party application',
  //     'Inviting unregistered players',
  //     'Prohibited throwable items: Grenade, smoke, flash freeze, flashbang, etc.',
  //     'Zone Pack is not allowed',
  //     'Double Vector gun is not allowed'
  //   ],
  //   characterSkill: 'Yes',
  //   gunAttributes: 'Yes',
  //   airdropType: 'Yes',
  //   limitedAmmo: 'Yes',
  //   roomIdPasswordTime: 15,
  //   accountNameVerification: true,
  //   teamRegistrationRules: 'If team members accidentally register in different teams, they will still play together',
  //   mustRecordGameplay: true,
  //   screenRecordingRequired: true,
  //   recordFromJoining: true,
  //   penaltySystem: {
  //     violatingRules: 'Penalties',
  //     noRewards: true,
  //     permanentBan: false
  //   }
  // });
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Game Type management state
  const [gameTypes, setGameTypes] = useState<any[]>([]);
  const [gameTypeName, setGameTypeName] = useState('');
  const [gameTypeImage, setGameTypeImage] = useState(null);
  const [editingGameType, setEditingGameType] = useState(null);
  const [isSubmittingGameType, setIsSubmittingGameType] = useState(false);
  const [loadingGameTypes, setLoadingGameTypes] = useState(false);
  const [gameModes, setGameModes] = useState<any[]>([]);
  const [gameModeName, setGameModeName] = useState('');
  const [editingGameMode, setEditingGameMode] = useState(null);
  const [isSubmittingGameMode, setIsSubmittingGameMode] = useState(false);
  const [loadingGameModes, setLoadingGameModes] = useState(false);

  // Banner management state
  const [bannerData, setBannerData] = useState({
    title: '',
    description: '',
    buttonText: '',
    backgroundImage: '',
    bannerImages: []
  });
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const [bannerPreview, setBannerPreview] = useState('');
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
  const [allBanners, setAllBanners] = useState([]);
  const [showMultipleUpload, setShowMultipleUpload] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if admin is logged in
    const isAdmin = localStorage.getItem("isAdmin");
    const adminToken = localStorage.getItem("adminToken");

    if (!isAdmin || !adminToken) {
      navigate("/admin/login");
      return;
    }

    // Initialize data
    fetchBannerData();
    fetchAllBanners();

    // Initialize game types as empty array first
    setGameTypes([]);
    fetchGameTypes();

    // Initialize game modes as empty array first
    setGameModes([]);
    fetchGameModes();

    setLoading(false);
  }, [navigate]);

  // Fetch game types and game modes whenever add slot dialog opens
  useEffect(() => {
    if (showAddSlot) {
      fetchGameTypes();
      fetchGameModes();
    }
  }, [showAddSlot]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    navigate("/admin/login");
  };

  // Handle slot banner image file selection
  const handleSlotBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlotBannerFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setSlotBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let bannerImageUrl = '';

      // Upload banner image first if selected
      if (slotBannerFile) {
        const imageFormData = new FormData();
        imageFormData.append('banner', slotBannerFile);

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/admin/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: imageFormData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          bannerImageUrl = uploadData.imagePath; // Get the uploaded image path
        } else {
          throw new Error('Failed to upload banner image');
        }
      }

      // Convert string values to numbers and prepare comprehensive match data
      const slotData = {
        // Basic slot information
        slotType: formData.slotType, // Keep the original capitalized format
        entryFee: Number(formData.entryFee),
        matchTime: formData.matchTime,
        customStartInMinutes: Number(formData.customStartInMinutes),
        perKill: Number(formData.perKill),
        totalWinningPrice: Number(formData.totalWinningPrice),
        firstwin: Number(formData.firstwin),
        secwin: Number(formData.secwin),
        thirdwin: Number(formData.thirdwin),
        maxBookings: Number(formData.maxPlayers),
        remainingBookings: Number(formData.maxPlayers),

        // Enhanced match information
        matchTitle: formData.matchTitle,
        matchDescription: formData.matchDescription,
        mapName: formData.mapName,
        gameMode: formData.gameMode,
        tournamentName: formData.tournamentName,
        hostName: formData.hostName,
        maxPlayers: Number(formData.maxPlayers),
        registrationDeadline: formData.registrationDeadline,
        rules: formData.rules,
        prizeDistribution: formData.prizeDistribution,
        contactInfo: formData.contactInfo,
        streamLink: formData.streamLink,
        discordLink: formData.discordLink,
        specialRules: formData.specialRules,
        banList: formData.banList,
        bannerImage: bannerImageUrl || null // Add banner image URL
      };

      // Validate required fields and numbers
      if (slotData.perKill < 0 ||
        slotData.entryFee < 0 ||
        slotData.totalWinningPrice < 0 ||
        slotData.maxPlayers < 1) {
        throw new Error('Invalid values: Please check all numeric fields and ensure max players is at least 1');
      }

      if (!slotData.matchTitle.trim()) {
        throw new Error('Match title is required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(slotData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || 'Failed to create slot');
      }

      toast({
        title: "Success",
        description: "Slot created successfully",
      });

      setShowAddSlot(false);
      setFormData(initialFormData);
      setSlotBannerFile(null); // Clear banner file
      setSlotBannerPreview(''); // Clear banner preview
      fetchSlots(); // Refresh the slots list
      fetchSlotBookings(); // Refresh the bookings list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create slot",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      // For admin, fetch all slots regardless of type
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots?slotType=all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || data); // Handle both response formats
      } else {
        const errorData = await response.json();
        console.error('Error fetching slots:', errorData);
        toast({
          title: "Error",
          description: errorData.msg || "Failed to fetch slots",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch slots",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSlotBookings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slot-bookings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSlotBookings(data.slotBookings);
      }
    } catch (error) {
      console.error('Error fetching slot bookings:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchSlots();
      fetchUsers();
      fetchSlotBookings();
    }
  }, [loading]);

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots/${slotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Slot deleted successfully",
        });
        // Refresh the slots list
        fetchSlots();
        fetchSlotBookings();
      } else {
        throw new Error('Failed to delete slot');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete slot",
      });
    }
  };

  // Status Management Functions
  const handleUpdateMatchStatus = async (slotId: string, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots/${slotId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Match status updated to ${newStatus}`,
        });
        fetchSlots(); // Refresh the slots list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update match status');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update match status",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500 text-white';
      case 'live':
        return 'bg-green-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'upcoming':
        return 'live';
      case 'live':
        return 'completed';
      default:
        return null;
    }
  };

  // const handleOpenTournamentRules = (slotId: string) => {
  //   setSelectedSlotId(slotId);
  //   setShowTournamentRules(true);
  // };

  // const handleTournamentRulesSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots/${selectedSlotId}/tournament-rules`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  //       },
  //       body: JSON.stringify(tournamentRulesData)
  //     });

  //     if (response.ok) {
  //       toast({
  //         title: "Success",
  //         description: "Tournament rules added successfully",
  //       });
  //       setShowTournamentRules(false);
  //       fetchSlots(); // Refresh the slots list
  //       fetchSlotBookings(); // Refresh the bookings list
  //     } else {
  //       const errorData = await response.json();
  //       throw new Error(errorData.msg || 'Failed to add tournament rules');
  //     }
  //   } catch (error: any) {
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: error.message || "Failed to add tournament rules",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const addProhibitedActivity = () => {
  //   setTournamentRulesData({
  //     ...tournamentRulesData,
  //     prohibitedActivities: [...tournamentRulesData.prohibitedActivities, '']
  //   });
  // };

  // const removeProhibitedActivity = (index: number) => {
  //   const newActivities = tournamentRulesData.prohibitedActivities.filter((_, i) => i !== index);
  //   setTournamentRulesData({
  //     ...tournamentRulesData,
  //     prohibitedActivities: newActivities
  //   });
  // };

  // Render functions for different sections
  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{users.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white">Total Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{slots.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">₹0</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-400">
            <p>• No recent activity</p>
            <p>• System running smoothly</p>
            <p>• All services operational</p>
          </div>
        </CardContent>
      </Card>
    </>
  );

  // Banner Management Functions
  const fetchBannerData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banner`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBannerData({
          title: data.title,
          description: data.description,
          buttonText: data.buttonText,
          backgroundImage: data.backgroundImage,
          bannerImages: data.bannerImages || []
        });
      }
    } catch (error) {
      console.error('Error fetching banner data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch banner data",
        variant: "destructive",
      });
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle multiple banner files
  const handleMultipleBannerFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setBannerFiles(files);

      // Create previews for all files
      const previews: string[] = [];
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews[index] = e.target?.result as string;
          if (previews.length === files.length) {
            setBannerPreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Fetch all banners
  const fetchAllBanners = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/admin/banners`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllBanners(data);
      }
    } catch (error) {
      console.error('Error fetching all banners:', error);
    }
  };

  // Upload single banner image
  const handleBannerUpload = async () => {
    if (!bannerFile) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('banner', bannerFile);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/admin/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });

        // Clear the file and preview
        setBannerFile(null);
        setBannerPreview('');

        // Refresh banner data
        fetchBannerData();
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload multiple banner images
  const handleUploadMultipleImages = async () => {
    if (bannerFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select images to upload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();

      bannerFiles.forEach(file => {
        formData.append('bannerImages', file);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/admin/upload-multiple`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `${data.totalUploaded} images uploaded successfully`,
        });

        // Clear the files and previews
        setBannerFiles([]);
        setBannerPreviews([]);
        setShowMultipleUpload(false);

        // Update banner data with new images
        setBannerData(prev => ({
          ...prev,
          bannerImages: [...prev.bannerImages, ...data.relativePaths]
        }));
      } else {
        throw new Error('Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set active banner
  const handleSetActiveBanner = async (bannerId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/admin/${bannerId}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Banner activated successfully",
        });
        fetchBannerData();
        fetchAllBanners();
      } else {
        throw new Error('Failed to activate banner');
      }
    } catch (error) {
      console.error('Error activating banner:', error);
      toast({
        title: "Error",
        description: "Failed to activate banner",
        variant: "destructive",
      });
    }
  };

  // Delete banner
  const handleDeleteBanner = async (bannerId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/admin/${bannerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Banner deleted successfully",
        });
        fetchAllBanners();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to delete banner');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete banner",
        variant: "destructive",
      });
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      let imageUrl = bannerData.backgroundImage;

      // Upload new image if selected
      if (bannerFile) {
        const formData = new FormData();
        formData.append('banner', bannerFile);

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/admin/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.imagePath;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      // Update banner data
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/admin/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: bannerData.title,
          description: bannerData.description,
          buttonText: bannerData.buttonText,
          backgroundImage: imageUrl
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Banner updated successfully",
        });
        setShowBannerModal(false);
        setBannerFile(null);
        setBannerPreview('');
        fetchBannerData(); // Refresh banner data
      } else {
        throw new Error('Failed to update banner');
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        title: "Error",
        description: "Failed to update banner",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Game Type Management Functions
  const resetGameTypeForm = () => {
    setGameTypeName('');
    setGameTypeImage(null);
    setEditingGameType(null);
    setIsSubmittingGameType(false);
  };

  const fetchGameTypes = async () => {
    try {
      setLoadingGameTypes(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gametypes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

  // Ensure we always have an array, even if API returns object
  const gameTypesArray = Array.isArray(data) ? data : (data.gameTypes || []);

        setGameTypes(gameTypesArray);
      } else {
        throw new Error('Failed to fetch game types');
      }
    } catch (error) {
      console.error('Error fetching game types:', error);
      toast({
        title: "Error",
        description: "Failed to fetch game types",
        variant: "destructive",
      });
    } finally {
      setLoadingGameTypes(false);
    }
  };

  const handleCreateGameType = async () => {
    try {
      setIsSubmittingGameType(true);

      if (!gameTypeName.trim()) {
        toast({
          title: "Error",
          description: "Game type name is required",
          variant: "destructive",
        });
        return;
      }

      if (!gameTypeImage) {
        toast({
          title: "Error",
          description: "Game type image is required",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append('gameType', gameTypeName); // Changed 'name' to 'gameType' to match the backend
      if (gameTypeImage.originFileObj) {
        formData.append('image', gameTypeImage.originFileObj);
      }

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gametypes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Game type created successfully",
        });
        resetGameTypeForm();
        fetchGameTypes();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to create game type');
      }
    } catch (error) {
      console.error('Error creating game type:', error);
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error ? error.message : "Failed to create game type",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingGameType(false);
    }
  };

  const handleDeleteGameType = async (gameTypeId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gametypes/${gameTypeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Game type deleted successfully",
        });
        fetchGameTypes();
      } else {
        throw new Error('Failed to delete game type');
      }
    } catch (error) {
      console.error('Error deleting game type:', error);
      toast({
        title: "Error",
        description: "Failed to delete game type",
        variant: "destructive",
      });
    }
  };

  const handleEditGameType = async (gameType) => {
    setEditingGameType(gameType);
    setGameTypeName(gameType.gameType);
  };

  const handleUpdateGameType = async () => {
    if (!editingGameType) return;

    try {
      setIsSubmittingGameType(true);

      if (!gameTypeName.trim()) {
        toast({
          title: "Error",
          description: "Game type name is required",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append('gameType', gameTypeName);

      if (gameTypeImage && gameTypeImage.originFileObj) {
        formData.append('image', gameTypeImage.originFileObj);
      }

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gametypes/${editingGameType._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Game type updated successfully",
        });
        resetGameTypeForm();
        fetchGameTypes();
      } else {
        throw new Error('Failed to update game type');
      }
    } catch (error) {
      console.error('Error updating game type:', error);
      toast({
        title: "Error",
        description: "Failed to update game type",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingGameType(false);
    }
  };

  // Game Mode Management Functions
  const resetGameModeForm = () => {
    setGameModeName('');
    setEditingGameMode(null);
    setIsSubmittingGameMode(false);
  };

  const fetchGameModes = async () => {
    try {
      setLoadingGameModes(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gamemodes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Ensure we always have an array, even if API returns object
        const gameModesArray = Array.isArray(data) ? data : (data.gameModes || []);

        setGameModes(gameModesArray);
      } else {
        throw new Error('Failed to fetch game modes');
      }
    } catch (error) {
      console.error('Error fetching game modes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch game modes",
        variant: "destructive",
      });
    } finally {
      setLoadingGameModes(false);
    }
  };

  const handleCreateGameMode = async () => {
    try {
      setIsSubmittingGameMode(true);

      if (!gameModeName.trim()) {
        toast({
          title: "Error",
          description: "Game mode name is required",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append('gameMode', gameModeName);

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gamemodes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Game mode created successfully",
        });
        resetGameModeForm();
        fetchGameModes();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to create game mode');
      }
    } catch (error) {
      console.error('Error creating game mode:', error);
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error ? error.message : "Failed to create game mode",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingGameMode(false);
    }
  };

  const handleDeleteGameMode = async (gameModeId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gamemodes/${gameModeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Game mode deleted successfully",
        });
        fetchGameModes();
      } else {
        throw new Error('Failed to delete game mode');
      }
    } catch (error) {
      console.error('Error deleting game mode:', error);
      toast({
        title: "Error",
        description: "Failed to delete game mode",
        variant: "destructive",
      });
    }
  };

  const handleEditGameMode = async (gameMode) => {
    setEditingGameMode(gameMode);
    setGameModeName(gameMode.gameMode);
  };

  const handleUpdateGameMode = async () => {
    if (!editingGameMode) return;

    try {
      setIsSubmittingGameMode(true);

      if (!gameModeName.trim()) {
        toast({
          title: "Error",
          description: "Game mode name is required",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append('gameMode', gameModeName);

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gamemodes/${editingGameMode._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Game mode updated successfully",
        });
        resetGameModeForm();
        fetchGameModes();
      } else {
        throw new Error('Failed to update game mode');
      }
    } catch (error) {
      console.error('Error updating game mode:', error);
      toast({
        title: "Error",
        description: "Failed to update game mode",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingGameMode(false);
    }
  };

  // Game Mode Management UI
  const renderGameModeManagement = () => {


    return (
      <div className="space-y-6">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white">Game Mode Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Game Mode Form */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="gameModeName" className="text-white">Game Mode Name</Label>
                  <Input
                    id="gameModeName"
                    placeholder="Enter game mode name (e.g., Solo, Duo, Squad)"
                    value={gameModeName}
                    onChange={(e) => setGameModeName(e.target.value)}
                    className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                {editingGameMode ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetGameModeForm}
                      className="mr-2 text-white border-[#3A3A3A]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleUpdateGameMode}
                      disabled={isSubmittingGameMode}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      {isSubmittingGameMode ? "Updating..." : "Update Game Mode"}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={handleCreateGameMode}
                    disabled={isSubmittingGameMode}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmittingGameMode ? "Creating..." : "Create Game Mode"}
                  </Button>
                )}
              </div>
            </div>

            {/* Game Mode List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Existing Game Modes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loadingGameModes ? (
                  <div className="col-span-3 flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                  </div>
                ) : !Array.isArray(gameModes) || gameModes.length === 0 ? (
                  <div className="col-span-3 text-center p-8 border border-dashed border-[#3A3A3A] rounded-lg">
                    <p className="text-gray-400">No game modes found. Create your first game mode above.</p>
                  </div>
                ) : (
                  gameModes.map((gameMode, index) => (
                    <Card key={gameMode._id || `gamemode-${index}`} className="bg-[#222222] border-[#2A2A2A] overflow-hidden">
                      <div className="aspect-video w-full relative">
                        <img
                          src={gameMode.image ? `${import.meta.env.VITE_API_URL}${gameMode.image}` : '/assets/images/category.png'}
                          alt={gameMode.gameMode}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/images/category.png';
                          }}
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-white">{gameMode.gameMode}</h4>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditGameMode(gameMode)}
                              className="h-8 w-8 p-0 text-white border-[#3A3A3A]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => gameMode._id && handleDeleteGameMode(gameMode._id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Game Type Management UI
  const renderGameTypeManagement = () => {
    // Add safety checks


    return (
      <div className="space-y-6">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white">Game Type Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Game Type Form */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="gameTypeName" className="text-white">Game Type Name</Label>
                  <Input
                    id="gameTypeName"
                    placeholder="Enter game type name"
                    value={gameTypeName}
                    onChange={(e) => setGameTypeName(e.target.value)}
                    className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                  />
                </div>

                <div className="flex-1">
                  <Label htmlFor="gameTypeImage" className="text-white">Game Type Image</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('gameTypeImageInput').click()}
                      className="text-white border-[#3A3A3A]"
                    >
                      <Image className="mr-2 h-4 w-4" /> Upload Image
                    </Button>
                    <input
                      id="gameTypeImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setGameTypeImage({
                            uid: '-1',
                            name: file.name,
                            status: 'done',
                            url: URL.createObjectURL(file),
                            originFileObj: file,
                          });
                        }
                      }}
                    />
                    {gameTypeImage && (
                      <span className="text-sm text-green-500">
                        Image selected: {gameTypeImage.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                {editingGameType ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetGameTypeForm}
                      className="mr-2 text-white border-[#3A3A3A]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleUpdateGameType}
                      disabled={isSubmittingGameType}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      {isSubmittingGameType ? "Updating..." : "Update Game Type"}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={handleCreateGameType}
                    disabled={isSubmittingGameType}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmittingGameType ? "Creating..." : "Create Game Type"}
                  </Button>
                )}
              </div>
            </div>

            {/* Game Type List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Existing Game Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loadingGameTypes ? (
                  <div className="col-span-3 flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                  </div>
                ) : !Array.isArray(gameTypes) || gameTypes.length === 0 ? (
                  <div className="col-span-3 text-center p-8 border border-dashed border-[#3A3A3A] rounded-lg">
                    <p className="text-gray-400">No game types found. Create your first game type above.</p>
                  </div>
                ) : (
                  gameTypes.map((gameType, index) => (
                    <Card key={gameType._id || `gametype-${index}`} className="bg-[#222222] border-[#2A2A2A] overflow-hidden">
                      <div className="aspect-video w-full relative">
                        <GameTypeImage gameType={gameType} />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-white">{gameType.gameType}</h4>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditGameType(gameType)}
                              className="h-8 w-8 p-0 text-white border-[#3A3A3A]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => gameType._id && handleDeleteGameType(gameType._id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Banner Management UI
  const renderBannerManagement = () => (
    <div className="space-y-6">
      {/* Banner Management Section */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-white">Banner Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Single Banner Upload */}
          <div className="border-b border-[#2A2A2A] pb-6">
            <h3 className="text-lg font-medium text-white mb-3">Single Banner Upload</h3>
            <div className="flex flex-col space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerFileChange}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              {bannerPreview && (
                <div className="w-full max-w-md">
                  <img src={bannerPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                </div>
              )}
              <Button
                onClick={handleBannerUpload}
                disabled={!bannerFile || loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
              >
                {loading ? 'Uploading...' : 'Upload Banner'}
              </Button>
            </div>
          </div>

          {/* Multiple Banner Upload */}
          <div className="border-b border-[#2A2A2A] pb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-white">Multiple Banner Upload</h3>
              <Button
                onClick={() => setShowMultipleUpload(!showMultipleUpload)}
                className="bg-green-600 hover:bg-green-700"
              >
                {showMultipleUpload ? 'Hide' : 'Show'} Multiple Upload
              </Button>
            </div>

            {showMultipleUpload && (
              <div className="space-y-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleBannerFiles}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                />

                {bannerPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {bannerPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <span className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleUploadMultipleImages}
                  disabled={bannerFiles.length === 0 || loading}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Uploading...' : `Upload ${bannerFiles.length} Images`}
                </Button>
              </div>
            )}
          </div>

          {/* Current Banner Info */}
          {bannerData && (
            <div className="border-b border-[#2A2A2A] pb-6">
              <h3 className="text-lg font-medium text-white mb-3">Current Banner</h3>
              <div className="space-y-3">
                <p className="text-gray-300"><strong className="text-white">Title:</strong> {bannerData.title}</p>
                {/* <p className="text-gray-300"><strong className="text-white">Subtitle:</strong> {bannerData.subtitle}</p> */}
                <p className="text-gray-300"><strong className="text-white">Status:</strong>
                  {/* <span className={`ml-2 px-2 py-1 rounded text-sm ${bannerData.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {bannerData.isActive ? 'Active' : 'Inactive'}
                  </span> */}
                </p>
                {bannerData.bannerImages && bannerData.bannerImages.length > 0 && (
                  <div>
                    <p className="mb-2 text-white"><strong>Banner Images ({bannerData.bannerImages.length}):</strong></p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {bannerData.bannerImages.map((image, index) => (
                        <img
                          key={index}
                          src={image} // Now image contains full URL from backend
                          alt={`Banner ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-[#2A2A2A]"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <Button
            onClick={() => {
              fetchBannerData();
              fetchAllBanners();
            }}
            variant="outline"
            className="w-full border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Banner Data
          </Button>
        </CardContent>
      </Card>

      {/* All Banners List */}
      {allBanners.length > 0 && (
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white">All Banners ({allBanners.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {allBanners.map((banner) => (
                <div key={banner._id} className="border border-[#2A2A2A] rounded-lg p-4 bg-[#2A2A2A]">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-white">{banner.title}</h4>
                      <p className="text-sm text-gray-300">{banner.subtitle}</p>
                    </div>
                    <div className="flex space-x-2">
                      {!banner.isActive && (
                        <Button
                          onClick={() => handleSetActiveBanner(banner._id)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Set Active
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteBanner(banner._id)}
                        size="sm"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm mb-3">
                    <span className={`px-2 py-1 rounded ${banner.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-gray-300">
                      Images: {banner.bannerImages?.length || 0}
                    </span>
                    <span className="text-gray-300">
                      Created: {new Date(banner.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {banner.bannerImages && banner.bannerImages.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-white mb-2">Banner Images:</p>
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {banner.bannerImages.slice(0, 8).map((image, index) => (
                          <img
                            key={index}
                            src={image} // Now image contains full URL from backend
                            alt={`Banner ${index + 1}`}
                            className="w-full h-16 object-cover rounded border border-[#3A3A3A]"
                          />
                        ))}
                        {banner.bannerImages.length > 8 && (
                          <div className="w-full h-16 bg-[#3A3A3A] rounded flex items-center justify-center text-xs text-gray-400">
                            +{banner.bannerImages.length - 8} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderUsers = () => (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-white">Users Management ({users.length} Users)</CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-10">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold text-white mb-2">No Users Yet</h3>
            <p className="text-gray-400">Users will appear here once they start registering</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  <th className="text-left p-3 text-white">Name</th>
                  <th className="text-left p-3 text-white">Email</th>
                  <th className="text-left p-3 text-white">Phone</th>
                  <th className="text-left p-3 text-white">Free Fire Username</th>
                  <th className="text-left p-3 text-white">Wallet</th>
                  <th className="text-left p-3 text-white">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user._id} className="border-b border-[#2A2A2A] hover:bg-[#2A2A2A]">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#FF4D4F] rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-white">{user.email}</td>
                    <td className="p-3 text-white">{user.phone}</td>
                    <td className="p-3">
                      <span className="bg-[#2A2A2A] px-2 py-1 rounded text-yellow-400 font-mono">
                        {user.freeFireUsername}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-green-400 font-bold">₹{user.wallet}</span>
                    </td>
                    <td className="p-3 text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Revenue and Withdrawals UI
  const renderRevenue = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">₹0</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white">Pending Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">0</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">₹0</p>
          </CardContent>
        </Card>
      </div>

      <WithdrawalManagement />
    </>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#121212] flex">
      {/* Sidebar */}
      <aside className={`bg-[#1A1A1A] h-screen ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 fixed left-0 top-0`}>
        <div className="p-4 border-b border-[#2A2A2A] flex justify-between items-center">
          <h2 className={`text-white font-bold ${isSidebarOpen ? 'block' : 'hidden'}`}>Admin Panel</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-white hover:bg-[#2A2A2A]"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <nav className="p-2 space-y-1">
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'dashboard' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <LayoutDashboard className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Dashboard</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'users' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <Users className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Users</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'matches' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('matches')}
          >
            <GamepadIcon className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Matches</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'revenue' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('revenue')}
          >
            <DollarSign className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Revenue</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'banner' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('banner')}
          >
            <Image className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Banner</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'gameTypes' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('gameTypes')}
          >
            <GamepadIcon className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Game Types</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'gameModes' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('gameModes')}
          >
            <GamepadIcon className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Game Modes</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'winners' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('winners')}
          >
            <Trophy className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Winners</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'contactMessages' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('contactMessages')}
          >
            <Mail className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Contact Messages</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'slotCredentials' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('slotCredentials')}
          >
            <KeyRound className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">ID/Password</span>}
          </Button>
          {/* <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'slotCredentials' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('slotCredentials')}
          >
            <KeyRound className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Announcement Bar</span>}
          </Button> */}
          <Button
              variant="ghost"
              className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'announcementSender' ? 'bg-[#2A2A2A]' : ''}`}
              onClick={() => setActiveSection('announcementSender')}
            >
              <KeyRound className="h-4 w-4 mr-3" />
              {isSidebarOpen && <span className="text-white">Announcement Bar</span>}
            </Button>
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-red-500 hover:text-red-400 hover:bg-[#2A2A2A]"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <header className="bg-[#1A1A1A] border-b border-[#2A2A2A] p-6">
          <h1 className="text-2xl font-bold text-white">
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'announcementSender' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('announcementSender')}
          >
            <KeyRound className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Announcement Bar</span>}
          </Button>
            {activeSection === 'slotCredentials' && (
              <div>
                <div className="mb-4">
                  <label className="block text-white mb-1">Select Slot</label>
                  <select
                    className="w-full p-2 rounded bg-[#222] text-white border border-[#333]"
                    value={selectedSlotId}
                    onChange={e => setSelectedSlotId(e.target.value)}
                    // disabled={!!selectedSlotId}
                  >
                    <option value="">-- Select Slot --</option>
                    {slots.map((slot: any) => (
                      <option key={slot._id} value={slot._id}>{slot.matchTitle || slot._id}</option>
                    ))}
                  </select>
                </div>
                {selectedSlotId && <SendSlotCredentials slotId={selectedSlotId} />}
              </div>
            )}
            {activeSection === 'dashboard' && 'Dashboard'}
            {activeSection === 'users' && 'Users Management'}
            {activeSection === 'matches' && 'Matches Management'}
            {activeSection === 'revenue' && 'Revenue & Withdrawals'}
            {activeSection === 'banner' && 'Banner Management'}
            {activeSection === 'gameTypes' && 'Game Types Management'}
            {activeSection === 'gameModes' && 'Game Modes Management'}
            {activeSection === 'winners' && 'Winners Management'}
          </h1>
        </header>

        <div className="p-6">
    {activeSection === 'dashboard' && renderDashboard()}
    {activeSection === 'users' && renderUsers()}
    {activeSection === 'contactMessages' && <ContactMessagesTable />}
    {activeSection === 'announcementSender' && <AnnouncementSender />}
    {activeSection === 'matches' && (
            <>
              {/* Matches Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
                  <CardHeader>
                    <CardTitle className="text-white">Total Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-white">{slots.length}</p>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
                  <CardHeader>
                    <CardTitle className="text-white">Total Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-white">
                      {String(Object.values(slotBookings).reduce((total: number, slot: any) => total + (slot.bookings?.length || 0), 0))}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
                  <CardHeader>
                    <CardTitle className="text-white">Match Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-[#52C41A]">
                      ₹{String(Object.values(slotBookings).reduce((total: number, slot: any) =>
                        total + (slot.bookings?.reduce((slotTotal: number, booking: any) => slotTotal + (booking.totalAmount || 0), 0) || 0), 0
                      ))}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Match Management Header */}
              <Card className="bg-[#1A1A1A] border-[#2A2A2A] mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Active Matches</CardTitle>
                  <div className="flex items-center gap-3">
                    {/* <Button 
                      onClick={handleAutoUpdateStatuses}
                      disabled={loading}
                      className="bg-[#52C41A] hover:bg-[#73D13D] text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Auto Update Status
                    </Button> */}
                    <Dialog open={showAddSlot} onOpenChange={(open) => {
                      setShowAddSlot(open);
                      if (!open) {
                        // Clear form and banner image state when dialog closes
                        setFormData(initialFormData);
                        setSlotBannerFile(null);
                        setSlotBannerPreview('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-[#FF4D4F] hover:bg-[#FF7875] text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Match
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] bg-[#0F0F0F] border border-[#2A2A2A] text-white overflow-y-auto">
                        <DialogHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-[#FF4D4F] to-[#FF7875] rounded-lg">
                              <Plus className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <DialogTitle className="text-xl font-bold text-white">
                                Create New Match
                              </DialogTitle>
                              <p className="text-gray-400 text-sm">
                                Set up a new tournament match
                              </p>
                            </div>
                          </div>
                        </DialogHeader>
                        <form onSubmit={handleCreateSlot} className="space-y-6">
                          {/* Basic Match Information */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">Basic Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="matchTitle" className="text-white">Match Title</Label>
                                <Input
                                  id="matchTitle"
                                  type="text"
                                  value={formData.matchTitle}
                                  onChange={(e) => setFormData({ ...formData, matchTitle: e.target.value })}
                                  placeholder="FF SOLO TOURNAMENT"
                                  required
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="tournamentName" className="text-white">Tournament Name</Label>
                                <Input
                                  id="tournamentName"
                                  type="text"
                                  value={formData.tournamentName}
                                  onChange={(e) => setFormData({ ...formData, tournamentName: e.target.value })}
                                  placeholder="#ALPHALIONS"
                                  required
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="hostName" className="text-white">Host Name</Label>
                                <Input
                                  id="hostName"
                                  type="text"
                                  value={formData.hostName}
                                  onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                                  placeholder="ALPHA LIONS"
                                  required
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="matchDescription" className="text-white">Match Description</Label>
                              <textarea
                                id="matchDescription"
                                value={formData.matchDescription}
                                onChange={(e) => setFormData({ ...formData, matchDescription: e.target.value })}
                                placeholder="Tournament description and details..."
                                className="w-full px-3 py-2 text-white bg-[#2A2A2A] border border-[#3A3A3A] rounded-md resize-none h-20"
                              />
                            </div>
                          </div>

                          {/* Game Settings */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">Game Settings</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="slotType" className="text-white">Game Type</Label>
                                <Select
                                  value={formData.slotType}
                                  onValueChange={(value) => setFormData({ ...formData, slotType: value })}
                                >
                                  <SelectTrigger className="text-white bg-[#2A2A2A] border-[#3A3A3A]">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                                    {gameTypes.length > 0 ? (
                                      gameTypes.map((gameType) => (
                                        <SelectItem
                                          key={gameType._id}
                                          value={gameType.gameType}
                                          className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]"
                                        >
                                          {gameType.gameType}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      // Fallback options in case the API hasn't loaded yet
                                      <>
                                        <SelectItem value="Solo" className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">Solo</SelectItem>
                                        <SelectItem value="Duo" className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">Duo</SelectItem>
                                        <SelectItem value="Squad" className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">Squad</SelectItem>
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="mapName" className="text-white">Map</Label>
                                <Select
                                  value={formData.mapName}
                                  onValueChange={(value) => setFormData({ ...formData, mapName: value })}
                                >
                                  <SelectTrigger className="text-white bg-[#2A2A2A] border-[#3A3A3A]">
                                    <SelectValue placeholder="Select map" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                                    <SelectItem value="Bermuda" className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">Bermuda</SelectItem>
                                    <SelectItem value="Purgatory" className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">Purgatory</SelectItem>
                                    <SelectItem value="Kalahari" className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">Kalahari</SelectItem>
                                    <SelectItem value="Alpine" className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">Alpine</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="gameMode" className="text-white">Game Mode</Label>
                                <Select
                                  value={formData.gameMode}
                                  onValueChange={(value) => setFormData({ ...formData, gameMode: value })}
                                >
                                  <SelectTrigger className="text-white bg-[#2A2A2A] border-[#3A3A3A]">
                                    <SelectValue placeholder="Select mode" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                                    {gameModes.length > 0 ? (
                                      gameModes.map((gameMode) => (
                                        <SelectItem
                                          key={gameMode._id}
                                          value={gameMode.gameMode}
                                          className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]"
                                        >
                                          {gameMode.gameMode}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      // Fallback options in case the API hasn't loaded yet
                                      <>
                                        <SelectItem value="Solo" className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">Solo</SelectItem>
                                        <SelectItem value="Duo" className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">Duo</SelectItem>
                                        <SelectItem value="Squad" className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">Squad</SelectItem>
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="specialRules" className="text-white">Special Rules</Label>
                                <Input
                                  id="specialRules"
                                  type="text"
                                  value={formData.specialRules}
                                  onChange={(e) => setFormData({ ...formData, specialRules: e.target.value })}
                                  placeholder="RYDEN BAN"
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="banList" className="text-white">Ban List</Label>
                                <Input
                                  id="banList"
                                  type="text"
                                  value={formData.banList}
                                  onChange={(e) => setFormData({ ...formData, banList: e.target.value })}
                                  placeholder="RYDEN, M1014"
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="bannerImage" className="text-white">Banner Image (Optional)</Label>
                                <input
                                  id="bannerImage"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleSlotBannerFileChange}
                                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                />
                                {slotBannerPreview && (
                                  <div className="mt-2">
                                    <img
                                      src={slotBannerPreview}
                                      alt="Banner Preview"
                                      className="w-full h-32 object-cover rounded-lg border border-[#2A2A2A]"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Timing & Players */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">Timing & Players</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="matchTime" className="text-white">Match Time</Label>
                                <Input
                                  id="matchTime"
                                  type="datetime-local"
                                  value={formData.matchTime}
                                  min={new Date().toISOString().slice(0, 16)}
                                  onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })}
                                  required
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="registrationDeadline" className="text-white">Registration Deadline</Label>
                                <Input
                                  id="registrationDeadline"
                                  type="datetime-local"
                                  value={formData.registrationDeadline}
                                  min={new Date().toISOString().slice(0, 16)}
                                  onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                                  required
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="maxPlayers" className="text-white">Slots</Label>
                                <Input
                                  id="maxPlayers"
                                  type="number"
                                  min="1"
                                  value={formData.maxPlayers}
                                  onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
                                  required
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="customStartInMinutes" className="text-white">Start In (minutes)</Label>
                                <Input
                                  id="customStartInMinutes"
                                  type="number"
                                  min="0"
                                  value={formData.customStartInMinutes}
                                  onChange={(e) => setFormData({ ...formData, customStartInMinutes: e.target.value })}
                                  required
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>
                            </div>
                          </div>
                          {/* Prize Information */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">Prize Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="entryFee" className="text-white">Entry Fee (₹)</Label>
                                <Input
                                  id="entryFee"
                                  type="number"
                                  min="0"
                                  value={formData.entryFee}
                                  onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                                  required
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="perKill" className="text-white">Per Kill Reward (₹)</Label>
                                <Input
                                  id="perKill"
                                  type="number"
                                  min="0"
                                  value={formData.perKill}
                                  onChange={(e) => setFormData({ ...formData, perKill: e.target.value })}
                                  required
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="totalWinningPrice" className="text-white">Total Winning Prize (₹)</Label>
                                <Input
                                  id="totalWinningPrice"
                                  type="number"
                                  min="0"
                                  value={formData.totalWinningPrice}
                                  onChange={(e) => setFormData({ ...formData, totalWinningPrice: e.target.value })}
                                  required
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="firstwin" className="text-white">1st Winner Prize (₹)</Label>
                                <Input
                                  id="firstwin"
                                  type="number"
                                  min="0"
                                  value={formData.firstwin}
                                  onChange={(e) => setFormData({ ...formData, firstwin: e.target.value })}
                                  required
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="secwin" className="text-white">2nd Winner Prize (₹)</Label>
                                <Input
                                  id="secwin"
                                  type="number"
                                  min="0"
                                  value={formData.secwin}
                                  onChange={(e) => setFormData({ ...formData, secwin: e.target.value })}
                                  required
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="thirdwin" className="text-white">3rd Winner Prize (₹)</Label>
                                <Input
                                  id="thirdwin"
                                  type="number"
                                  min="0"
                                  value={formData.thirdwin}
                                  onChange={(e) => setFormData({ ...formData, thirdwin: e.target.value })}
                                  required
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="prizeDistribution" className="text-white">Prize Distribution</Label>
                              <Input
                                id="prizeDistribution"
                                type="text"
                                value={formData.prizeDistribution}
                                onChange={(e) => setFormData({ ...formData, prizeDistribution: e.target.value })}
                                placeholder="1st: 50%, 2nd: 30%, 3rd: 20%"
                                className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                              />
                            </div>
                          </div>
                          {/* Additional Information */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">Additional Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="contactInfo" className="text-white">Contact Info</Label>
                                <Input
                                  id="contactInfo"
                                  type="text"
                                  value={formData.contactInfo}
                                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                                  placeholder="admin@tournament.com"
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="streamLink" className="text-white">Stream Link</Label>
                                <Input
                                  id="streamLink"
                                  type="url"
                                  value={formData.streamLink}
                                  onChange={(e) => setFormData({ ...formData, streamLink: e.target.value })}
                                  placeholder="https://youtube.com/..."
                                  className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="discordLink" className="text-white">Discord Link</Label>
                              <Input
                                id="discordLink"
                                type="url"
                                value={formData.discordLink}
                                onChange={(e) => setFormData({ ...formData, discordLink: e.target.value })}
                                placeholder="https://discord.gg/..."
                                className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="rules" className="text-white">Rules & Regulations</Label>
                              <textarea
                                id="rules"
                                value={formData.rules}
                                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                                placeholder="Detailed tournament rules..."
                                className="w-full px-3 py-2 text-white bg-[#2A2A2A] border border-[#3A3A3A] rounded-md resize-none h-24"
                              />
                            </div>
                          </div>

                          <DialogFooter>
                            <Button
                              type="submit"
                              disabled={loading}
                              className="bg-[#FF4D4F] hover:bg-[#FF7875] text-white"
                            >
                              {loading ? "Creating..." : "Create Match"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    {/* Rules Modal */}
                    <Dialog open={showTournamentRules} onOpenChange={setShowTournamentRules}>
                      <DialogContent className="max-w-3xl w-full bg-[#181818] border border-[#333] text-white flex flex-col justify-center items-center" style={{ maxHeight: '90vh', overflowY: 'auto', margin: 'auto', position: 'fixed' }}>
                        <DialogHeader className="w-full flex flex-col items-center mb-2">
                          <DialogTitle className="text-2xl font-extrabold text-white tracking-wide mb-2 text-center">Tournament Rules (HTML)</DialogTitle>
                          <span className="text-gray-400 text-sm font-medium text-center">Edit and preview tournament rules below</span>
                        </DialogHeader>
                        <div className="w-full flex flex-col md:flex-row gap-6 items-start justify-center mt-2">
                          <div className="flex-1 flex flex-col items-center">
                            <label htmlFor="rulesHtml" className="block text-white font-semibold mb-2 text-lg">Edit Tournament Rules (HTML)</label>
                            <textarea
                              id="rulesHtml"
                              value={formData.rules}
                              onChange={e => setFormData({ ...formData, rules: e.target.value })}
                              placeholder="Paste or write tournament rules HTML here..."
                              className="w-full max-w-md min-h-[160px] px-4 py-3 text-white bg-[#23272F] border-2 border-[#FF4D4F] focus:border-[#52C41A] rounded-lg shadow-md outline-none transition-all duration-200 resize-y mb-4 text-base"
                              style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
                            />
                          </div>
                          <div className="flex-1 flex flex-col items-center">
                            <label className="block text-white font-semibold mb-2 text-lg">Live Preview</label>
                            <div className="w-full max-w-md min-h-[160px] bg-[#181C24] border-2 border-[#333] rounded-lg p-4 overflow-auto shadow-inner text-white" style={{ whiteSpace: 'normal' }}>
                              <div dangerouslySetInnerHTML={{ __html: formData.rules }} />
                            </div>
                          </div>
                        </div>
                        <DialogFooter className="w-full flex flex-row justify-center gap-4 mt-8">
                          <Button onClick={handleSaveRules} className="bg-[#FF4D4F] hover:bg-[#FF7875] text-white font-semibold px-8 py-2 rounded-lg text-base shadow-md transition-all duration-150">Save Rules</Button>
                          <Button onClick={() => setShowTournamentRules(false)} className="bg-[#52C41A] hover:bg-[#73D13D] text-white font-semibold px-8 py-2 rounded-lg text-base shadow-md transition-all duration-150">Close</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slots.map((slot: any) => (
                      <div
                        key={slot._id}
                        className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] overflow-hidden"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-white" />
                            <span className="text-white font-medium">{slot.matchTitle && slot.matchTitle.trim() ? slot.matchTitle : `${slot.slotType.charAt(0).toUpperCase() + slot.slotType.slice(1)} Match`}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(slot.status || 'upcoming')}`}>
                              {(slot.status || 'upcoming').toUpperCase()}
                            </span>
                            <span className="text-white">₹{slot.entryFee}</span>
                          </div>
                        </div>

                        {/* Banner Image */}
                        {slot.bannerImage && (
                          <div className="w-full h-32 overflow-hidden">
                            <img
                              src={slot.bannerImage}
                              alt={`${slot.slotType} Banner`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        {/* Content */}
                        <div className="p-4 space-y-4">
                          {/* Prize Distribution */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-500">⚡</span>
                              <span className="text-gray-400">Per Kill</span>
                            </div>
                            <span className="text-yellow-500">₹{slot.perKill}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-500">👑</span>
                              <span className="text-gray-400">Winner</span>
                            </div>
                            <span className="text-yellow-500">₹{slot.totalWinningPrice}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 space-y-2">
                            {/* Status Management */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400">Status:</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(slot.status || 'upcoming')}`}>
                                {(slot.status || 'upcoming').toUpperCase()}
                              </span>
                              {getNextStatus(slot.status || 'upcoming') && (
                                <Button
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs"
                                  onClick={() => handleUpdateMatchStatus(slot._id, getNextStatus(slot.status || 'upcoming')!)}
                                >
                                  → {getNextStatus(slot.status || 'upcoming')?.toUpperCase()}
                                </Button>
                              )}
                            </div>

                            {/* Horizontal Button Row */}
                            <div className="flex gap-2">
                              <Button
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-2"
                                onClick={() => handleOpenEditSlot(slot)}
                              >
                                Edit
                              </Button>
                              <Button
                                className="flex-1 bg-[#52C41A] hover:bg-[#73D13D] text-white text-xs py-2"
                                onClick={() => {
                                  setSelectedSlotId(slot._id);
                                  setFormData((prev) => ({ ...prev, rules: slot.rules || '' }));
                                  setShowTournamentRules(true);
                                }}
                              >
                                📋 Rules
                              </Button>
                              <Button
                                variant="destructive"
                                className="flex-1 bg-[#FF4D4F] hover:bg-[#FF7875] text-white text-xs py-2"
                                onClick={() => handleDeleteSlot(slot._id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          {activeSection === 'revenue' && renderRevenue()}
          {activeSection === 'banner' && renderBannerManagement()}
          {activeSection === 'gameTypes' && renderGameTypeManagement()}
          {activeSection === 'gameModes' && renderGameModeManagement()}
          {activeSection === 'winners' && <AdminWinnerDashboard />}
        </div>
      </main>

      {/* Slot Edit Modal */}
      <Dialog open={showEditSlot} onOpenChange={setShowEditSlot}>
        <DialogContent className="max-w-lg bg-[#0F0F0F] border border-[#2A2A2A] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Edit Match</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-white">Title</Label>
              <Input className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.matchTitle || ''} onChange={(e) => setEditData({ ...editData, matchTitle: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white">Entry Fee</Label>
                <Input type="number" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.entryFee ?? ''} onChange={(e) => setEditData({ ...editData, entryFee: e.target.value })} />
              </div>
              <div>
                <Label className="text-white">Per Kill</Label>
                <Input type="number" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.perKill ?? ''} onChange={(e) => setEditData({ ...editData, perKill: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-white">Winner Prize</Label>
              <Input type="number" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.totalWinningPrice ?? ''} onChange={(e) => setEditData({ ...editData, totalWinningPrice: e.target.value })} />
            </div>
            <div>
              <Label className="text-white">Match Time</Label>
              <Input type="datetime-local" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.matchTime || ''} onChange={(e) => setEditData({ ...editData, matchTime: e.target.value })} />
            </div>
            <div>
              <Label className="text-white">Banner Image</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleEditBannerFileChange}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              {/* Preview selected file or current banner */}
              <div className="mt-2">
                {editBannerPreview ? (
                  <img src={editBannerPreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-[#2A2A2A]" />
                ) : (
                  editData.bannerImage && (
                    <img src={editData.bannerImage} alt="Current Banner" className="w-full h-32 object-cover rounded-lg border border-[#2A2A2A]" />
                  )
                )}
              </div>
              {!editBannerFile && (
                <p className="text-xs text-gray-400 mt-1">No new file selected. Existing banner will be kept.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSlot(false)} className="border-[#2A2A2A] text-white">Cancel</Button>
            <Button onClick={handleUpdateSlot} className="bg-blue-600 hover:bg-blue-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Banner Edit Modal */}
      <Dialog open={showBannerModal} onOpenChange={setShowBannerModal}>
        <DialogContent className="max-w-2xl bg-[#0F0F0F] border border-[#2A2A2A] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Edit Banner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBannerSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-white">Banner Title</Label>
              <input
                id="title"
                value={bannerData.title}
                onChange={(e) => setBannerData({ ...bannerData, title: e.target.value })}
                placeholder="Enter banner title (use \n for line breaks)"
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-white">Banner Description</Label>
              <input
                id="description"
                value={bannerData.description}
                onChange={(e) => setBannerData({ ...bannerData, description: e.target.value })}
                placeholder="Enter banner description (use \n for line breaks)"
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="buttonText" className="text-white">Button Text</Label>
              <input
                id="buttonText"
                value={bannerData.buttonText}
                onChange={(e) => setBannerData({ ...bannerData, buttonText: e.target.value })}
                placeholder="Enter button text"
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="bannerImage" className="text-white">Banner Image</Label>
              <input
                id="bannerImage"
                type="file"
                accept="image/*"
                onChange={handleBannerFileChange}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
              />
              {bannerPreview && (
                <div className="mt-2">
                  <img
                    src={bannerPreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              {!bannerPreview && bannerData.backgroundImage && (
                <div className="mt-2">
                  <img
                    src={bannerData.backgroundImage} // Now backgroundImage contains full URL from backend
                    alt="Current Banner"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBannerModal(false)}
                className="border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Updating...' : 'Update Banner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminDashboard;
