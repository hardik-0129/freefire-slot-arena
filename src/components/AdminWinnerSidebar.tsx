import React, { useState, useEffect } from 'react';

interface Match {
  _id: string;
  matchTitle: string;
  slotType: string;
  matchTime: string;
  entryFee: number;
}

interface AddWinnerForm {
  position: number;
  playerName: string;
  teamName: string;
  kills: number;
  prizeAmount: number;
  notes: string;
}

interface AdminWinnerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMatch?: Match;
  onWinnerAdded: () => void;
}

const AdminWinnerSidebar: React.FC<AdminWinnerSidebarProps> = ({
  isOpen,
  onClose,
  selectedMatch,
  onWinnerAdded
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState<AddWinnerForm>({
    position: 1,
    playerName: '',
    teamName: '',
    kills: 0,
    prizeAmount: 0,
    notes: ''
  });

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen && selectedMatch) {
      setForm({
        position: 1,
        playerName: '',
        teamName: '',
        kills: 0,
        prizeAmount: 0,
        notes: ''
      });
    }
  }, [isOpen, selectedMatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/winners/admin/match/${selectedMatch._id}/winner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Winner added successfully!');
        setForm({
          position: form.position + 1, // Auto increment position
          playerName: '',
          teamName: '',
          kills: 0,
          prizeAmount: 0,
          notes: ''
        });
        onWinnerAdded();
      } else {
        setError(data.error || 'Failed to add winner');
      }
    } catch (err) {
      setError('Failed to add winner');
      console.error('Error adding winner:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'position' || name === 'kills' || name === 'prizeAmount' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed right-0 top-0 h-full w-96 bg-gray-900 shadow-lg transform transition-transform">
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Add Winner</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Match Info */}
          {selectedMatch && (
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h3 className="text-white font-semibold">{selectedMatch.matchTitle}</h3>
              <p className="text-gray-400 text-sm">{selectedMatch.slotType}</p>
              <p className="text-gray-400 text-sm">
                {new Date(selectedMatch.matchTime).toLocaleString()}
              </p>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 p-3 rounded mb-4">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-900 border border-green-700 text-green-100 p-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Position
              </label>
              <input
                type="number"
                name="position"
                value={form.position}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                required
              />
            </div>

            {/* Player Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Player Name
              </label>
              <input
                type="text"
                name="playerName"
                value={form.playerName}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                required
              />
            </div>

            {/* Team Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Team Name (Optional)
              </label>
              <input
                type="text"
                name="teamName"
                value={form.teamName}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>

            {/* Kills */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kills
              </label>
              <input
                type="number"
                name="kills"
                value={form.kills}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>

            {/* Prize Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prize Amount (₹)
              </label>
              <input
                type="number"
                name="prizeAmount"
                value={form.prizeAmount}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded"
            >
              {submitting ? 'Adding Winner...' : 'Add Winner'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminWinnerSidebar;
