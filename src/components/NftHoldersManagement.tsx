import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Gift, Calculator, CheckCircle, X, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface NftHolder {
  _id: string;
  name: string;
  email: string;
  wallet: number;
  alphaRole: {
    roleName: string;
    nftCount: number;
    isVerified: boolean;
    verificationDate: string;
    walletAddress: string;
  };
  createdAt: string;
}

interface DistributionPreview {
  holder: NftHolder;
  nftCount: number;
  shareAmount: number;
  percentage: number;
}

const NftHoldersManagement: React.FC = () => {
  const [nftHolders, setNftHolders] = useState<NftHolder[]>([]);
  const [loadingNftHolders, setLoadingNftHolders] = useState(false);
  const [nftHolderSearch, setNftHolderSearch] = useState('');
  const [distributionAmount, setDistributionAmount] = useState('');
  const [showDistributionPreview, setShowDistributionPreview] = useState(false);
  const [distributionPreview, setDistributionPreview] = useState<DistributionPreview[]>([]);
  const [isDistributing, setIsDistributing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tokensModalOpen, setTokensModalOpen] = useState(false);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [selectedHolder, setSelectedHolder] = useState<NftHolder | null>(null);
  const [holderTokens, setHolderTokens] = useState<{ total: number; nfts: any[] } | null>(null);
  const [selectedNft, setSelectedNft] = useState<any | null>(null);
  
  const { toast } = useToast();

  const fetchNftHolders = async () => {
    try {
      setLoadingNftHolders(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter users who have verified alpha roles
        const verifiedUsers = data.users.filter((user: any) => 
          user.alphaRole && 
          user.alphaRole.isVerified && 
          user.alphaRole.walletAddress
        );
        
        setNftHolders(verifiedUsers);
      }
    } catch (error) {
      console.error('Error fetching NFT holders:', error);
      setNftHolders([]);
      toast({
        title: 'Error',
        description: 'Failed to load NFT holders',
        variant: 'destructive'
      });
    } finally {
      setLoadingNftHolders(false);
    }
  };

  const calculateDistribution = () => {
    const amount = parseFloat(distributionAmount);
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than 0',
        variant: 'destructive'
      });
      return;
    }

    const filteredHolders = nftHolders.filter((user: NftHolder) => {
      if (!nftHolderSearch.trim()) return true;
      const q = nftHolderSearch.toLowerCase();
      return (
        (user.name || '').toLowerCase().includes(q) ||
        (user.email || '').toLowerCase().includes(q) ||
        (user.alphaRole?.walletAddress || '').toLowerCase().includes(q)
      );
    });

    if (filteredHolders.length === 0) {
      toast({
        title: 'No Holders',
        description: 'No NFT holders found to distribute to',
        variant: 'destructive'
      });
      return;
    }

    const totalNfts = filteredHolders.reduce((sum, holder) => sum + (holder.alphaRole?.nftCount || 0), 0);
    
    if (totalNfts === 0) {
      toast({
        title: 'No NFTs',
        description: 'No NFTs found among the holders',
        variant: 'destructive'
      });
      return;
    }

    const preview: DistributionPreview[] = filteredHolders.map(holder => {
      const nftCount = holder.alphaRole?.nftCount || 0;
      const percentage = (nftCount / totalNfts) * 100;
      const shareAmount = (nftCount / totalNfts) * amount;
      
      return {
        holder,
        nftCount,
        shareAmount: Math.round(shareAmount * 100) / 100, // Round to 2 decimal places
        percentage: Math.round(percentage * 100) / 100
      };
    });

    setDistributionPreview(preview);
    setShowDistributionPreview(true);
    setShowModal(true);
  };

  const executeDistribution = async () => {
    setIsDistributing(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      // Prepare distribution data
      const distributionData = {
        totalAmount: parseFloat(distributionAmount),
        distributions: distributionPreview.map(item => ({
          userId: item.holder._id,
          amount: item.shareAmount,
          nftCount: item.nftCount,
          percentage: item.percentage
        }))
      };

      // Send distribution request to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/nft/distribute-funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(distributionData)
      });

      if (!response.ok) {
        throw new Error('Failed to distribute funds');
      }

      const result = await response.json();
      
      toast({
        title: 'Distribution Successful',
        description: `Successfully distributed ₹${distributionAmount} among ${distributionPreview.length} NFT holders. Wallet balances updated.`,
        variant: 'default'
      });

      // Reset form
      setDistributionAmount('');
      setShowDistributionPreview(false);
      setDistributionPreview([]);
      setShowModal(false);
      
      // Refresh the holders data to show updated wallet balances
      await fetchNftHolders();
      
    } catch (error) {
      console.error('Error distributing funds:', error);
      toast({
        title: 'Distribution Failed',
        description: 'Failed to distribute funds. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDistributing(false);
    }
  };

  const openHolderTokensModal = async (holder: NftHolder) => {
    try {
      setSelectedHolder(holder);
      setTokensModalOpen(true);
      setTokensLoading(true);
      setHolderTokens(null);
      setSelectedNft(null);

      const token = localStorage.getItem('adminToken');
      const wallet = holder.alphaRole?.walletAddress || '';
      if (!wallet) {
        toast({ title: 'No wallet address', description: 'This holder has no wallet address', variant: 'destructive' });
        setTokensLoading(false);
        return;
      }

      const url = `${import.meta.env.VITE_API_URL}/api/nft/nfts?wallet=${encodeURIComponent(wallet)}`;
      const resp = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to fetch token IDs');
      const data = await resp.json();
      const total = typeof data?.total === 'number' ? data.total : Number(data?.total) || 0;
      const nfts = Array.isArray(data?.nfts) ? data.nfts : [];
      setHolderTokens({ total, nfts });
    } catch (e: any) {
      console.error('openHolderTokensModal error:', e);
      toast({ title: 'Error', description: e?.message || 'Failed to load token IDs', variant: 'destructive' });
    } finally {
      setTokensLoading(false);
    }
  };

  useEffect(() => {
    fetchNftHolders();
  }, []);

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-white">NFT Holders ({nftHolders.length} Verified)</CardTitle>
          <div className="flex gap-2">
            <input
              type="text"
              value={nftHolderSearch}
              onChange={(e) => setNftHolderSearch(e.target.value)}
              placeholder="Search by name, email, wallet address"
              className="w-full max-w-md bg-[#222] border border-[#333] text-white rounded px-3 py-2"
            />
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={fetchNftHolders}
              disabled={loadingNftHolders}
            >
              {loadingNftHolders ? 'Loading...' : 'Refresh'}
            </Button>
            </div>
          </div>
          
          {/* Money Distribution Section */}
          <div className="bg-[#222] border border-[#333] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="h-4 w-4 text-green-400" />
              <h3 className="text-white font-medium text-sm">Distribute Money to NFT Holders</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm">Amount (₹):</span>
                <input
                  type="number"
                  value={distributionAmount}
                  onChange={(e) => setDistributionAmount(e.target.value)}
                  placeholder="Enter amount to distribute"
                  className="bg-[#1A1A1A] border border-[#444] text-white rounded px-3 py-2 w-48"
                  min="0"
                  step="0.01"
                />
              </div>
              <Button
                onClick={calculateDistribution}
                disabled={!distributionAmount || loadingNftHolders}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Distribution
              </Button>
              {showDistributionPreview && (
                <>
                  <Button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loadingNftHolders ? (
          <div className="text-center py-10">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading NFT holders...</p>
          </div>
        ) : nftHolders.length === 0 ? (
          <div className="text-center py-10">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold text-white mb-2">No NFT Holders Yet</h3>
            <p className="text-gray-400">Verified NFT holders will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  <th className="text-left p-3 text-white">Name</th>
                  <th className="text-left p-3 text-white">Email</th>
                  <th className="text-left p-3 text-white">Wallet Balance</th>
                  <th className="text-left p-3 text-white">Role</th>
                  <th className="text-left p-3 text-white">NFT Count</th>
                  <th className="text-left p-3 text-white">Wallet Address</th>
                  <th className="text-left p-3 text-white">Verified Date</th>
                </tr>
              </thead>
              <tbody>
                {nftHolders
                  .filter((user: NftHolder) => {
                    if (!nftHolderSearch.trim()) return true;
                    const q = nftHolderSearch.toLowerCase();
                    return (
                      (user.name || '').toLowerCase().includes(q) ||
                      (user.email || '').toLowerCase().includes(q) ||
                      (user.alphaRole?.walletAddress || '').toLowerCase().includes(q)
                    );
                  })
                  .map((user: NftHolder) => (
                    <tr
                      key={user._id}
                      className="border-b border-[#2A2A2A] hover:bg-[#2A2A2A] cursor-pointer"
                      onClick={() => openHolderTokensModal(user)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-white">{user.email}</td>
                      <td className="p-3">
                        <span className="text-green-400 font-bold">₹{Number(user.wallet || 0).toFixed(2)}</span>
                      </td>
                      <td className="p-3">
                        <span style={{
                          border: '2px solid #10b981',
                          borderRadius: '20px',
                          padding: '8px 16px',
                          color: '#10b981',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                        }}>
                          {user.alphaRole?.roleName}
                        </span>
                      </td>
                      <td className="p-3">
                        <span style={{
                          border: '2px solid #3b82f6',
                          borderRadius: '20px',
                          padding: '8px 16px',
                          color: '#3b82f6',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          {user.alphaRole?.nftCount || 0} NFTs
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="bg-[#2A2A2A] px-2 py-1 rounded text-blue-400 font-mono text-xs">
                          {user.alphaRole?.walletAddress}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400">
                        {user.alphaRole?.verificationDate ? 
                          new Date(user.alphaRole.verificationDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 
                          'N/A'
                        }
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Distribution Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <Calculator className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Distribution Preview</h2>
              </div>
              <Button
                onClick={() => setShowModal(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Summary Card */}
              <div className="bg-[#222] border border-[#333] rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">₹{distributionAmount}</div>
                    <div className="text-sm text-gray-400">Total Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {distributionPreview.reduce((sum, item) => sum + item.nftCount, 0)}
                    </div>
                    <div className="text-sm text-gray-400">Total NFTs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{distributionPreview.length}</div>
                    <div className="text-sm text-gray-400">Holders</div>
                  </div>
                </div>
              </div>

              {/* Distribution Table */}
              <div className="bg-[#222] border border-[#333] rounded-lg overflow-hidden">
                <div className="p-4 border-b border-[#333]">
                  <h3 className="text-lg font-semibold text-white">Distribution Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-[#333] bg-[#2A2A2A]">
                        <th className="text-left p-4 text-white font-semibold">Holder</th>
                        <th className="text-left p-4 text-white font-semibold">Email</th>
                        <th className="text-left p-4 text-white font-semibold">NFT Count</th>
                        <th className="text-left p-4 text-white font-semibold">Percentage</th>
                        <th className="text-left p-4 text-white font-semibold">Share Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {distributionPreview.map((item, index) => (
                        <tr key={index} className="border-b border-[#333] hover:bg-[#2A2A2A]">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                {item.holder.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col gap-1">
                                <div className="text-white font-medium">{item.holder.name}</div>
                                <span style={{
                                  border: '2px solid #10b981',
                                  borderRadius: '20px',
                                  padding: '4px 12px',
                                  color: '#10b981',
                                  fontWeight: 'bold',
                                  fontSize: '12px',
                                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                                  display: 'inline-block',
                                  width: 'fit-content'
                                }}>
                                  {item.holder.alphaRole?.roleName}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300 text-sm">
                            {item.holder.email}
                          </td>
                          <td className="p-4">
                            <span style={{
                              border: '2px solid #3b82f6',
                              borderRadius: '20px',
                              padding: '4px 12px',
                              color: '#3b82f6',
                              fontWeight: 'bold',
                              fontSize: '12px',
                              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                              display: 'inline-block',
                              width: 'fit-content'
                            }}>
                              {item.nftCount} NFTs
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="text-blue-400 font-bold text-lg">
                                {item.percentage}%
                              </div>
                              <div className="w-20 bg-[#333] rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${item.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-green-400 font-bold text-lg">
                              ₹{item.shareAmount}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="border-[#444] text-gray-300 hover:bg-[#2A2A2A] hover:text-white"
                >
                  Close
                </Button>
                <Button
                  onClick={executeDistribution}
                  disabled={isDistributing}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isDistributing ? 'Distributing...' : 'Execute Distribution'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holder Token IDs Modal */}
      {tokensModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
              <div>
                <h2 className="text-xl font-bold text-white">Alpha Lion Token IDs</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {selectedHolder?.name} • {selectedHolder?.alphaRole?.walletAddress}
                </p>
              </div>
              <Button
                onClick={() => setTokensModalOpen(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {tokensLoading ? (
                <div className="text-center py-10">
                  <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading token IDs...</p>
                </div>
              ) : !holderTokens || holderTokens.nfts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No Alpha Lion tokens found for this wallet.</div>
              ) : (
                <div>
                  <div className="text-gray-300 mb-3">Total: {holderTokens.total}</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(holderTokens.nfts || []).slice(0, holderTokens.total || holderTokens.nfts.length).map((nft, idx) => (
                      <button
                        key={`${nft?.token_id ?? 'id'}-${idx}`}
                        onClick={() => setSelectedNft(nft)}
                        className={`border border-[#333] rounded-full px-3 py-1 text-sm ${selectedNft?.token_id === nft?.token_id ? 'bg-blue-600 text-white' : 'bg-[#222] text-blue-300 hover:bg-[#2A2A2A]'}`}
                      >
                        {String(nft?.token_id ?? '')}
                      </button>
                    ))}
                  </div>
                  {selectedNft && (
                    <div className="bg-[#111] border border-[#2A2A2A] rounded-md p-4 text-sm text-gray-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><span className="text-gray-400">Token ID:</span> <span className="text-white font-medium">{String(selectedNft.token_id)}</span></div>
                        <div><span className="text-gray-400">Balance:</span> {selectedNft.balance}</div>
                        <div className="sm:col-span-2 break-all"><span className="text-gray-400">Contract:</span> {selectedNft.contract_address}</div>
                        <div><span className="text-gray-400">Name:</span> {selectedNft.name}</div>
                        <div><span className="text-gray-400">Symbol:</span> {selectedNft.symbol}</div>
                        <div><span className="text-gray-400">Chain:</span> {selectedNft.chain} ({selectedNft.chain_id})</div>
                        <div><span className="text-gray-400">Last Acquired:</span> {selectedNft.last_acquired ? new Date(selectedNft.last_acquired).toLocaleString() : '—'}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end mt-6">
                <Button onClick={() => setTokensModalOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white">Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default NftHoldersManagement;
