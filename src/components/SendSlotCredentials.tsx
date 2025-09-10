import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface SendSlotCredentialsProps {
  slotId: string;
}

const SendSlotCredentials: React.FC<SendSlotCredentialsProps> = ({ slotId }) => {
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('723456');
  const [password, setPassword] = useState('pass789');
  const [title, setTitle] = useState('Match Room Credentials');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notification/send-slot-credentials`,
        { slotId, id, password, title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.msg || 'Credentials sent!');
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to send credentials');
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-white">Send Slot ID/Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
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
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Credentials'}
        </button>
      </form>
    </div>
  );
};

export default SendSlotCredentials;
