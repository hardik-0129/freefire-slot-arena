import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SendSlotCredentials from '@/components/SendSlotCredentials';

const IdPassPage = () => {
  const { matchIndex } = useParams<{ matchIndex: string }>();
  const navigate = useNavigate();
  const [slotId, setSlotId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchSlotByMatchIndex = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.slots) {
            const slot = data.slots.find((s: any) => String(s.matchIndex) === String(matchIndex));
            if (slot && slot._id) {
              setSlotId(slot._id);
            }
          }
        }
      } catch {
      }
    };

    if (matchIndex) fetchSlotByMatchIndex();
  }, [matchIndex]);

  return (
    <>
      <header className="bg-[#1A1A1A] border-b border-[#2A2A2A] p-6">
        <div className="flex items-center justify-between">
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
              Send ID / Password {matchIndex ? `- Match #${matchIndex}` : ''}
            </h1>
          </div>
        </div>
      </header>
      <main className="p-6">
        {slotId ? (
          <div className="max-w-xl">
            <SendSlotCredentials slotId={slotId} />
          </div>
        ) : (
          <div className="text-gray-400">Loading match...</div>
        )}
      </main>
    </>
  );
};

export default IdPassPage;


