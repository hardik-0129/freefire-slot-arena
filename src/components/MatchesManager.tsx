import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users } from "lucide-react";
import axios from 'axios';

type StatusFilter = 'all' | 'upcoming' | 'live' | 'completed' | 'cancelled';
type DateFilter = 'all' | 'today' | 'yesterday' | 'tomorrow' | 'last3days' | 'custom';

type MatchesManagerProps = {
  slots: any[];
  // filters
  statusFilter: StatusFilter;
  setStatusFilter: React.Dispatch<React.SetStateAction<StatusFilter>>;
  dateFilter: DateFilter;
  setDateFilter: React.Dispatch<React.SetStateAction<DateFilter>>;
  customDateFrom: string;
  setCustomDateFrom: (v: string) => void;
  customDateTo: string;
  setCustomDateTo: (v: string) => void;
  // add match dialog
  showAddSlot: boolean;
  setShowAddSlot: (open: boolean) => void;
  formData: any;
  setFormData: (d: any) => void;
  initialFormData: any;
  slotBannerFile: File | null;
  setSlotBannerFile: (f: File | null) => void;
  slotBannerPreview: string;
  setSlotBannerPreview: (v: string) => void;
  handleSlotBannerFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  gameTypes: any[];
  gameModes: any[];
  gameMaps?: any[];
  handleCreateSlot: (e: React.FormEvent) => Promise<void> | void;
  // helpers/actions
  getStatusColor: (status: string) => string;
  getNextStatus: (status: string) => string | null;
  handleUpdateMatchStatus: (slotId: string, nextStatus: string) => void | Promise<void>;
  handleDeleteSlot: (slotId: string) => void | Promise<void>;
  // countdown renderer
  Countdown: React.ComponentType<{ matchTime: string }>;
  // actions outside this component
  onEditSlot?: (slot: any) => void;
  onOpenRules?: (slot: any) => void;
  onOpenWinnerDetails?: (slot: any) => void;
  onOpenIdPass?: (slot: any) => void;
};

const MatchesManager: React.FC<MatchesManagerProps> = ({
  slots,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  customDateFrom,
  setCustomDateFrom,
  customDateTo,
  setCustomDateTo,
  showAddSlot,
  setShowAddSlot,
  formData,
  setFormData,
  initialFormData,
  slotBannerFile,
  setSlotBannerFile,
  slotBannerPreview,
  setSlotBannerPreview,
  handleSlotBannerFileChange,
  gameTypes,
  gameModes,
  gameMaps,
  handleCreateSlot,
  getStatusColor,
  getNextStatus,
  handleUpdateMatchStatus,
  handleDeleteSlot,
  Countdown,
  onEditSlot,
  onOpenRules,
  onOpenWinnerDetails,
  onOpenIdPass,
}) => {
  // Helpers to show dd/MM/yyyy HH:mm in inputs while keeping ISO under the hood
  const formatToDisplay = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };

  const parseDisplayToISO = (val: string) => {
    const m = val.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
    if (!m) return '';
    const [, dd, mm, yyyy, hh, min] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
    if (isNaN(d.getTime())) return '';
    // Return in the ISO-like format we use (YYYY-MM-DDTHH:mm)
    const y = d.getFullYear();
    const m2 = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h2 = String(d.getHours()).padStart(2, '0');
    const mi2 = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m2}-${day}T${h2}:${mi2}`;
  };

  const [matchTimeDisplay, setMatchTimeDisplay] = useState<string>("");
  const [registrationDeadlineDisplay, setRegistrationDeadlineDisplay] = useState<string>("");
  const [cancelSlotId, setCancelSlotId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [savingCancel, setSavingCancel] = useState<boolean>(false);
  const [localSlots, setLocalSlots] = useState<any[]>(slots || []);

  useEffect(() => {
    setLocalSlots(slots || []);
  }, [slots]);

  useEffect(() => {
    setMatchTimeDisplay(formatToDisplay(formData.matchTime));
  }, [formData.matchTime]);

  useEffect(() => {
    setRegistrationDeadlineDisplay(formatToDisplay(formData.registrationDeadline));
  }, [formData.registrationDeadline]);

  return (
    <>
    <Card className="bg-[#1A1A1A] border-[#2A2A2A] mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Active Matches</CardTitle>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[180px] bg-[#111] text-white border-[#2A2A2A]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent className="bg-[#111] text-white border-[#2A2A2A]">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
            <SelectTrigger className="w-[200px] bg-[#111] text-white border-[#2A2A2A]">
              <SelectValue placeholder="Filter date" />
            </SelectTrigger>
            <SelectContent className="bg-[#111] text-white border-[#2A2A2A]">
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="last3days">Last 3 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="bg-[#111] text-white border border-[#2A2A2A] rounded px-2 py-1"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                className="bg-[#111] text-white border border-[#2A2A2A] rounded px-2 py-1"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
              />
            </div>
          )}
          <Dialog open={showAddSlot} onOpenChange={(open) => {
            setShowAddSlot(open);
            if (!open) {
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
                              <SelectItem key={gameType._id} value={gameType.gameType} className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">
                                {gameType.gameType}
                              </SelectItem>
                            ))
                          ) : (
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
                          {Array.isArray(gameMaps) && gameMaps.length > 0 ? (
                            gameMaps.map((m: any) => (
                              <SelectItem key={m._id || m.gameMap} value={m.gameMap || m.name} className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">{m.gameMap || m.name}</SelectItem>
                            ))
                          ) : (
                            <>
                              {/** fallback static */}
                              <SelectItem value="Bermuda" className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">Bermuda</SelectItem>
                              <SelectItem value="Purgatory" className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">Purgatory</SelectItem>
                              <SelectItem value="Kalahari" className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">Kalahari</SelectItem>
                              <SelectItem value="Alpine" className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">Alpine</SelectItem>
                            </>
                          )}
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
                              <SelectItem key={gameMode._id} value={gameMode.gameMode} className="text-white hover:bg-[#3A3A3A] focus:bg-[#3A3A3A]">
                                {gameMode.gameMode}
                              </SelectItem>
                            ))
                          ) : (
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
                </div>

                {/* Match Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">Match Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="entryFee" className="text-white">Entry Fee</Label>
                      <Input
                        id="entryFee"
                        type="number"
                        value={formData.entryFee}
                        onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                        placeholder="10"
                        required
                        className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="perKill" className="text-white">Per Kill</Label>
                      <Input
                        id="perKill"
                        type="number"
                        value={formData.perKill}
                        onChange={(e) => setFormData({ ...formData, perKill: e.target.value })}
                        placeholder="1"
                        required
                        className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalWinningPrice" className="text-white">Winner Prize</Label>
                      <Input
                        id="totalWinningPrice"
                        type="number"
                        value={formData.totalWinningPrice}
                        onChange={(e) => setFormData({ ...formData, totalWinningPrice: e.target.value })}
                        placeholder="100"
                        required
                        className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="matchTime" className="text-white">Match Time</Label>
                      <Input
                        id="matchTime"
                        type="text"
                        placeholder="dd/mm/yyyy hh:mm"
                        value={matchTimeDisplay}
                        onChange={(e) => {
                          const v = e.target.value;
                          setMatchTimeDisplay(v);
                          const iso = parseDisplayToISO(v);
                          if (iso) setFormData({ ...formData, matchTime: iso });
                        }}
                        required
                        className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customStartInMinutes" className="text-white">Custom Start (Minutes)</Label>
                      <Input
                        id="customStartInMinutes"
                        type="number"
                        value={formData.customStartInMinutes}
                        onChange={(e) => setFormData({ ...formData, customStartInMinutes: e.target.value })}
                        placeholder="10"
                        required
                        className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxPlayers" className="text-white">Max Players</Label>
                      <Input
                        id="maxPlayers"
                        type="number"
                        value={formData.maxPlayers}
                        onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
                        placeholder="48"
                        required
                        className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label htmlFor="contactInfo" className="text-white">Contact Info</Label>
                      <Input
                        id="contactInfo"
                        type="text"
                        value={formData.contactInfo}
                        onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                        placeholder="Contact details"
                        className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationDeadline" className="text-white">Registration Deadline</Label>
                      <Input
                        id="registrationDeadline"
                        type="text"
                        placeholder="dd/mm/yyyy hh:mm"
                        value={registrationDeadlineDisplay}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRegistrationDeadlineDisplay(v);
                          const iso = parseDisplayToISO(v);
                          if (iso) setFormData({ ...formData, registrationDeadline: iso });
                        }}
                        className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rules" className="text-white">Rules</Label>
                      <textarea
                        id="rules"
                        value={formData.rules}
                        onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                        placeholder="Rules..."
                        className="w-full px-3 py-2 text-white bg-[#2A2A2A] border border-[#3A3A3A] rounded-md resize-none h-20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prizeDistribution" className="text-white">Prize Distribution</Label>
                      <Input
                        id="prizeDistribution"
                        type="text"
                        value={formData.prizeDistribution}
                        onChange={(e) => setFormData({ ...formData, prizeDistribution: e.target.value })}
                        placeholder="Winner takes all"
                        className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialRules" className="text-white">Special Rules</Label>
                      <Input
                        id="specialRules"
                        type="text"
                        value={formData.specialRules}
                        onChange={(e) => setFormData({ ...formData, specialRules: e.target.value })}
                        placeholder="Any special restrictions"
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
                        placeholder="e.g., RYDEN"
                        className="text-white bg-[#2A2A2A] border-[#3A3A3A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Banner Image */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">Banner Image</h3>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSlotBannerFileChange}
                      className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    {slotBannerPreview && (
                      <div className="w-full max-w-md">
                        <img src={slotBannerPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create Match</Button>
                </div>

                {/* Matches grid moved to CardContent below */}
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {localSlots
            .filter((slot: any) => {
              if (statusFilter !== 'all') {
                const st = (slot.status || 'upcoming').toLowerCase();
                if (st !== statusFilter) return false;
              }
              if (!slot.matchTime) return dateFilter === 'all';
              const matchDate = new Date(slot.matchTime);
              const now = new Date();
              const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
              const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
              switch (dateFilter) {
                case 'all':
                  return true;
                case 'today': {
                  const start = startOfDay(now);
                  const end = endOfDay(now);
                  return matchDate >= start && matchDate <= end;
                }
                case 'yesterday': {
                  const y = new Date(now);
                  y.setDate(now.getDate() - 1);
                  const start = startOfDay(y);
                  const end = endOfDay(y);
                  return matchDate >= start && matchDate <= end;
                }
                case 'tomorrow': {
                  const t = new Date(now);
                  t.setDate(now.getDate() + 1);
                  const start = startOfDay(t);
                  const end = endOfDay(t);
                  return matchDate >= start && matchDate <= end;
                }
                case 'last3days': {
                  const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2));
                  const end = endOfDay(now);
                  return matchDate >= start && matchDate <= end;
                }
                case 'custom': {
                  if (!customDateFrom && !customDateTo) return true;
                  const start = customDateFrom ? startOfDay(new Date(customDateFrom)) : new Date(-8640000000000000);
                  const end = customDateTo ? endOfDay(new Date(customDateTo)) : new Date(8640000000000000);
                  return matchDate >= start && matchDate <= end;
                }
                default:
                  return true;
              }
            })
            .map((slot: any) => (
            <div key={slot._id} className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] overflow-hidden">
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

              {slot.bannerImage && (
                <div className="w-full h-32 overflow-hidden">
                  <img
                    src={slot.bannerImage}
                    alt={`${slot.slotType} Banner`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="p-4 space-y-4">
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

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">🕒</span>
                    <span className="text-gray-400">Start</span>
                  </div>
                  <div className="text-gray-300">
                    {slot.matchTime ? (
                      <>
                        <span>{new Date(slot.matchTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="text-xs text-gray-400"><Countdown matchTime={slot.matchTime} /></div>
                      </>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </div>

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

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-2"
                    onClick={() => onEditSlot ? onEditSlot(slot) : undefined}
                  >
                    Edit
                  </Button>
                  <Button
                    className="flex-1 bg-[#52C41A] hover:bg-[#73D13D] text-white text-xs py-2"
                    onClick={() => onOpenRules ? onOpenRules(slot) : undefined}
                  >
                    📋 Rules
                  </Button>
                  <Button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2"
                    onClick={() => onOpenWinnerDetails ? onOpenWinnerDetails(slot) : undefined}
                  >
                    Winners
                  </Button>
                  <Button
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs py-2"
                    onClick={() => onOpenIdPass ? onOpenIdPass(slot) : undefined}
                  >
                    ID/Pass
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 bg-[#FF4D4F] hover:bg-[#FF7875] text-white text-xs py-2"
                    onClick={() => handleDeleteSlot(slot._id)}
                  >
                    Delete
                  </Button>
                  <Button
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs py-2"
                    onClick={() => { setCancelSlotId(slot._id); setCancelReason(''); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    {/* Cancel Match Modal */}
    <Dialog open={!!cancelSlotId} onOpenChange={(open) => { if (!open) { setCancelSlotId(null); setCancelReason(''); } }}>
      <DialogContent className="max-w-md bg-[#0F0F0F] border border-[#2A2A2A] text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Cancel Match</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="cancelReason" className="text-white">Reason</Label>
          <textarea
            id="cancelReason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter reason for cancellation (visible to admins)"
            className="w-full px-3 py-2 text-white bg-[#2A2A2A] border border-[#3A3A3A] rounded-md resize-none h-24"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setCancelSlotId(null); setCancelReason(''); }} className="border-[#2A2A2A] text-white">Close</Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={savingCancel || !cancelReason.trim()}
              onClick={async () => {
                if (!cancelSlotId || !cancelReason.trim()) return;
                try {
                  setSavingCancel(true);
                  const token = localStorage.getItem('adminToken');
                  await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/slots/${cancelSlotId}/status`, { status: 'cancelled', cancelReason }, { headers: { Authorization: `Bearer ${token}` } });
                  // Optimistically update list without full page refresh
                  setLocalSlots(prev => prev.map(s => s._id === cancelSlotId ? { ...s, status: 'cancelled', cancelReason } : s));
                  setCancelSlotId(null);
                  setCancelReason('');
                } catch (e: any) {
                  console.error(e);
                } finally {
                  setSavingCancel(false);
                }
              }}
            >
              {savingCancel ? 'Cancelling...' : 'Confirm Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default MatchesManager;


