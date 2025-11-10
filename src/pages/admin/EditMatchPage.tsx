import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';

const getNowLocalIsoMinutes = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${mi}`;
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

interface EditFormData {
  matchTitle: string;
  tournamentName: string;
  hostName: string;
  slotType: string;
  mapName: string;
  gameMode: string;
  entryFee: string;
  perKill: string;
  totalWinningPrice: string;
  matchTime: string;
  customStartInMinutes: string;
  maxPlayers: string;
  firstwin: string;
  secwin: string;
  thirdwin: string;
  streamLink: string;
  discordLink: string;
  prizeDistribution: string;
  bannerImage: string;
}

const EditMatchPage = () => {
  const { matchIndex } = useParams<{ matchIndex: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [slot, setSlot] = useState<any>(null);
  const [slotId, setSlotId] = useState<string | undefined>(undefined);
  
  const [editData, setEditData] = useState<EditFormData>({
    matchTitle: '',
    tournamentName: '',
    hostName: '',
    slotType: 'Solo',
    mapName: 'Bermuda',
    gameMode: 'Classic',
    entryFee: '',
    perKill: '',
    totalWinningPrice: '',
    matchTime: getNowLocalIsoMinutes(),
    customStartInMinutes: '',
    maxPlayers: '',
    firstwin: '',
    secwin: '',
    thirdwin: '',
    streamLink: '',
    discordLink: '',
    prizeDistribution: '',
    bannerImage: ''
  });

  const [editMatchTimeDisplay, setEditMatchTimeDisplay] = useState<string>('');
  
  // Edit banner image state
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null);
  const [editBannerPreview, setEditBannerPreview] = useState<string>('');
  const [existingEditBanners, setExistingEditBanners] = useState<string[]>([]);
  const [selectedExistingEditBanner, setSelectedExistingEditBanner] = useState<string | null>(null);
  const [showEditBannerGallery, setShowEditBannerGallery] = useState<boolean>(false);

  // Game types, maps, and modes
  const [gameTypes, setGameTypes] = useState<any[]>([]);
  const [gameMaps, setGameMaps] = useState<any[]>([]);
  const [gameModes, setGameModes] = useState<any[]>([]);

  // Fetch game types
  const fetchGameTypes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/game-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGameTypes(Array.isArray(data) ? data : (data.gameTypes || []));
      }
    } catch (e) {
      console.error('Error fetching game types:', e);
    }
  };

  // Fetch game maps
  const fetchGameMaps = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/game-maps`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGameMaps(Array.isArray(data) ? data : (data.gameMaps || []));
      }
    } catch (e) {
      console.error('Error fetching game maps:', e);
    }
  };

  // Fetch game modes
  const fetchGameModes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/game-modes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGameModes(Array.isArray(data) ? data : (data.gameModes || []));
      }
    } catch (e) {
      console.error('Error fetching game modes:', e);
    }
  };

  // Fetch slot by matchIndex
  useEffect(() => {
    const fetchSlotByMatchIndex = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        if (!token) {
          navigate('/al-admin-128900441');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.slots) {
            const foundSlot = data.slots.find((s: any) => 
              String(s.matchIndex) === String(matchIndex)
            );
            if (foundSlot && foundSlot._id) {
              setSlot(foundSlot);
              setSlotId(foundSlot._id);
              
              // Populate form data
              setEditData({
                matchTitle: foundSlot.matchTitle || '',
                tournamentName: foundSlot.tournamentName || '',
                hostName: foundSlot.hostName || '',
                slotType: foundSlot.slotType || 'Solo',
                mapName: foundSlot.mapName || 'Bermuda',
                gameMode: foundSlot.gameMode || 'Classic',
                entryFee: foundSlot.entryFee ?? '',
                perKill: foundSlot.perKill ?? '',
                totalWinningPrice: foundSlot.totalWinningPrice ?? '',
                matchTime: foundSlot.matchTime ? toLocalInputValue(foundSlot.matchTime) : getNowLocalIsoMinutes(),
                customStartInMinutes: foundSlot.customStartInMinutes ?? '',
                maxPlayers: foundSlot.maxPlayers ?? '',
                firstwin: foundSlot.firstwin ?? '',
                secwin: foundSlot.secwin ?? '',
                thirdwin: foundSlot.thirdwin ?? '',
                streamLink: foundSlot.streamLink || '',
                discordLink: foundSlot.discordLink || '',
                prizeDistribution: foundSlot.prizeDistribution || '',
                bannerImage: foundSlot.bannerImage || ''
              });

              // Set match time display
              try {
                const iso = foundSlot.matchTime ? new Date(foundSlot.matchTime).toISOString().slice(0, 16) : '';
                setEditMatchTimeDisplay(formatToDisplay(iso));
              } catch {
                setEditMatchTimeDisplay('');
              }

              // Load existing banners
              const all = (data.slots as any[])
                .map((s: any) => s?.bannerImage)
                .filter((b: any) => typeof b === 'string' && b.trim() !== '');
              const unique = Array.from(new Set(all)) as string[];
              if (unique.length > 0) setExistingEditBanners(unique);
            } else {
              toast({ 
                variant: 'destructive', 
                title: 'Match not found', 
                description: `Match #${matchIndex} could not be found.` 
              });
              navigate('/al-dashboard-1289/matches');
            }
          }
        } else {
          toast({ 
            variant: 'destructive', 
            title: 'Error', 
            description: 'Failed to fetch match data.' 
          });
          navigate('/al-dashboard-1289/matches');
        }
      } catch (error) {
        console.error('Error fetching slot by matchIndex:', error);
        toast({ 
          variant: 'destructive', 
          title: 'Error', 
          description: 'Failed to load match data.' 
        });
        navigate('/al-dashboard-1289/matches');
      } finally {
        setLoading(false);
      }
    };

    if (matchIndex) {
      fetchSlotByMatchIndex();
      fetchGameTypes();
      fetchGameMaps();
      fetchGameModes();
    }
  }, [matchIndex, navigate, toast]);

  // Fetch existing banners
  const fetchExistingEditBanners = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.slots || []);
      const all = (list as any[])
        .map((s: any) => s?.bannerImage)
        .filter((b: any) => typeof b === 'string' && b.trim() !== '');
      const unique = Array.from(new Set(all)) as string[];
      setExistingEditBanners(unique);
    } catch (e) {
      console.error('Error fetching existing banners for edit:', e);
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
    setSelectedExistingEditBanner(null);
    setEditData(prev => ({ ...prev, bannerImage: '' }));
  };

  // Handle update
  const handleUpdateSlot = async () => {
    if (!slotId) return;
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/al-admin-128900441');
        return;
      }

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
        prizeDistribution: editData.prizeDistribution || undefined,
        bannerImage: uploadedBannerUrl || selectedExistingEditBanner || editData.bannerImage || undefined
      };
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots/${slotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        toast({ 
          title: 'Updated', 
          description: result?.msg || 'Match updated successfully.' 
        });
        navigate('/al-dashboard-1289/matches');
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.msg || 'Failed to update match');
      }
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error?.message || 'Failed to update match' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0F0F0F] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!slot) {
    return (
      <div className="h-screen w-full bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-white">Match not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0F0F0F] text-white">
      <div className="w-full p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/al-dashboard-1289/matches')}
              className="border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Matches
            </Button>
            <h1 className="text-2xl font-bold text-white">
              Edit Match {matchIndex ? `#${matchIndex}` : ''}
            </h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">
              BASIC INFORMATION
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Match Title</Label>
                <Input
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.matchTitle}
                  onChange={(e) => setEditData({ ...editData, matchTitle: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white">Tournament Name</Label>
                <Input
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.tournamentName}
                  onChange={(e) => setEditData({ ...editData, tournamentName: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white">Host Name</Label>
                <Input
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.hostName}
                  onChange={(e) => setEditData({ ...editData, hostName: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Game Settings */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">
              GAME SETTINGS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Game Type</Label>
                <select
                  className="w-full p-2 rounded bg-[#1A1A1A] text-white border border-[#2A2A2A]"
                  value={editData.slotType}
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
                  value={editData.mapName}
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
                  value={editData.gameMode}
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
            <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">
              MATCH CONFIGURATION
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Entry Fee</Label>
                <Input
                  type="number"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.entryFee}
                  onChange={(e) => setEditData({ ...editData, entryFee: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white">Per Kill</Label>
                <Input
                  type="number"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.perKill}
                  onChange={(e) => setEditData({ ...editData, perKill: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white">Winner Prize</Label>
                <Input
                  type="number"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.totalWinningPrice}
                  onChange={(e) => setEditData({ ...editData, totalWinningPrice: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white">Match Time</Label>
                <Input
                  type="datetime-local"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.matchTime}
                  onChange={(e) => {
                    setEditData({ ...editData, matchTime: e.target.value });
                    setEditMatchTimeDisplay(formatToDisplay(e.target.value));
                  }}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {editMatchTimeDisplay || (editData.matchTime ? formatToDisplay(editData.matchTime) : '')}
                </div>
              </div>
              <div>
                <Label className="text-white">Custom Start (Minutes)</Label>
                <Input
                  type="number"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.customStartInMinutes}
                  onChange={(e) => setEditData({ ...editData, customStartInMinutes: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white">Max Players</Label>
                <Input
                  type="number"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.maxPlayers}
                  onChange={(e) => setEditData({ ...editData, maxPlayers: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-white">1st Place Prize</Label>
                <Input
                  type="number"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.firstwin}
                  onChange={(e) => setEditData({ ...editData, firstwin: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white">2nd Place Prize</Label>
                <Input
                  type="number"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.secwin}
                  onChange={(e) => setEditData({ ...editData, secwin: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white">3rd Place Prize</Label>
                <Input
                  type="number"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.thirdwin}
                  onChange={(e) => setEditData({ ...editData, thirdwin: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">
              ADDITIONAL INFORMATION
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Stream Link</Label>
                <Input
                  type="url"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.streamLink}
                  onChange={(e) => setEditData({ ...editData, streamLink: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white">Discord Link</Label>
                <Input
                  type="url"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.discordLink}
                  onChange={(e) => setEditData({ ...editData, discordLink: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-white">Prize Distribution</Label>
                <Input
                  type="text"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  value={editData.prizeDistribution}
                  onChange={(e) => setEditData({ ...editData, prizeDistribution: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Banner Image */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">
                BANNER IMAGE <span className="text-red-400">*</span>
              </h3>
              <Button
                type="button"
                variant="outline"
                className="text-white border-[#2A2A2A] hover:bg-[#2A2A2A]"
                onClick={() => {
                  if (existingEditBanners.length === 0) {
                    fetchExistingEditBanners();
                  }
                  setShowEditBannerGallery(!showEditBannerGallery);
                }}
              >
                {showEditBannerGallery ? 'Hide' : 'Use Existing'}
                {existingEditBanners.length > 0 ? ` (${existingEditBanners.length})` : ''}
              </Button>
            </div>

            {showEditBannerGallery && existingEditBanners.length > 0 && (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">Select from existing banners:</p>
                <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
                  {existingEditBanners.map((banner, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer border-2 rounded-lg overflow-hidden ${
                        selectedExistingEditBanner === banner
                          ? 'border-blue-500 ring-2 ring-blue-500'
                          : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                      }`}
                      onClick={() => {
                        setSelectedExistingEditBanner(banner);
                        setEditBannerFile(null);
                        setEditBannerPreview('');
                        setEditData({ ...editData, bannerImage: banner });
                      }}
                    >
                      <img
                        src={banner}
                        alt={`Banner ${index + 1}`}
                        className="w-full h-24 object-cover"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.onerror = null;
                          img.src = '/assets/images/category.png';
                        }}
                      />
                      {selectedExistingEditBanner === banner && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-white">Banner Image URL</Label>
              <Input
                type="text"
                placeholder="https://.../your-banner.jpg"
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white mb-3"
                value={editData.bannerImage}
                onChange={(e) => {
                  setEditData({ ...editData, bannerImage: e.target.value });
                  setSelectedExistingEditBanner(null);
                  setEditBannerFile(null);
                  setEditBannerPreview('');
                }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleEditBannerFileChange}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              <div className="mt-2">
                {(editBannerPreview || selectedExistingEditBanner || editData.bannerImage) && (
                  <img
                    src={editBannerPreview || selectedExistingEditBanner || editData.bannerImage || ''}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-[#2A2A2A]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-[#2A2A2A]">
            <Button
              variant="outline"
              onClick={() => navigate('/al-dashboard-1289/matches')}
              className="border-[#2A2A2A] text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSlot}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMatchPage;

