import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

interface WithdrawalRequest {
  _id: string;
  transactionId: string;
  amount: number;
  userId: {
    name: string;
    email: string;
    phone: string;
    freeFireUsername: string;
    referredBy?: string | null;
  };
  metadata: {
    upiId: string;
    beneficiaryName: string;
  };
  createdAt: string;
  status: string;
}

const WithdrawalManagement: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const { toast } = useToast();

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      // Prefer unified endpoint with status query; fallback to legacy pending endpoint
      const base = `${import.meta.env.VITE_API_URL}/api/wallet/admin`;
      // Map filter to available endpoints
      const endpoint = statusFilter === 'pending'
        ? `${base}/pending-withdrawals`
        : `${base}/${statusFilter}-withdrawals`;
      let response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Endpoint not available or error: show empty list to avoid mixing statuses
        setWithdrawals([]);
      } else {
        const data = await response.json();
        if (data.success) {
          setWithdrawals(data.withdrawals || data.data || []);
        } else {
          setWithdrawals([]);
          toast({
            title: "Error",
            description: data.error || "Failed to fetch withdrawals",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: "Error",
        description: "Network error while fetching withdrawals",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleApproveWithdrawal = async (transactionId: string) => {
    setProcessingId(transactionId);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/admin/approve-withdrawal/${transactionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Withdrawal approved successfully!",
          variant: "default"
        });
        fetchWithdrawals(); // Refresh current filtered list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to approve withdrawal",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast({
        title: "Error",
        description: "Network error while approving withdrawal",
        variant: "destructive"
      });
    }
    setProcessingId(null);
  };

  const handleRejectWithdrawal = async () => {
    if (!selectedWithdrawal || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      });
      return;
    }

    setProcessingId(selectedWithdrawal.transactionId);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/admin/reject-withdrawal/${selectedWithdrawal.transactionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Withdrawal rejected successfully!",
          variant: "default"
        });
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedWithdrawal(null);
        fetchWithdrawals(); // Refresh current filtered list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reject withdrawal",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast({
        title: "Error",
        description: "Network error while rejecting withdrawal",
        variant: "destructive"
      });
    }
    setProcessingId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Withdrawal Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-white mr-2" />
            <span className="text-white">Loading withdrawals...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Withdrawal Management ({withdrawals.length} {statusFilter})
        </CardTitle>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#0F0F0F] text-white border border-[#2A2A2A] rounded px-2 py-1"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button 
            onClick={fetchWithdrawals}
            variant="outline"
            size="sm"
            className="border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {withdrawals.length === 0 ? (
          <div className="text-center p-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-white text-lg">No pending withdrawals</p>
            <p className="text-gray-400">All withdrawal requests have been processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal._id} className="bg-[#2A2A2A] rounded-lg p-4 border border-[#3A3A3A]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {withdrawal.userId.referredBy ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">Amount (95%):</span>
                        <span className="text-green-400 font-bold">₹{(withdrawal.amount * 0.95).toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">Amount:</span>
                        <span className="text-green-400 font-bold">₹{withdrawal.amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">User:</span>
                      <span className="text-gray-300">{withdrawal.userId.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Email:</span>
                      <span className="text-gray-300">{withdrawal.userId.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Phone:</span>
                      <span className="text-gray-300">{withdrawal.userId.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">UPI ID:</span>
                      <span className="text-blue-400">{withdrawal.metadata.upiId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Beneficiary:</span>
                      <span className="text-gray-300">{withdrawal.metadata.beneficiaryName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Transaction ID:</span>
                      <span className="text-gray-400 text-sm">{withdrawal.transactionId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Requested:</span>
                      <span className="text-gray-300">{formatDate(withdrawal.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                {statusFilter === 'pending' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-[#3A3A3A]">
                    <Button
                      onClick={() => handleApproveWithdrawal(withdrawal.transactionId)}
                      disabled={processingId === withdrawal.transactionId}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {processingId === withdrawal.transactionId ? 'Approving...' : 'Approve'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setSelectedWithdrawal(withdrawal);
                        setShowRejectModal(true);
                      }}
                      disabled={processingId === withdrawal.transactionId}
                      variant="destructive"
                      className="text-white"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Rejection Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md bg-[#0F0F0F] border border-[#2A2A2A] text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[#FF4D4F] to-[#FF7875] rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  Reject Withdrawal Request
                </DialogTitle>
                <p className="text-gray-400 text-sm">
                  Provide reason for rejection
                </p>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {selectedWithdrawal && (
              <div className="bg-[#2A2A2A] p-3 rounded">
                <p className="text-white"><strong>Amount:</strong> ₹{selectedWithdrawal.amount}</p>
                <p className="text-white"><strong>User:</strong> {selectedWithdrawal.userId.name}</p>
                <p className="text-white"><strong>UPI ID:</strong> {selectedWithdrawal.metadata.upiId}</p>
              </div>
            )}
            <div>
              <Label htmlFor="rejection-reason" className="text-white">
                Reason for Rejection *
              </Label>
              <Input
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejecting this withdrawal..."
                className="bg-[#2A2A2A] border-[#3A3A3A] text-white mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
                setSelectedWithdrawal(null);
              }}
              className="border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectWithdrawal}
              disabled={!rejectionReason.trim() || processingId === selectedWithdrawal?.transactionId}
              variant="destructive"
              className="text-white"
            >
              {processingId === selectedWithdrawal?.transactionId ? 'Rejecting...' : 'Reject Withdrawal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WithdrawalManagement;
