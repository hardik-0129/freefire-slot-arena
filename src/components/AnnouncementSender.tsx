import React, { useState } from 'react';
// import { Button, Input, Textarea } from '../components/ui';

const AnnouncementSender: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSuccess(null);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notification/announcement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title,
          body: message,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send announcement');
      }
      setSuccess('Announcement sent successfully!');
      setTitle('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-lg bg-[#181818] p-10 rounded-2xl shadow-2xl border border-[#23272F]">
        <h2 className="text-3xl font-extrabold text-white mb-8 text-center tracking-wide">Send Announcement</h2>
        <form onSubmit={handleSend} className="space-y-6">
          <div>
            <label className="block text-white mb-2 text-lg font-semibold">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Announcement Title"
              required
              className="w-full px-4 py-2 rounded-lg bg-[#23272F] text-white border border-[#333] focus:outline-none transition-all text-base"
            />
          </div>
          <div>
            <label className="block text-white mb-2 text-lg font-semibold">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your announcement here..."
              required
              className="w-full px-4 py-3 rounded-lg bg-[#23272F] text-white border border-[#333] min-h-[120px] focus:outline-none transition-all text-base resize-y"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 rounded-lg bg-[#52C41A] hover:bg-[#73D13D] text-white font-bold text-lg tracking-wide transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
          >
            {sending ? 'Sending...' : 'Send Announcement'}
          </button>
          {success && <div className="text-green-400 mt-4 text-center font-semibold">{success}</div>}
          {error && <div className="text-red-400 mt-4 text-center font-semibold">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AnnouncementSender;
