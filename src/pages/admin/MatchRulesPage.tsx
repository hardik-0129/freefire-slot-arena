import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';

const MatchRulesPage = () => {
  const { matchIndex } = useParams<{ matchIndex: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [slot, setSlot] = useState<any>(null);
  const [slotId, setSlotId] = useState<string | undefined>(undefined);
  const [rules, setRules] = useState<string>('');

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
              setRules(foundSlot.rules || '');
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
    }
  }, [matchIndex, navigate, toast]);

  // Handle save rules
  const handleSaveRules = async () => {
    if (!slotId) {
      toast({ 
        variant: 'destructive',
        title: 'No slot selected', 
        description: 'Please select a slot to update rules.' 
      });
      return;
    }
    try {
      setIsSaving(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/al-admin-128900441');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/slots/${slotId}/tournament-rules`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rules: rules })
      });

      if (response.ok) {
        toast({ 
          title: 'Rules updated', 
          description: 'Tournament rules updated successfully.' 
        });
        navigate('/al-dashboard-1289/matches');
      } else {
        throw new Error('Failed to update rules');
      }
    } catch (error: any) {
      toast({ 
        variant: 'destructive',
        title: 'Error', 
        description: error?.message || 'Failed to update rules' 
      });
    } finally {
      setIsSaving(false);
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
              Tournament Rules {matchIndex ? `- Match #${matchIndex}` : ''}
            </h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white border-b border-[#2A2A2A] pb-2">
              TOURNAMENT RULES (HTML)
            </h3>
            <div className="space-y-3">
              <Label htmlFor="rulesHtml" className="text-white">Rules Content</Label>
              <textarea
                id="rulesHtml"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Paste or write tournament rules HTML here..."
                className="w-full min-h-[400px] px-4 py-3 text-white bg-[#23272F] border-2 border-[#FF4D4F] focus:border-[#52C41A] rounded-lg outline-none resize-y"
                style={{ fontFamily: 'monospace' }}
              />
              <p className="text-sm text-gray-400">
                Enter HTML content for tournament rules. This will be displayed to players.
              </p>
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
              onClick={handleSaveRules}
              disabled={isSaving}
              className="bg-[#FF4D4F] hover:bg-[#FF7875] text-white"
            >
              {isSaving ? 'Saving...' : 'Save Rules'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchRulesPage;

