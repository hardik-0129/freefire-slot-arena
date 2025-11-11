import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface SendSlotCredentialsProps {
  slotId: string;
}

interface Player {
  _id: string;
  user: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    freeFireUsername?: string;
  };
  playerNames: Record<string, string>;
  selectedPositions: Record<string, string[]>;
}

const SendSlotCredentials: React.FC<SendSlotCredentialsProps> = ({ slotId }) => {
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('723456');
  const [password, setPassword] = useState('pass789');
  const [title, setTitle] = useState('Match Room Credentials');
  const [showModal, setShowModal] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Fetch players and send credentials when modal opens
  useEffect(() => {
    if (showModal && slotId) {
      handleSendCredentials();
    }
  }, [showModal, slotId]);

  const handleSendCredentials = async () => {
    setLoadingPlayers(true);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      
      // First, fetch players to show in modal
      const playersRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/bookings/slot/${slotId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (playersRes.data.status && playersRes.data.data) {
        setPlayers(playersRes.data.data);
      }
      
      // Then send credentials
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notification/send-slot-credentials`,
        { slotId, id, password, title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(res.data.msg || 'Credentials sent!');
      
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to send credentials');
      setShowModal(false);
    }
    
    setLoadingPlayers(false);
    setLoading(false);
  };

  const getPlayerDisplayName = (player: Player) => {
    const userName = player.user.name || player.user.freeFireUsername || player.user.email || 'Unknown';
    const playerNames = Object.values(player.playerNames || {});
    if (playerNames.length > 0) {
      return `${userName} (${playerNames.join(', ')})`;
    }
    return userName;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-white">SEND SLOT ID/PASSWORD</h2>
      <form onSubmit={(e) => { e.preventDefault(); setShowModal(true); }} className="space-y-4 max-w-md">
        <div>
          <label className="block text-white mb-1">Slot ID</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-[#222] text-white border border-[#333]"
            value={slotId}
            readOnly
          />
        </div>
        <div>
          <label className="block text-white mb-1">Room ID</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-[#222] text-white border border-[#333]"
            value={id}
            onChange={e => setId(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-white mb-1">Room Password</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-[#222] text-white border border-[#333]"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-white mb-1">Title</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-[#222] text-white border border-[#333]"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Credentials'}
        </button>
      </form>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Players List - Credentials Sent</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  // Reset form
                  setId('723456');
                  setPassword('pass789');
                  setTitle('Match Room Credentials');
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {loadingPlayers || loading ? (
              <div className="text-white text-center py-8">
                <div className="mb-2">Loading players and sending credentials...</div>
                <div className="text-sm text-gray-400">Please wait</div>
              </div>
            ) : players.length === 0 ? (
              <div className="text-white text-center py-8">No players found for this slot</div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="text-green-400 text-sm mb-2 font-semibold">
                    ✓ Credentials sent to all {players.length} player{players.length !== 1 ? 's' : ''}
                  </div>
                  <div className="text-white text-sm">
                    Room ID: <span className="text-blue-400">{id}</span> | Password: <span className="text-blue-400">{password}</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {players.map((player) => {
                    return (
                      <div
                        key={player._id}
                        className="p-3 rounded border bg-[#222] border-[#333]"
                      >
                        <div className="flex items-center">
                          <div className="w-5 h-5 rounded border-2 mr-3 flex items-center justify-center bg-green-600 border-green-600">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">{getPlayerDisplayName(player)}</div>
                            {player.user.phone && (
                              <div className="text-gray-400 text-sm">{player.user.phone}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SendSlotCredentials;
