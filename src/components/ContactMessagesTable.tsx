import { useEffect, useState } from "react";

interface ContactMessage {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  gameName: string;
  gameUsername: string;
  gameUID: string;
  queryType: string;
  message: string;
  createdAt: string;
}

const ContactMessagesTable = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.data);
        } else {
          setError(data.message || "Failed to fetch messages.");
        }
      } catch (err) {
        setError("Failed to fetch messages.");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div className="my-8 p-6 bg-black rounded-lg shadow-lg">
      <h3 className="mb-6 font-extrabold text-2xl tracking-wide text-white">CONTACT MESSAGES</h3>
      {loading && <div className="text-white">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && messages.length === 0 && <div className="text-white">No messages found.</div>}
      {!loading && !error && messages.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-black">
            <thead>
              <tr className="bg-zinc-900">
                <th className="px-4 py-3 border border-zinc-800 font-bold text-white">Name</th>
                <th className="px-4 py-3 border border-zinc-800 font-bold text-white">Email</th>
                <th className="px-4 py-3 border border-zinc-800 font-bold text-white">Mobile</th>
                <th className="px-4 py-3 border border-zinc-800 font-bold text-white">Game Name</th>
                <th className="px-4 py-3 border border-zinc-800 font-bold text-white">Game Username</th>
                <th className="px-4 py-3 border border-zinc-800 font-bold text-white">Game UID</th>
                <th className="px-4 py-3 border border-zinc-800 font-bold text-white">Query Type</th>
                <th className="px-4 py-3 border border-zinc-800 font-bold text-white">Message</th>
                <th className="px-4 py-3 border border-zinc-800 font-bold text-white">Date</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg._id} className="bg-zinc-900">
                  <td className="px-4 py-3 border border-zinc-800 text-white font-medium">{msg.fullName}</td>
                  <td className="px-4 py-3 border border-zinc-800 text-white font-medium">{msg.email}</td>
                  <td className="px-4 py-3 border border-zinc-800 text-white font-medium">{msg.mobile}</td>
                  <td className="px-4 py-3 border border-zinc-800 text-white font-medium">{msg.gameName}</td>
                  <td className="px-4 py-3 border border-zinc-800 text-white font-medium">{msg.gameUsername}</td>
                  <td className="px-4 py-3 border border-zinc-800 text-white font-medium">{msg.gameUID}</td>
                  <td className="px-4 py-3 border border-zinc-800 text-white font-medium">{msg.queryType}</td>
                  <td className="px-4 py-3 border border-zinc-800 text-white font-medium">{msg.message}</td>
                  <td className="px-4 py-3 border border-zinc-800 text-white font-medium">{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContactMessagesTable;
