export interface Booking {
  _id: string;
  selectedPositions: { [key: string]: string[] };
  playerNames: { [key: string]: string };
  playerIndex?: number[];
  slotType?: string;
  totalAmount: number;
  entryFee: number;
  status: string;
  createdAt: string;
  slot: {
    _id: string;
    slotType: string;
    gameMode?: string;
    matchTime: string;
    totalWinningPrice: number;
    perKill: number;
    matchTitle?: string;
    tournamentName?: string;
    mapName?: string;
    specialRules?: string;
    maxPlayers?: number;
    streamLink?: string;
  } | null;
}
