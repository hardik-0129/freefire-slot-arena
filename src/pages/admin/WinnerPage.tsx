import { useParams } from 'react-router-dom';
import AdminWinnerDashboard from '../AdminWinnerDashboard';
import { useEffect, useState } from 'react';

const WinnerPage = () => {
  const { matchIndex } = useParams<{ matchIndex: string }>();
  const [slotId, setSlotId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Fetch slot by matchIndex to get the slotId
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
            const slot = data.slots.find((s: any) => 
              String(s.matchIndex) === String(matchIndex)
            );
            if (slot && slot._id) {
              setSlotId(slot._id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching slot by matchIndex:', error);
      }
    };

    if (matchIndex) {
      fetchSlotByMatchIndex();
    }
  }, [matchIndex]);

  return (
    <>
      <header className="bg-[#1A1A1A] border-b border-[#2A2A2A] p-6">
        <h1 className="text-2xl font-bold text-white">
          Winners Management {matchIndex ? `- Match #${matchIndex}` : ''}
        </h1>
      </header>
      <AdminWinnerDashboard filterSlotId={slotId} />
    </>
  );
};

export default WinnerPage;
