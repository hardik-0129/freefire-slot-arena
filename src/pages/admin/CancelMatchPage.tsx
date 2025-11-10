import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const CancelMatchPage = () => {
  const { matchIndex } = useParams<{ matchIndex: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [slot, setSlot] = useState<any>(null);
  const [slotId, setSlotId] = useState<string | undefined>(undefined);
  const [cancelReason, setCancelReason] = useState<string>('');

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
              setCancelReason(foundSlot.cancelReason || '');
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

  // Handle cancel match
  const handleCancelMatch = async () => {
    if (!slotId) {
      toast({ 
        variant: 'destructive',
        title: 'No slot selected', 
        description: 'Cannot cancel match.' 
      });
      return;
    }
    if (!cancelReason.trim()) {
      toast({ 
        variant: 'destructive',
        title: 'Reason required', 
        description: 'Please enter a reason for cancellation.' 
      });
      return;
    }
    try {
      setIsCancelling(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/al-admin-128900441');
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/slots/${slotId}/status`,
        { status: 'cancelled', cancelReason: cancelReason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({ 
        title: 'Success', 
        description: 'Match cancelled successfully.' 
      });
      navigate('/al-dashboard-1289/matches');
    } catch (error: any) {
      toast({ 
        variant: 'destructive',
        title: 'Error', 
        description: error?.response?.data?.msg || error?.message || 'Failed to cancel match' 
      });
    } finally {
      setIsCancelling(false);
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
              Cancel Match {matchIndex ? `#${matchIndex}` : ''}
            </h1>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-8 space-y-6">
            {/* Warning Icon and Message */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  Cancel Match
                </h2>
                <p className="text-gray-400 text-lg">
                  Please provide a reason for cancelling this match.
                </p>
              </div>
            </div>

            {/* Match Details */}
            <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#FF4D4F] font-bold text-lg">#{slot.matchIndex}</span>
                <span className="text-white font-medium text-lg">
                  {slot.matchTitle || `${slot.slotType?.charAt(0).toUpperCase() + slot.slotType?.slice(1)} Match`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Entry Fee:</span>
                  <span className="text-white ml-2">₹{slot.entryFee || 0}</span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className="text-white ml-2 capitalize">{slot.status || 'upcoming'}</span>
                </div>
                {slot.matchTime && (
                  <div className="col-span-2">
                    <span className="text-gray-400">Match Time:</span>
                    <span className="text-white ml-2">
                      {new Date(slot.matchTime).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Cancel Reason Input */}
            <div className="space-y-3">
              <Label htmlFor="cancelReason" className="text-white">
                Reason for Cancellation <span className="text-red-400">*</span>
              </Label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation (visible to admins)"
                className="w-full px-4 py-3 text-white bg-[#2A2A2A] border border-[#3A3A3A] rounded-md resize-y min-h-[120px] focus:outline-none focus:border-orange-500"
              />
              <p className="text-sm text-gray-400">
                This reason will be visible to administrators and will be stored with the match record.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-[#2A2A2A]">
              <Button
                variant="outline"
                onClick={() => navigate('/al-dashboard-1289/matches')}
                className="border-[#2A2A2A] text-white hover:bg-[#2A2A2A] min-w-[120px]"
                disabled={isCancelling}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCancelMatch}
                disabled={isCancelling || !cancelReason.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelMatchPage;

