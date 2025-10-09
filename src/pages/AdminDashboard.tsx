import AnnouncementSender from '../components/AnnouncementSender';
import AnnouncementManager from '../components/AnnouncementManager';
import SendSlotCredentials from "@/components/SendSlotCredentials";
import NftHoldersManagement from "@/components/NftHoldersManagement";
import AllTransactionsHistory from "@/components/AllTransactionsHistory";
import TransactionHistory from "@/components/TransactionHistory";
import APKManagement from "@/components/APKManagement";
import BlogManagement from "@/components/BlogManagement";
import { KeyRound, AlertCircle } from "lucide-react";

import { Mail } from "lucide-react";
import ContactMessagesTable from "@/components/ContactMessagesTable";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MatchesManager from "@/components/MatchesManager";
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
  Trophy,
  History,
  CreditCard,
  Smartphone
} from "lucide-react";

// Live countdown component showing time left until match start (or elapsed after start)
const MatchCountdown = ({ matchTime }: { matchTime: string }) => {
  const target = new Date(matchTime).getTime();
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = target - now; // ms
  const abs = Math.abs(diff);
  const sec = Math.floor(abs / 1000) % 60;
  const min = Math.floor(abs / (1000 * 60)) % 60;
  const hr = Math.floor(abs / (1000 * 60 * 60)) % 24;
  const day = Math.floor(abs / (1000 * 60 * 60 * 24));
  const two = (n: number) => n.toString().padStart(2, '0');
  const prefix = diff >= 0 ? '' : '-';
  const text = day > 0
    ? `${prefix}${day}d ${two(hr)}:${two(min)}:${two(sec)}`
    : `${prefix}${two(hr)}:${two(min)}:${two(sec)}`;
  return <span className="text-gray-300 text-sm tabular-nums">{text}</span>;
};

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
  mapName: string;
  gameMode: string;
  tournamentName: string;
  hostName: string;
  maxPlayers: string;
  rules: string;
  prizeDistribution: string;
  streamLink: string;
  discordLink: string;
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
    const perKillCoin = Number(slotInfo?.perKill) || 0;
    const firstPlaceCoin = Number(slotInfo?.firstwin) || 0;
    const secondPlaceCoin = Number(slotInfo?.secwin) || 0;
    const thirdPlaceCoin = Number(slotInfo?.thirdwin) || 0;

    let winnings = kills * perKillCoin;

    if (position === 1) {
      winnings += firstPlaceCoin; // Booyah coin
    } else if (position === 2) {
      winnings += secondPlaceCoin; // 2nd place coin
    } else if (position === 3) {
      winnings += thirdPlaceCoin; // 3rd place coin
    }

    return Math.max(0, Math.floor(winnings));
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
            ₹{calculateWinnings(stats.kills, stats.position)}
          </div>
        </div>
      </div>
    </div>
  );
};

const getNowLocalIsoMinutes = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${mi}`;
};

const initialFormData: SlotFormData = {
  firstwin: "",
  secwin: "",
  thirdwin: "",
  slotType: "Solo",
  entryFee: "",
  matchTime: getNowLocalIsoMinutes(), // Local time YYYY-MM-DDTHH:mm
  customStartInMinutes: "10",
  perKill: "",
  totalWinningPrice: "",
  maxBookings: "",
  remainingBookings: "",
  // Enhanced match information defaults
  matchTitle: "",
  mapName: "Bermuda",
  gameMode: "Classic",
  tournamentName: "#ALPHALIONS",
  hostName: "ALPHA LIONS",
  maxPlayers: "48",
  rules: "Standard Free Fire rules apply",
  prizeDistribution: "Winner takes all",
  streamLink: "",
  discordLink: "",
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
  // ID/Pass modal state
  const [showIdPassModal, setShowIdPassModal] = useState(false);
  const [idPassSlotId, setIdPassSlotId] = useState<string>('');
  
  
  // Date display helpers for dd/MM/yyyy hh:mm AM/PM in Edit modal
  const formatToDisplay = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    
    // Convert to 12-hour format with AM/PM
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const hh = String(hours).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi} ${ampm}`;
  };

  const toLocalInputValue = (dateLike: string | number | Date | undefined | null) => {
    if (!dateLike) return '';
    const d = new Date(dateLike);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${mi}`;
  };
  const parseDisplayToISO = (val: string) => {
    // Match format: dd/mm/yyyy hh:mm AM/PM
    const m = val.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
    if (!m) return '';
    const [, dd, mm, yyyy, hh, min, ampm] = m;
    
    // Convert 12-hour to 24-hour format
    let hours24 = parseInt(hh);
    if (ampm.toUpperCase() === 'PM' && hours24 !== 12) {
      hours24 += 12;
    } else if (ampm.toUpperCase() === 'AM' && hours24 === 12) {
      hours24 = 0;
    }
    
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), hours24, Number(min));
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m2 = String(d.getMonth() + 1).padStart(2, '0');
    const d2 = String(d.getDate()).padStart(2, '0');
    const h2 = String(d.getHours()).padStart(2, '0');
    const mi2 = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m2}-${d2}T${h2}:${mi2}`;
  };
  const [editMatchTimeDisplay, setEditMatchTimeDisplay] = useState<string>('');

  // User editing state
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    phone: '',
    freeFireUsername: '',
    wallet: '',
    isAdmin: false
  });

  // Add new user state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    freeFireUsername: '',
    wallet: '0',
    isAdmin: false
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [winMoneyAmount, setWinMoneyAmount] = useState('');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // Auto status update function
  const updateMatchStatuses = async () => {
    try {
      const now = new Date();
      const token = localStorage.getItem('adminToken');

      // Find matches that need status updates
      const matchesToUpdate = slots.filter((slot: any) => {
        if (!slot.matchTime) return false;
        // Never auto-change cancelled matches
        if ((slot.status || '').toLowerCase() === 'cancelled' || slot.isCancelledPermanently) return false;
        const matchTime = new Date(slot.matchTime);
        const timeDiff = matchTime.getTime() - now.getTime();

        // If match time is in the future and status is not 'upcoming', mark as 'upcoming'
        if (timeDiff > 0 && slot.status !== 'upcoming') {
          return true;
        }

        // If match time has passed and status is still 'upcoming', mark as 'live'
        if (timeDiff <= 0 && slot.status === 'upcoming') {
          return true;
        }

        // If match time was more than 2 hours ago and status is 'live', mark as 'completed'
        if (timeDiff <= -2 * 60 * 60 * 1000 && slot.status === 'live') {
          return true;
        }

        return false;
      });

      // Update each match that needs status change
      for (const slot of matchesToUpdate) {
        const matchTime = new Date(slot.matchTime);
        const timeDiff = matchTime.getTime() - now.getTime();
        let newStatus = '';

        // If match time is in the future, set to upcoming
        if (timeDiff > 0 && slot.status !== 'upcoming') {
          newStatus = 'upcoming';
        }
        // If match time has passed and status is upcoming, set to live
        else if (timeDiff <= 0 && slot.status === 'upcoming') {
          newStatus = 'live';
        }
        // If match time was more than 2 hours ago and status is live, set to completed
        else if (timeDiff <= -2 * 60 * 60 * 1000 && slot.status === 'live') {
          newStatus = 'completed';
        }

        if (newStatus) {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots/${slot._id}/status`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
            }
          } catch (error) {
            console.error(`Failed to auto-update match ${slot._id}:`, error);
          }
        }
      }

      // Refresh slots if any were updated
      if (matchesToUpdate.length > 0) {
        fetchSlots();
      }
    } catch (error) {
      console.error('Error in auto status update:', error);
    }
  };

  // Set up interval for automatic status updates
  useEffect(() => {
    const interval = setInterval(updateMatchStatuses, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [slots]);

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
        // Update local slots cache so reopening shows latest rules
        setSlots((prev: any[]) => prev.map((s: any) => s._id === selectedSlotId ? { ...s, rules: formData.rules } : s));
        // Optionally refresh from server to be consistent
        fetchSlots();
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
      // Basic Information
      matchTitle: slot.matchTitle || '',
      tournamentName: slot.tournamentName || '',
      hostName: slot.hostName || '',
      matchDescription: slot.matchDescription || '',
      
      // Game Settings
      slotType: slot.slotType || 'Solo',
      mapName: slot.mapName || 'Bermuda',
      gameMode: slot.gameMode || 'Classic',
      
      // Match Configuration
      entryFee: slot.entryFee ?? '',
      perKill: slot.perKill ?? '',
      totalWinningPrice: slot.totalWinningPrice ?? '',
      matchTime: slot.matchTime ? toLocalInputValue(slot.matchTime) : getNowLocalIsoMinutes(),
      customStartInMinutes: slot.customStartInMinutes ?? '',
      maxPlayers: slot.maxPlayers ?? '',
      firstwin: slot.firstwin ?? '',
      secwin: slot.secwin ?? '',
      thirdwin: slot.thirdwin ?? '',
      
      // Additional Information
      streamLink: slot.streamLink || '',
      discordLink: slot.discordLink || '',
      contactInfo: slot.contactInfo || '',
      registrationDeadline: slot.registrationDeadline ? toLocalInputValue(slot.registrationDeadline) : getNowLocalIsoMinutes(),
      rules: slot.rules || '',
      prizeDistribution: slot.prizeDistribution || '',
      specialRules: slot.specialRules || '',
      banList: slot.banList || '',
      
      // Banner and Status
      bannerImage: slot.bannerImage || '',
      status: slot.status || 'upcoming'
    });
    // Reset edit banner state
    setEditBannerFile(null);
    setEditBannerPreview('');
    setShowEditSlot(true);
    // set display string for match time
    try {
      const iso = slot.matchTime ? new Date(slot.matchTime).toISOString().slice(0, 16) : '';
      setEditMatchTimeDisplay(formatToDisplay(iso));
    } catch {
      setEditMatchTimeDisplay('');
    }
  };

  // Submit Edit API
  const handleUpdateSlot = async () => {
    if (!selectedSlotId) return;
    try {
      const token = localStorage.getItem('adminToken');
      let response: Response;

      // If a new file is selected, upload it to get a URL first
      let uploadedBannerUrl: string | undefined;
      if (editBannerFile) {
        const imageForm = new FormData();
        imageForm.append('banner', editBannerFile);
        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/admin/upload-image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: imageForm
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.msg || 'Failed to upload banner image');
        }
        const uploadJson = await uploadRes.json();
        uploadedBannerUrl = uploadJson.imagePath;
      }

      // Build JSON payload expected by backend
      const payload: any = {
        matchTitle: editData.matchTitle || undefined,
        tournamentName: editData.tournamentName || undefined,
        hostName: editData.hostName || undefined,
        slotType: editData.slotType || undefined,
        mapName: editData.mapName || undefined,
        gameMode: editData.gameMode || undefined,
        entryFee: editData.entryFee === '' ? undefined : Number(editData.entryFee),
        perKill: editData.perKill === '' ? undefined : Number(editData.perKill),
        totalWinningPrice: editData.totalWinningPrice === '' ? undefined : Number(editData.totalWinningPrice),
        matchTime: editData.matchTime || undefined,
        customStartInMinutes: editData.customStartInMinutes === '' ? undefined : Number(editData.customStartInMinutes),
        maxPlayers: editData.maxPlayers === '' ? undefined : Number(editData.maxPlayers),
        maxBookings: editData.maxPlayers === '' ? undefined : Number(editData.maxPlayers),
        remainingBookings: editData.maxPlayers === '' ? undefined : Number(editData.maxPlayers),
        firstwin: editData.firstwin === '' ? undefined : Number(editData.firstwin),
        secwin: editData.secwin === '' ? undefined : Number(editData.secwin),
        thirdwin: editData.thirdwin === '' ? undefined : Number(editData.thirdwin),
        streamLink: editData.streamLink || undefined,
        discordLink: editData.discordLink || undefined,
        rules: editData.rules || undefined,
        prizeDistribution: editData.prizeDistribution || undefined,
        status: editData.status || undefined,
        bannerImage: uploadedBannerUrl || editData.bannerImage || undefined
      };
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots/${selectedSlotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json().catch(() => ({} as any));
        const updatedSlot = (result && (result.slot || result.data || result)) as any;
        toast({ title: 'Updated', description: result?.msg || 'Match updated successfully.' });
        setShowEditSlot(false);
        if (updatedSlot && updatedSlot._id) {
          // Optimistically update slot list so UI reflects banner immediately
          setSlots((prev: any[]) => prev.map((s: any) => s._id === updatedSlot._id ? updatedSlot : s));
        } else {
          await fetchSlots();
        }

        // Trigger immediate status update check after updating match time
        setTimeout(() => {
          updateMatchStatuses();
        }, 1000);
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
    // Clear URL field when a file is chosen to avoid ambiguity
    setEditData(prev => ({ ...prev, bannerImage: '' }));
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
  const [mobileBannerImage, setMobileBannerImage] = useState(null);
  const [editingGameType, setEditingGameType] = useState(null);
  const [isSubmittingGameType, setIsSubmittingGameType] = useState(false);
  const [loadingGameTypes, setLoadingGameTypes] = useState(false);
  const [gameModes, setGameModes] = useState<any[]>([]);
  const [gameModeName, setGameModeName] = useState('');
  const [editingGameMode, setEditingGameMode] = useState(null);
  // Game Maps state
  const [gameMaps, setGameMaps] = useState<any[]>([]);
  const [gameMapName, setGameMapName] = useState('');
  const [editingGameMap, setEditingGameMap] = useState<any | null>(null);
  const [loadingGameMaps, setLoadingGameMaps] = useState(false);
  const [isSubmittingGameMap, setIsSubmittingGameMap] = useState(false);
  const [isSubmittingGameMode, setIsSubmittingGameMode] = useState(false);
  const [loadingGameModes, setLoadingGameModes] = useState(false);

  // Banner management state
  type BannerState = {
    _id?: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    backgroundImage: string;
    bannerImages: string[];
  };

  const [bannerData, setBannerData] = useState<BannerState>({
    _id: undefined,
    title: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    backgroundImage: '',
    bannerImages: []
  });
  
  // Separate state for single banner form
  const [singleBannerForm, setSingleBannerForm] = useState({
    title: '',
    description: '',
    buttonText: '',
    buttonLink: ''
  });
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const [bannerPreview, setBannerPreview] = useState('');
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
  const [allBanners, setAllBanners] = useState([]);
  const [showMultipleUpload, setShowMultipleUpload] = useState(false);
  const [multipleBannerData, setMultipleBannerData] = useState<Array<{
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    file: File | null;
    preview: string;
  }>>([]);
  const { toast } = useToast();
  type StatusFilter = 'all' | 'upcoming' | 'live' | 'completed';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('upcoming');
  type DateFilter = 'all' | 'today' | 'yesterday' | 'tomorrow' | 'last3days' | 'custom';
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customDateFrom, setCustomDateFrom] = useState<string>('');
  const [customDateTo, setCustomDateTo] = useState<string>('');

  // Legacy defaults to hide from UI
  const DEFAULT_TITLE = 'BOOK YOUR SPOT.\nDOMINATE THE ARENA.';
  const DEFAULT_DESC = 'Join daily Free Fire & Squad Tournaments.\nCompete, Win, Get Rewarded.';
  const sanitizeText = (value?: string) => {
    if (!value) return '';
    if (value === DEFAULT_TITLE) return '';
    if (value === DEFAULT_DESC) return '';
    return value;
  };

  // Remove a single image from a banner
  // const handleRemoveBannerImage = async (bannerId: string, imagePath: string) => {
  //   try {
  //     const token = localStorage.getItem('adminToken');
  //     const res = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/admin/${bannerId}/remove-image`, {
  //       method: 'DELETE',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({ imagePath })
  //     });
  //     if (!res.ok) throw new Error('Failed to remove image');
  //     toast({ title: 'Removed', description: 'Banner image deleted.' });
  //     await fetchBannerData();
  //     await fetchAllBanners();
  //   } catch (e: any) {
  //     toast({ title: 'Error', description: e.message || 'Failed to remove image', variant: 'destructive' });
  //   }
  // };

  // const toRelativeUploadsPath = (url: string): string => {
  //   if (!url) return url;
  //   const uploadsIdx = url.indexOf('/uploads/');
  //   if (uploadsIdx !== -1) {
  //     return url.substring(uploadsIdx);
  //   }
  //   // Fallback: strip API base if present
  //   const apiBase = import.meta.env.VITE_API_URL as string;
  //   if (apiBase && url.startsWith(apiBase)) {
  //     return url.replace(apiBase, '');
  //   }
  //   return url;
  // };

  useEffect(() => {
    // Check if admin is logged in
    const isAdmin = localStorage.getItem("isAdmin");
    const adminToken = localStorage.getItem("adminToken");

    if (!isAdmin || !adminToken) {
      navigate("/al-admin-128900441");
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

    // Initialize users
    fetchUsers();

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
    navigate("/al-admin-128900441");
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
    
    // Validate required banner image
    if (!slotBannerFile) {
      toast({
        title: "Error",
        description: "Banner image is required to create a match",
        variant: "destructive",
      });
      return;
    }
    
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
        mapName: formData.mapName,
        gameMode: formData.gameMode,
        tournamentName: formData.tournamentName,
        hostName: formData.hostName,
        maxPlayers: Number(formData.maxPlayers),
        rules: formData.rules,
        prizeDistribution: formData.prizeDistribution,
        streamLink: formData.streamLink,
        discordLink: formData.discordLink,
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
      fetchGameModes();
      fetchGameMaps();
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
          _id: data._id,
          title: data.title,
          description: data.description,
          buttonText: data.buttonText,
          buttonLink: data.buttonLink,
          backgroundImage: data.backgroundImage,
          bannerImages: data.bannerImages || []
        } as any);
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

      // Create banner data objects for each file
      const newBannerData = files.map((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          setMultipleBannerData(prev => prev.map((item, i) => 
            i === index ? { ...item, preview } : item
          ));
        };
        reader.readAsDataURL(file);

        return {
          title: '',
          description: '',
          buttonText: '',
          buttonLink: '',
          file: file,
          preview: ''
        };
      });

      setMultipleBannerData(newBannerData);
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

  // Upload single banner image with metadata
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
      formData.append('title', singleBannerForm.title);
      formData.append('description', singleBannerForm.description);
      formData.append('buttonText', singleBannerForm.buttonText);
      formData.append('buttonLink', singleBannerForm.buttonLink);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/admin/upload-hero`, {
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
          description: "Banner uploaded successfully",
        });

        // Clear the file, preview, and form data
        setBannerFile(null);
        setBannerPreview('');
        setSingleBannerForm({
          title: '',
          description: '',
          buttonText: '',
          buttonLink: ''
        });

        // Refresh banner data
        fetchBannerData();
        fetchAllBanners();
      } else {
        throw new Error('Failed to upload banner');
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: "Error",
        description: "Failed to upload banner",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload multiple banner images with metadata
  const handleUploadMultipleImages = async () => {
    if (multipleBannerData.length === 0) {
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
      
      // Upload each banner with its metadata
      for (const banner of multipleBannerData) {
        if (!banner.file) continue;

        const formData = new FormData();
        formData.append('banner', banner.file);
        formData.append('title', banner.title);
        formData.append('description', banner.description);
        formData.append('buttonText', banner.buttonText);
        formData.append('buttonLink', banner.buttonLink);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/admin/upload-hero`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

        if (!response.ok) {
          throw new Error(`Failed to upload banner: ${banner.title || 'Untitled'}`);
        }
      }

        toast({
          title: "Success",
        description: `${multipleBannerData.length} banners uploaded successfully`,
        });

      // Clear the data
        setBannerFiles([]);
        setBannerPreviews([]);
      setMultipleBannerData([]);
        setShowMultipleUpload(false);

      // Refresh banner data
      fetchBannerData();
      fetchAllBanners();
    } catch (error) {
      console.error('Error uploading multiple banners:', error);
      toast({
        title: "Error",
        description: "Failed to upload banners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  // Remove individual banner image
  const handleRemoveBannerImage = async (bannerId: string, imagePath: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/admin/${bannerId}/remove-image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imagePath })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Banner image removed successfully",
        });
        fetchBannerData(); // Refresh banner data
        fetchAllBanners(); // Refresh all banners
      } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to remove banner image');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove banner image",
        variant: "destructive",
      });
    }
  };

  // Helper function to convert full URL to relative path
  const toRelativeUploadsPath = (fullUrl: string): string => {
    // Extract the relative path from the full URL
    const url = new URL(fullUrl);
    return url.pathname; // This will be like "/uploads/banners/filename.jpg"
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

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/admin/upload-hero`, {
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
          buttonLink: bannerData.buttonLink,
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
    setMobileBannerImage(null);
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
      if (mobileBannerImage && mobileBannerImage.originFileObj) {
        formData.append('mobileBannerImage', mobileBannerImage.originFileObj);
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
      if (mobileBannerImage && mobileBannerImage.originFileObj) {
        formData.append('mobileBannerImage', mobileBannerImage.originFileObj);
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

  // Game Map Management Functions
  const resetGameMapForm = () => {
    setGameMapName('');
    setEditingGameMap(null);
    setIsSubmittingGameMap(false);
  };

  const fetchGameMaps = async () => {
    try {
      setLoadingGameMaps(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gamemaps`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const gameMapsArray = Array.isArray(data) ? data : (data.gameMaps || []);
        setGameMaps(gameMapsArray);
      } else {
        throw new Error('Failed to fetch game maps');
      }
    } catch (error) {
      console.error('Error fetching game maps:', error);
      toast({ title: 'Error', description: 'Failed to fetch game maps', variant: 'destructive' });
    } finally {
      setLoadingGameMaps(false);
    }
  };

  const handleCreateGameMap = async () => {
    try {
      setIsSubmittingGameMap(true);
      if (!gameMapName.trim()) {
        toast({ title: 'Error', description: 'Game map name is required', variant: 'destructive' });
        return;
      }
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gamemaps`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameMap: gameMapName })
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Game map created successfully' });
        resetGameMapForm();
        fetchGameMaps();
      } else {
        const err = await response.json();
        throw new Error(err.msg || 'Failed to create game map');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create game map', variant: 'destructive' });
    } finally {
      setIsSubmittingGameMap(false);
    }
  };

  const handleEditGameMap = (map: any) => {
    setEditingGameMap(map);
    setGameMapName(map.gameMap || map.name || '');
  };

  const handleUpdateGameMap = async () => {
    if (!editingGameMap) return;
    try {
      setIsSubmittingGameMap(true);
      if (!gameMapName.trim()) {
        toast({ title: 'Error', description: 'Game map name is required', variant: 'destructive' });
        return;
      }
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gamemaps/${editingGameMap._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameMap: gameMapName })
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Game map updated successfully' });
        resetGameMapForm();
        fetchGameMaps();
      } else {
        throw new Error('Failed to update game map');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update game map', variant: 'destructive' });
    } finally {
      setIsSubmittingGameMap(false);
    }
  };

  const handleDeleteGameMap = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gamemaps/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Game map deleted successfully' });
        fetchGameMaps();
      } else {
        throw new Error('Failed to delete game map');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete game map', variant: 'destructive' });
    }
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
        // Optimistically remove from local state to reflect immediately
        setGameModes((prev: any[]) => prev.filter((gm: any) => gm._id !== gameModeId));
        // Also refresh from server in background to stay in sync
        fetchGameModes();
      } else {
        try {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to delete game mode');
        } catch {
          throw new Error('Failed to delete game mode');
        }
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

  // Game Map Management UI
  const renderGameMapManagement = () => {
    return (
      <div className="space-y-6">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white">Game Map Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Game Map Form */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="gameMapName" className="text-white">Game Map Name</Label>
                  <Input
                    id="gameMapName"
                    placeholder="Enter game map name (e.g., Bermuda, Purgatory)"
                    value={gameMapName}
                    onChange={(e) => setGameMapName(e.target.value)}
                    className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                {editingGameMap ? (
                  <>
                    <Button type="button" variant="outline" onClick={resetGameMapForm} className="mr-2 text-white border-[#3A3A3A]">Cancel</Button>
                    <Button type="button" onClick={handleUpdateGameMap} disabled={isSubmittingGameMap} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                      {isSubmittingGameMap ? 'Updating...' : 'Update Game Map'}
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={handleCreateGameMap} disabled={isSubmittingGameMap} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSubmittingGameMap ? 'Creating...' : 'Create Game Map'}
                  </Button>
                )}
              </div>
            </div>

            {/* Game Map List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Existing Game Maps</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loadingGameMaps ? (
                  <div className="col-span-3 flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                  </div>
                ) : !Array.isArray(gameMaps) || gameMaps.length === 0 ? (
                  <div className="col-span-3 text-center p-8 border border-dashed border-[#3A3A3A] rounded-lg">
                    <p className="text-gray-400">No game maps found. Create your first game map above.</p>
                  </div>
                ) : (
                  gameMaps.map((map, index) => (
                    <Card key={map._id || `gamemap-${index}`} className="bg-[#222222] border-[#2A2A2A] overflow-hidden">
                      <CardContent className="p-4 flex items-center justify-between">
                        <h4 className="text-lg font-medium text-white">{map.gameMap || map.name}</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditGameMap(map)} className="h-8 w-8 p-0 text-white border-[#3A3A3A]">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => map._id && handleDeleteGameMap(map._id)} className="h-8 w-8 p-0">
                            <Trash className="h-4 w-4" />
                          </Button>
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-500">
                          Image selected: {gameTypeImage.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGameTypeImage(null)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Remove image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="mobileBannerImage" className="text-white">Mobile Size Banner Image</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('mobileBannerImageInput').click()}
                      className="text-white border-[#3A3A3A]"
                    >
                      <Image className="mr-2 h-4 w-4" /> Upload Mobile Banner
                    </Button>
                    <input
                      id="mobileBannerImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setMobileBannerImage({
                            uid: '-1',
                            name: file.name,
                            status: 'done',
                            url: URL.createObjectURL(file),
                            originFileObj: file,
                          });
                        }
                      }}
                    />
                    {mobileBannerImage && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-500">
                          Mobile Banner selected: {mobileBannerImage.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMobileBannerImage(null)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Remove mobile banner"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
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
              {/* Banner Image Upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerFileChange}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              {bannerPreview && (
                  <div className="w-full max-w-md mt-2">
                  <img src={bannerPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                </div>
              )}
              </div>

              {/* Banner Title */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Banner Title</label>
                <input
                  type="text"
                  value={singleBannerForm.title}
                  onChange={(e) => setSingleBannerForm({ ...singleBannerForm, title: e.target.value })}
                  placeholder="Enter banner title (use \n for line breaks)"
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Banner Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Banner Description</label>
                <textarea
                  value={singleBannerForm.description}
                  onChange={(e) => setSingleBannerForm({ ...singleBannerForm, description: e.target.value })}
                  placeholder="Enter banner description (use \n for line breaks)"
                  rows={3}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Button Text */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Button Text</label>
                <input
                  type="text"
                  value={singleBannerForm.buttonText}
                  onChange={(e) => setSingleBannerForm({ ...singleBannerForm, buttonText: e.target.value })}
                  placeholder="Enter button text"
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Button Link */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Button Link</label>
                <input
                  type="url"
                  value={singleBannerForm.buttonLink}
                  onChange={(e) => setSingleBannerForm({ ...singleBannerForm, buttonLink: e.target.value })}
                  placeholder="Enter button link (e.g., https://example.com)"
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

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
          {/* <div className="border-b border-[#2A2A2A] pb-6">
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
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Select Multiple Banner Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleBannerFiles}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                />
                </div>

                {multipleBannerData.length > 0 && (
                  <div className="space-y-6">
                    <h4 className="text-md font-medium text-white">Configure Each Banner:</h4>
                    {multipleBannerData.map((banner, index) => (
                      <div key={index} className="border border-[#2A2A2A] rounded-lg p-4 bg-[#2A2A2A]">
                        <div className="flex items-center mb-3">
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded mr-2">
                            Banner {index + 1}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">Image Preview</label>
                            {banner.preview && (
                              <img
                                src={banner.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                            )}
                      </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">Title</label>
                              <input
                                type="text"
                                value={banner.title}
                                onChange={(e) => {
                                  const newData = [...multipleBannerData];
                                  newData[index].title = e.target.value;
                                  setMultipleBannerData(newData);
                                }}
                                placeholder="Enter banner title"
                                className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 text-sm"
                              />
                  </div>

                            <div>
                              <label className="block text-sm font-medium text-white mb-1">Description</label>
                              <textarea
                                value={banner.description}
                                onChange={(e) => {
                                  const newData = [...multipleBannerData];
                                  newData[index].description = e.target.value;
                                  setMultipleBannerData(newData);
                                }}
                                placeholder="Enter banner description"
                                rows={2}
                                className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 resize-none text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-white mb-1">Button Text</label>
                              <input
                                type="text"
                                value={banner.buttonText}
                                onChange={(e) => {
                                  const newData = [...multipleBannerData];
                                  newData[index].buttonText = e.target.value;
                                  setMultipleBannerData(newData);
                                }}
                                placeholder="Enter button text"
                                className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                <Button
                  onClick={handleUploadMultipleImages}
                      disabled={multipleBannerData.length === 0 || loading}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                      {loading ? 'Uploading...' : `Upload ${multipleBannerData.length} Banners`}
                </Button>
              </div>
            )}
          </div>
            )}
          </div> */}

          {/* Current Banner Info */}
          {bannerData && (
            <div className="border-b border-[#2A2A2A] pb-6">
              <h3 className="text-lg font-medium text-white mb-3">Current Banner</h3>
              <div className="space-y-3">
                {/* <p className="text-gray-300"><strong className="text-white">Title:</strong> {sanitizeText(bannerData.title)}</p> */}
                {/* <p className="text-gray-300"><strong className="text-white">Subtitle:</strong> {bannerData.subtitle}</p> */}
                {/* Status removed by request */}
                {bannerData.bannerImages && bannerData.bannerImages.length > 0 && (
                  <div>
                    <p className="mb-2 text-white"><strong>Banner Images ({bannerData.bannerImages.length}):</strong></p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {bannerData.bannerImages.map((image, index) => (
                        <div key={index} className="relative group">
                        <img
                            src={image}
                          alt={`Banner ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-[#2A2A2A]"
                        />
                          <button
                            className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                            title="Delete image"
                            onClick={() => handleRemoveBannerImage(bannerData._id as any, toRelativeUploadsPath(image as any))}
                          >
                            Delete
                          </button>
                        </div>
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
                      <h4 className="font-medium text-white">{sanitizeText(banner.title)}</h4>
                      <p className="text-sm text-gray-300">{sanitizeText(banner.subtitle)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleDeleteBanner(banner._id)}
                        size="sm"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm mb-3">
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


  const [userSearch, setUserSearch] = useState('');
  const [showUserBookingsModal, setShowUserBookingsModal] = useState(false);
  const [selectedUserForBookings, setSelectedUserForBookings] = useState<any | null>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [loadingUserBookings, setLoadingUserBookings] = useState(false);

  // User Transactions Modal state
  const [showUserTransactionsModal, setShowUserTransactionsModal] = useState(false);
  const [selectedUserForTransactions, setSelectedUserForTransactions] = useState<any | null>(null);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loadingUserTransactions, setLoadingUserTransactions] = useState(false);


  const openUserBookings = async (user: any) => {
    try {
      setSelectedUserForBookings(user);
      setShowUserBookingsModal(true);
      setLoadingUserBookings(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots/user/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch user bookings');
      const data = await res.json();
      // Expect data to be array; fallback to data.bookings
      const list = Array.isArray(data) ? data : (data.bookings || []);
      setUserBookings(list);
    } catch (e: any) {
      setUserBookings([]);
      toast({ title: 'Error', description: e.message || 'Failed to load bookings', variant: 'destructive' });
    } finally {
      setLoadingUserBookings(false);
    }
  };

  const openUserTransactions = async (user: any) => {
    try {
      setSelectedUserForTransactions(user);
      setShowUserTransactionsModal(true);
      setLoadingUserTransactions(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/transactions`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user._id, page: 1, limit: 100 })
      });
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.transactions || data.data || []);
      setUserTransactions(list);
    } catch (e: any) {
      setUserTransactions([]);
      toast({ title: 'Error', description: e.message || 'Failed to load transactions', variant: 'destructive' });
    } finally {
      setLoadingUserTransactions(false);
    }
  };

  // User editing functions
  const openEditUser = (user: any) => {
    setEditingUser(user);
    setEditUserData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      freeFireUsername: user.freeFireUsername || '',
      wallet: user.wallet?.toString() || '0',
      isAdmin: user.isAdmin || false
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setIsUpdatingUser(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/admin/update/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editUserData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        setShowEditUserModal(false);
        fetchUsers(); // Refresh users list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update user",
      });
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleAddWinMoney = async () => {
    if (!editingUser || !winMoneyAmount) return;

    try {
      setIsUpdatingUser(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/update-user-win-money`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: editingUser._id,
          amount: parseFloat(winMoneyAmount)
        })
      });

      if (response.ok) {
        toast({ title: 'Success', description: `Added ₹${winMoneyAmount} to win money` });
        setWinMoneyAmount('');
        fetchUsers();
      } else {
        const err = await response.json();
        throw new Error(err?.error || 'Failed to add win money');
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e?.message || 'Request failed' });
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Add new user functions
  const resetNewUserForm = () => {
    setNewUserData({
      name: '',
      email: '',
      phone: '',
      password: '',
      freeFireUsername: '',
      wallet: '0',
      isAdmin: false
    });
  };

  const handleCreateUser = async () => {
    try {
      setIsCreatingUser(true);

      // Validate required fields
      if (!newUserData.name.trim() || !newUserData.email.trim() || !newUserData.phone.trim() || !newUserData.password.trim() || !newUserData.freeFireUsername.trim()) {
        toast({
          title: "Error",
          description: "All fields are required",
          variant: "destructive",
        });
        return;
      }

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newUserData.name,
          email: newUserData.email,
          phone: newUserData.phone,
          password: newUserData.password,
          freeFireUsername: newUserData.freeFireUsername,
          wallet: parseFloat(newUserData.wallet) || 0,
          isAdmin: newUserData.isAdmin
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User created successfully",
        });
        setShowAddUserModal(false);
        resetNewUserForm();
        fetchUsers(); // Refresh users list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create user",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (user: any) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchUsers(); // Refresh users list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete user",
      });
    }
  };

  const renderUsers = () => (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
        <CardTitle className="text-white">Users Management ({users.length} Users)</CardTitle>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name, email, phone, username"
              className="w-full max-w-md bg-[#222] border border-[#333] text-white rounded px-3 py-2"
            />
            <Button
              onClick={() => setShowAddUserModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </div>
        </div>
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
                  <th className="text-left p-3 text-white">User ID</th>
                  <th className="text-left p-3 text-white">Free Fire Username</th>
                  <th className="text-left p-3 text-white">Wallet</th>
                  <th className="text-left p-3 text-white">Joined</th>
                  <th className="text-right p-3 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((user: any) => {
                    if (!userSearch.trim()) return true;
                    const q = userSearch.toLowerCase();
                    return (
                      (user.name || '').toLowerCase().includes(q) ||
                      (user.email || '').toLowerCase().includes(q) ||
                      (user.phone || '').toLowerCase().includes(q) ||
                      (user.freeFireUsername || '').toLowerCase().includes(q) ||
                      ((user.referCode || user.userId || user.referralCode || user.refCode || user._id || '') + '').toLowerCase().includes(q)
                    );
                  })
                  .map((user: any) => (
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
                      <span className="bg-[#2A2A2A] px-2 py-1 rounded text-cyan-300 font-mono">
                        {(user.referCode || user.userId || user.referralCode || user.refCode || user._id) as any}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="bg-[#2A2A2A] px-2 py-1 rounded text-yellow-400 font-mono">
                        {user.freeFireUsername}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-green-400 font-bold">₹{Math.floor(user.wallet || 0)}</span>
                    </td>
                    <td className="p-3 text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openEditUser(user)}>Edit</Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openUserBookings(user)}>View Bookings</Button>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => openUserTransactions(user)}>Transactions</Button>
                      <Button 
                        size="sm" 
                        className="bg-red-600 hover:bg-red-700 text-white" 
                        onClick={() => handleDeleteUser(user)}
                      >
                        Delete
                      </Button>
                    </div>
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'banner' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('banner')}
          >
            <Image className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Banner</span>}
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
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'users' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <Users className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Users</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'nftHolders' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('nftHolders')}
          >
            <Trophy className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">NFT Holders</span>}
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
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'revenue' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('revenue')}
          >
            <DollarSign className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Revenue</span>}
          </Button>
          
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'allTransactions' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('allTransactions')}
          >
            <History className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">All Transactions</span>}
          </Button>
          
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'apkManagement' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('apkManagement')}
          >
            <Smartphone className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">APK Management</span>}
          </Button>
         
         
         
          {/* <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'winners' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('winners')}
          >
            <Trophy className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Winners</span>}
          </Button> */}
         
          {/* <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'slotCredentials' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('slotCredentials')}
          >
            <KeyRound className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">ID/Password</span>}
          </Button> */}
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
              {isSidebarOpen && <span className="text-white">Announcement Send</span>}
            </Button>
          <Button
              variant="ghost"
              className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'htmlAnnouncements' ? 'bg-[#2A2A2A]' : ''}`}
              onClick={() => setActiveSection('htmlAnnouncements')}
            >
              <AlertCircle className="h-4 w-4 mr-3" />
              {isSidebarOpen && <span className="text-white">HTML Announcements</span>}
            </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 py-2 text-white hover:text-white hover:bg-[#2A2A2A] ${activeSection === 'blog' ? 'bg-[#2A2A2A]' : ''}`}
            onClick={() => setActiveSection('blog')}
          >
            <AlertCircle className="h-4 w-4 mr-3" />
            {isSidebarOpen && <span className="text-white">Blog</span>}
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
            {isSidebarOpen && <span className="text-white">Announcement Send</span>}
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
            {activeSection === 'nftHolders' && 'NFT Holders Management'}
            {activeSection === 'matches' && 'Matches Management'}
            {activeSection === 'revenue' && 'Revenue & Withdrawals'}
            {activeSection === 'banner' && 'Banner Management'}
            {activeSection === 'gameTypes' && 'Game Types Management'}
            {activeSection === 'gameModes' && 'Game Modes Management'}
            {activeSection === 'allTransactions' && 'All Transactions History'}
            {activeSection === 'transactionHistory' && 'Transaction History'}
            {activeSection === 'apkManagement' && 'APK Management'}
            {activeSection === 'winners' && (
              <div className="flex items-center gap-3">
                <span>Winners Management</span>
                <Button
                  variant="outline"
                  className="ml-4 text-white border-[#2A2A2A]"
                  onClick={() => setActiveSection('matches')}
                >
                  ← Back to Matches
                </Button>
              </div>
            )}
          </h1>
        </header>

        <div className="p-6">
    {activeSection === 'dashboard' && renderDashboard()}
    {activeSection === 'users' && renderUsers()}
    {activeSection === 'nftHolders' && <NftHoldersManagement />}
    {activeSection === 'contactMessages' && <ContactMessagesTable />}
    {activeSection === 'announcementSender' && <AnnouncementSender />}
    {activeSection === 'htmlAnnouncements' && <AnnouncementManager />}
    {activeSection === 'allTransactions' && <AllTransactionsHistory />}
    {activeSection === 'transactionHistory' && <TransactionHistory />}
    {activeSection === 'apkManagement' && <APKManagement />}
    {activeSection === 'matches' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                    <CardTitle className="text-white flex items-center gap-2">
                      Auto Status Updates
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300">Active</p>
                    <p className="text-xs text-gray-400">Updates every minute</p>
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
              <MatchesManager
                slots={slots}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                customDateFrom={customDateFrom}
                setCustomDateFrom={setCustomDateFrom}
                customDateTo={customDateTo}
                setCustomDateTo={setCustomDateTo}
                showAddSlot={showAddSlot}
                setShowAddSlot={setShowAddSlot}
                formData={formData}
                setFormData={setFormData}
                initialFormData={initialFormData}
                slotBannerFile={slotBannerFile}
                setSlotBannerFile={setSlotBannerFile}
                slotBannerPreview={slotBannerPreview}
                setSlotBannerPreview={setSlotBannerPreview}
                handleSlotBannerFileChange={handleSlotBannerFileChange}
                gameTypes={gameTypes}
                gameModes={gameModes}
                gameMaps={gameMaps}
                handleCreateSlot={handleCreateSlot}
                getStatusColor={getStatusColor}
                getNextStatus={getNextStatus}
                handleUpdateMatchStatus={handleUpdateMatchStatus}
                handleDeleteSlot={handleDeleteSlot}
                Countdown={MatchCountdown}
                onEditSlot={(slot) => handleOpenEditSlot(slot)}
                onOpenRules={(slot) => {
                  setSelectedSlotId(slot._id);
                  setFormData((prev) => ({ ...prev, rules: slot.rules || '' }));
                  setShowTournamentRules(true);
                }}
                onOpenWinnerDetails={(slot) => {
                  setSelectedSlotId(slot._id);
                  setActiveSection('winners');
                }}
                onOpenIdPass={(slot) => {
                  setIdPassSlotId(slot._id);
                  setShowIdPassModal(true);
                }}
              />
                                      </>
                                    )}
          {activeSection === 'revenue' && renderRevenue()}
          {activeSection === 'banner' && renderBannerManagement()}
          {activeSection === 'gameTypes' && renderGameTypeManagement()}
          {activeSection === 'gameModes' && (
            <>
              {renderGameModeManagement()}
              {renderGameMapManagement()}
            </>
          )}
          {activeSection === 'winners' && (
            <div>
              <div className="mb-4">
                <Button
                  variant="outline"
                  className="text-white border-[#2A2A2A]"
                  onClick={() => setActiveSection('matches')}
                >
                  ← Back to Matches
                </Button>
              </div>
              <AdminWinnerDashboard filterSlotId={selectedSlotId || undefined} />
            </div>
          )}
          {activeSection === 'blog' && <BlogManagement />}
                              </div>
      </main>

      {/* Tournament Rules Modal */}
                    <Dialog open={showTournamentRules} onOpenChange={setShowTournamentRules}>
        <DialogContent className="max-w-3xl w-full bg-[#181818] border border-[#333] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Tournament Rules (HTML)</DialogTitle>
                        </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="rulesHtml" className="text-white">Rules Content</Label>
                            <textarea
                              id="rulesHtml"
                              value={formData.rules}
                              onChange={e => setFormData({ ...formData, rules: e.target.value })}
                              placeholder="Paste or write tournament rules HTML here..."
              className="w-full min-h-[200px] px-4 py-3 text-white bg-[#23272F] border-2 border-[#FF4D4F] focus:border-[#52C41A] rounded-lg outline-none"
              style={{ fontFamily: 'monospace' }}
                            />
                          </div>
          <DialogFooter>
            <Button onClick={handleSaveRules} className="bg-[#FF4D4F] hover:bg-[#FF7875] text-white">Save Rules</Button>
            <Button variant="outline" onClick={() => setShowTournamentRules(false)} className="border-[#2A2A2A] text-white">Close</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

      {/* ID/Pass Sender Modal */}
      <Dialog open={showIdPassModal} onOpenChange={setShowIdPassModal}>
        <DialogContent className="max-w-lg bg-[#0F0F0F] border border-[#2A2A2A] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Send ID / Password</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {idPassSlotId ? (
              <SendSlotCredentials slotId={idPassSlotId} />
            ) : (
              <div className="text-gray-400 text-sm">No match selected.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Slot Edit Modal */}
      <Dialog open={showEditSlot} onOpenChange={setShowEditSlot}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#0F0F0F] border border-[#2A2A2A] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Edit Match</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Match Title</Label>
                  <Input className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.matchTitle || ''} onChange={(e) => setEditData({ ...editData, matchTitle: e.target.value })} />
                </div>
                <div>
                  <Label className="text-white">Tournament Name</Label>
                  <Input className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.tournamentName || ''} onChange={(e) => setEditData({ ...editData, tournamentName: e.target.value })} />
                </div>
                <div>
                  <Label className="text-white">Host Name</Label>
                  <Input className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.hostName || ''} onChange={(e) => setEditData({ ...editData, hostName: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Game Settings */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">Game Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Game Type</Label>
                  <select
                    className="w-full p-2 rounded bg-[#1A1A1A] text-white border border-[#2A2A2A]"
                    value={editData.slotType || ''}
                    onChange={(e) => setEditData({ ...editData, slotType: e.target.value })}
                  >
                    {Array.isArray(gameTypes) && gameTypes.length > 0 ? (
                      gameTypes.map((g: any) => (
                        <option key={g._id} value={g.gameType}>{g.gameType}</option>
                      ))
                    ) : (
                      <>
                        <option value="Solo">Solo</option>
                        <option value="Duo">Duo</option>
                        <option value="Squad">Squad</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <Label className="text-white">Map</Label>
                  <select
                    className="w-full p-2 rounded bg-[#1A1A1A] text-white border border-[#2A2A2A]"
                    value={editData.mapName || ''}
                    onChange={(e) => setEditData({ ...editData, mapName: e.target.value })}
                  >
                    {Array.isArray(gameMaps) && gameMaps.length > 0 ? (
                      gameMaps.map((m: any) => (
                        <option key={m._id || m.gameMap} value={m.gameMap || m.name}>{m.gameMap || m.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Bermuda">Bermuda</option>
                        <option value="Purgatory">Purgatory</option>
                        <option value="Kalahari">Kalahari</option>
                        <option value="Alpine">Alpine</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <Label className="text-white">Game Mode</Label>
                  <select
                    className="w-full p-2 rounded bg-[#1A1A1A] text-white border border-[#2A2A2A]"
                    value={editData.gameMode || ''}
                    onChange={(e) => setEditData({ ...editData, gameMode: e.target.value })}
                  >
                    {Array.isArray(gameModes) && gameModes.length > 0 ? (
                      gameModes.map((gm: any) => (
                        <option key={gm._id} value={gm.gameMode}>{gm.gameMode}</option>
                      ))
                    ) : (
                      <>
                        <option value="Solo">Solo</option>
                        <option value="Duo">Duo</option>
                        <option value="Squad">Squad</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Match Configuration */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">Match Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Entry Fee</Label>
                  <Input type="number" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.entryFee ?? ''} onChange={(e) => setEditData({ ...editData, entryFee: e.target.value })} />
                </div>
                <div>
                  <Label className="text-white">Per Kill</Label>
                  <Input type="number" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.perKill ?? ''} onChange={(e) => setEditData({ ...editData, perKill: e.target.value })} />
                </div>
                <div>
                  <Label className="text-white">Winner Prize</Label>
                  <Input type="number" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.totalWinningPrice ?? ''} onChange={(e) => setEditData({ ...editData, totalWinningPrice: e.target.value })} />
                </div>
                <div>
                  <Label className="text-white">Match Time</Label>
                  <Input type="datetime-local" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.matchTime || ''} onChange={(e) => setEditData({ ...editData, matchTime: e.target.value })} />
                  <div className="text-xs text-gray-400 mt-1">
                    {editData.matchTime ? new Date(editData.matchTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '') : ''}
                  </div>
                </div>
                <div>
                  <Label className="text-white">Custom Start (Minutes)</Label>
                  <Input type="number" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.customStartInMinutes ?? ''} onChange={(e) => setEditData({ ...editData, customStartInMinutes: e.target.value })} />
                </div>
                <div>
                  <Label className="text-white">Max Players</Label>
                  <Input type="number" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.maxPlayers ?? ''} onChange={(e) => setEditData({ ...editData, maxPlayers: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">1st Place Prize</Label>
                  <Input type="number" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.firstwin ?? ''} onChange={(e) => setEditData({ ...editData, firstwin: e.target.value })} />
                </div>
                <div>
                  <Label className="text-white">2nd Place Prize</Label>
                  <Input type="number" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.secwin ?? ''} onChange={(e) => setEditData({ ...editData, secwin: e.target.value })} />
                </div>
                <div>
                  <Label className="text-white">3rd Place Prize</Label>
                  <Input type="number" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.thirdwin ?? ''} onChange={(e) => setEditData({ ...editData, thirdwin: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Stream Link</Label>
                  <Input type="url" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.streamLink || ''} onChange={(e) => setEditData({ ...editData, streamLink: e.target.value })} />
                </div>
                <div>
                  <Label className="text-white">Discord Link</Label>
                  <Input type="url" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.discordLink || ''} onChange={(e) => setEditData({ ...editData, discordLink: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Rules</Label>
                  <textarea className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md text-white resize-none h-20" value={editData.rules || ''} onChange={(e) => setEditData({ ...editData, rules: e.target.value })} />
                </div>
                <div>
                  <Label className="text-white">Prize Distribution</Label>
                  <Input type="text" className="bg-[#1A1A1A] border-[#2A2A2A] text-white" value={editData.prizeDistribution || ''} onChange={(e) => setEditData({ ...editData, prizeDistribution: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Banner Image */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">Banner Image</h3>
              <div>
                <Label className="text-white">Banner Image URL</Label>
                <Input
                  type="text"
                  placeholder="https://.../your-banner.jpg"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white mb-3"
                  value={editData.bannerImage || ''}
                  onChange={(e) => setEditData({ ...editData, bannerImage: e.target.value })}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditBannerFileChange}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
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
                  <p className="text-xs text-gray-400 mt-1">Tip: You can paste a banner image URL above. File upload requires a server upload endpoint.</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditSlot(false)} className="border-[#2A2A2A] text-white">Cancel</Button>
              <Button onClick={handleUpdateSlot} className="bg-blue-600 hover:bg-blue-700">Save</Button>
            </DialogFooter>
          </div>
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

      {/* User Bookings Modal */}
      <Dialog open={showUserBookingsModal} onOpenChange={setShowUserBookingsModal}>
        <DialogContent className="max-w-5xl bg-[#0F0F0F] border border-[#2A2A2A] text-white rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white tracking-wide">{selectedUserForBookings ? `${selectedUserForBookings.name}'s Bookings` : 'User Bookings'}</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto rounded-lg border border-[#2A2A2A]">
            {loadingUserBookings ? (
              <div className="p-8 flex justify-center">
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : userBookings.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No bookings found for this user.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#141414] sticky top-0 z-10">
                  <tr className="border-b border-[#2A2A2A]">
                    <th className="text-left px-4 py-3 text-white">Match Title</th>
                    <th className="text-left px-4 py-3 text-white">Slot Type</th>
                    <th className="text-left px-4 py-3 text-white">Status</th>
                    <th className="text-left px-4 py-3 text-white">Match Time</th>
                    <th className="text-right px-4 py-3 text-white">Entry Fee</th>
                    <th className="text-right px-4 py-3 text-white">Total Amount</th>
                    <th className="text-left px-4 py-3 text-white">Booked On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {userBookings.map((b: any) => (
                    <tr key={b._id} className="even:bg-[#101010] hover:bg-[#1A1A1A] transition-colors">
                      <td className="px-4 py-3 text-white max-w-[260px] truncate" title={b.slot?.matchTitle || '-'}>{b.slot?.matchTitle || '-'}</td>
                      <td className="px-4 py-3 text-white">{b.slot?.slotType || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`${(b.slot?.status || 'upcoming') === 'live' ? 'bg-green-600' : (b.slot?.status === 'completed' ? 'bg-gray-600' : 'bg-blue-600')} text-white text-xs px-2 py-1 rounded`}>{(b.slot?.status || '-')}</span>
                      </td>
                      <td className="px-4 py-3 text-white whitespace-nowrap">{b.slot?.matchTime ? new Date(b.slot.matchTime).toLocaleString('en-IN') : '-'}</td>
                      <td className="px-4 py-3 text-right text-white">₹{b.slot?.entryFee ?? 0}</td>
                      <td className="px-4 py-3 text-right text-white">₹{b.totalAmount ?? 0}</td>
                      <td className="px-4 py-3 text-white whitespace-nowrap">{b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* User Transactions Modal */}
      <Dialog open={showUserTransactionsModal} onOpenChange={setShowUserTransactionsModal}>
        <DialogContent className="max-w-5xl bg-[#0F0F0F] border border-[#2A2A2A] text-white rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white tracking-wide">{selectedUserForTransactions ? `${selectedUserForTransactions.name}'s Transactions` : 'User Transactions'}</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto rounded-lg border border-[#2A2A2A]">
            {loadingUserTransactions ? (
              <div className="p-8 flex justify-center">
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : userTransactions.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No transactions found for this user.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#141414] sticky top-0 z-10">
                  <tr className="border-b border-[#2A2A2A]">
                    <th className="text-left px-4 py-3 text-white">Date</th>
                    <th className="text-left px-4 py-3 text-white">Type</th>
                    <th className="text-left px-4 py-3 text-white">Description</th>
                    <th className="text-left px-4 py-3 text-white">Status</th>
                    <th className="text-right px-4 py-3 text-white">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {userTransactions.map((t: any) => (
                    <tr key={t._id || t.transactionId} className="even:bg-[#101010] hover:bg-[#1A1A1A] transition-colors">
                      <td className="px-4 py-3 text-white whitespace-nowrap">{t.createdAt ? new Date(t.createdAt).toLocaleString('en-IN') : '-'}</td>
                      <td className="px-4 py-3 text-white">{t.type || '-'}</td>
                      <td className="px-4 py-3 text-white">{t.description || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">{t.status || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-white">₹{t.amount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
        <DialogContent className="max-w-2xl bg-[#0F0F0F] border border-[#2A2A2A] text-white rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white tracking-wide">Edit User Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editUserName" className="text-white">Name</Label>
                <Input
                  id="editUserName"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="editUserEmail" className="text-white">Email</Label>
                <Input
                  id="editUserEmail"
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editUserPhone" className="text-white">Phone</Label>
                <Input
                  id="editUserPhone"
                  value={editUserData.phone}
                  onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="editUserFFUsername" className="text-white">Free Fire Username</Label>
                <Input
                  id="editUserFFUsername"
                  value={editUserData.freeFireUsername}
                  onChange={(e) => setEditUserData({ ...editUserData, freeFireUsername: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editUserWallet" className="text-white">Wallet Balance</Label>
                <Input
                  id="editUserWallet"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editUserData.wallet}
                  onChange={(e) => setEditUserData({ ...editUserData, wallet: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="editUserIsAdmin"
                  checked={editUserData.isAdmin}
                  onChange={(e) => setEditUserData({ ...editUserData, isAdmin: e.target.checked })}
                  className="w-4 h-4 text-green-600 bg-[#1A1A1A] border-[#2A2A2A] rounded focus:ring-green-500 focus:ring-2"
                />
                <Label htmlFor="editUserIsAdmin" className="text-white cursor-pointer">Admin Access</Label>
              </div>
            </div>

            {/* Add win money (counts in totalEarnings) */}
            <div className="space-y-2 mt-2">
              <Label htmlFor="winMoneyAmount" className="text-white">Add Win Money (totalEarnings)</Label>
              <div className="flex gap-2">
                <Input
                  id="winMoneyAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={winMoneyAmount}
                  onChange={(e) => setWinMoneyAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                />
                <Button
                  type="button"
                  onClick={handleAddWinMoney}
                  disabled={isUpdatingUser || !winMoneyAmount}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Add Win Money
                </Button>
              </div>
              <p className="text-xs text-gray-400">Creates a WIN transaction like NFT distribution, so it shows in earnings.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditUserModal(false)}
              className="border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateUser}
              disabled={isUpdatingUser}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdatingUser ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Add New User</DialogTitle>
            <p className="text-gray-400 text-sm">
              Create a new user account with all necessary details.
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newUserName" className="text-white">Full Name *</Label>
                <Input
                  id="newUserName"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="newUserEmail" className="text-white">Email *</Label>
                <Input
                  id="newUserEmail"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="Enter email address"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newUserPhone" className="text-white">Phone *</Label>
                <Input
                  id="newUserPhone"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="newUserFFUsername" className="text-white">Free Fire Username *</Label>
                <Input
                  id="newUserFFUsername"
                  value={newUserData.freeFireUsername}
                  onChange={(e) => setNewUserData({ ...newUserData, freeFireUsername: e.target.value })}
                  placeholder="Enter Free Fire username"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newUserPassword" className="text-white">Password *</Label>
                <Input
                  id="newUserPassword"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Enter password"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="newUserWallet" className="text-white">Initial Wallet Balance</Label>
                <Input
                  id="newUserWallet"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newUserData.wallet}
                  onChange={(e) => setNewUserData({ ...newUserData, wallet: e.target.value })}
                  placeholder="Enter initial wallet balance"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="newUserIsAdmin"
                checked={newUserData.isAdmin}
                onChange={(e) => setNewUserData({ ...newUserData, isAdmin: e.target.checked })}
                className="w-4 h-4 text-green-600 bg-[#1A1A1A] border-[#2A2A2A] rounded focus:ring-green-500 focus:ring-2"
              />
              <Label htmlFor="newUserIsAdmin" className="text-white cursor-pointer">Admin Access</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddUserModal(false);
                resetNewUserForm();
              }}
              className="border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateUser}
              disabled={isCreatingUser}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isCreatingUser ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default AdminDashboard;
