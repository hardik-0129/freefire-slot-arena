import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Eye,
  Calendar,
  DollarSign,
  ArrowUpDown,
  Trash2
} from "lucide-react";

interface Transaction {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    freeFireUsername: string;
  };
  type: 'CREDIT' | 'DEBIT' | 'WITHDRAW' | 'MATCH_ENTRY' | 'BOOKING' | 'WIN' | 'DEPOSIT';
  amount: number;
  status: 'SUCCESS' | 'PENDING_ADMIN_APPROVAL' | 'FAILED' | 'ADMIN_APPROVED' | 'ADMIN_REJECTED';
  description: string;
  createdAt: string;
  updatedAt: string;
  transactionId?: string;
  paymentMethod?: string;
  balanceAfter?: number;
  metadata?: any;
}

const AllTransactionsHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingTransactions: 0
  });

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
        dateFilter: dateFilter
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/admin/all-transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setStats(data.stats || stats);
      } else {
        console.error('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter, typeFilter, dateFilter]);

  // Handle search on Enter key press
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchTransactions();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'ADMIN_APPROVED':
        return 'bg-green-500 text-white';
      case 'PENDING_ADMIN_APPROVAL':
        return 'bg-yellow-500 text-white';
      case 'FAILED':
        return 'bg-red-500 text-white';
      case 'ADMIN_REJECTED':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CREDIT':
      case 'DEPOSIT':
        return 'text-green-400';
      case 'DEBIT':
      case 'WITHDRAW':
        return 'text-red-400';
      case 'MATCH_ENTRY':
      case 'BOOKING':
        return 'text-blue-400';
      case 'WIN':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CREDIT':
      case 'DEPOSIT':
        return '↗';
      case 'DEBIT':
      case 'WITHDRAW':
        return '↙';
      case 'MATCH_ENTRY':
      case 'BOOKING':
        return '🎮';
      case 'WIN':
        return '🏆';
      default:
        return '💰';
    }
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting transactions...');
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/admin/delete-transaction/${transactionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Remove the transaction from the local state
          setTransactions(prev => prev.filter(transaction => transaction._id !== transactionId));
          // Update stats
          setStats(prev => ({
            ...prev,
            totalTransactions: prev.totalTransactions - 1
          }));
          alert('Transaction deleted successfully!');
        } else {
          const errorData = await response.json();
          alert(`Failed to delete transaction: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Transactions</p>
                <p className="text-2xl font-bold text-white">{stats.totalTransactions}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Deposits</p>
                <p className="text-2xl font-bold text-green-400">₹{stats.totalDeposits}</p>
              </div>
              <div className="text-green-400 text-2xl">↗</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Withdrawals</p>
                <p className="text-2xl font-bold text-red-400">₹{stats.totalWithdrawals}</p>
              </div>
              <div className="text-red-400 text-2xl">↙</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Transactions</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pendingTransactions}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">All Transactions History</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="text-white border-[#3A3A3A]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="text-white border-[#3A3A3A]"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by user email/name (Press Enter)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-10 bg-[#2A2A2A] border-[#3A3A3A] text-white"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-[#2A2A2A] border-[#3A3A3A] text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                <SelectItem value="all" className="text-white hover:bg-[#3A3A3A]">All Status</SelectItem>
                <SelectItem value="SUCCESS" className="text-white hover:bg-[#3A3A3A]">Success</SelectItem>
                <SelectItem value="PENDING_ADMIN_APPROVAL" className="text-white hover:bg-[#3A3A3A]">Pending</SelectItem>
                <SelectItem value="FAILED" className="text-white hover:bg-[#3A3A3A]">Failed</SelectItem>
                <SelectItem value="ADMIN_REJECTED" className="text-white hover:bg-[#3A3A3A]">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-[#2A2A2A] border-[#3A3A3A] text-white">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                <SelectItem value="all" className="text-white hover:bg-[#3A3A3A]">All Types</SelectItem>
                <SelectItem value="CREDIT" className="text-white hover:bg-[#3A3A3A]">Credit</SelectItem>
                <SelectItem value="DEBIT" className="text-white hover:bg-[#3A3A3A]">Debit</SelectItem>
                <SelectItem value="WITHDRAW" className="text-white hover:bg-[#3A3A3A]">Withdraw</SelectItem>
                <SelectItem value="MATCH_ENTRY" className="text-white hover:bg-[#3A3A3A]">Match Entry</SelectItem>
                <SelectItem value="BOOKING" className="text-white hover:bg-[#3A3A3A]">Booking</SelectItem>
                <SelectItem value="WIN" className="text-white hover:bg-[#3A3A3A]">Win</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="bg-[#2A2A2A] border-[#3A3A3A] text-white">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                <SelectItem value="all" className="text-white hover:bg-[#3A3A3A]">All Time</SelectItem>
                <SelectItem value="today" className="text-white hover:bg-[#3A3A3A]">Today</SelectItem>
                <SelectItem value="week" className="text-white hover:bg-[#3A3A3A]">This Week</SelectItem>
                <SelectItem value="month" className="text-white hover:bg-[#3A3A3A]">This Month</SelectItem>
                <SelectItem value="year" className="text-white hover:bg-[#3A3A3A]">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  <th className="text-left p-3 text-white">Transaction ID</th>
                  <th className="text-left p-3 text-white">User</th>
                  <th className="text-left p-3 text-white">Type</th>
                  <th className="text-left p-3 text-white">Amount</th>
                  <th className="text-left p-3 text-white">Status</th>
                  <th className="text-left p-3 text-white">Description</th>
                  <th className="text-left p-3 text-white">Date</th>
                  <th className="text-right p-3 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-[#2A2A2A] hover:bg-[#2A2A2A]">
                    <td className="p-3">
                      <div className="max-w-[240px] overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-[#3A3A3A] scrollbar-track-transparent">
                        <span className="bg-[#2A2A2A] px-2 py-1 rounded text-cyan-300 font-mono text-sm inline-block">
                          {transaction.transactionId || transaction._id}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#FF4D4F] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {transaction.userId.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{transaction.userId.name}</div>
                          <div className="text-gray-400 text-xs">{transaction.userId.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`flex items-center gap-1 ${getTypeColor(transaction.type)}`}>
                        <span>{getTypeIcon(transaction.type)}</span>
                        <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${
                        transaction.type === 'CREDIT' || transaction.type === 'DEPOSIT' || transaction.type === 'WIN'
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {transaction.type === 'CREDIT' || transaction.type === 'DEPOSIT' || transaction.type === 'WIN' ? '+' : '-'}₹{Math.abs(transaction.amount)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300 max-w-xs truncate">
                      {transaction.description}
                    </td>
                    <td className="p-3 text-gray-400">
                      {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-white border-[#3A3A3A] hover:bg-[#3A3A3A]"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTransaction(transaction._id)}
                          className="h-8 w-8 p-0 text-red-400 border-red-500 hover:bg-red-500 hover:text-white"
                          title="Delete Transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-gray-400 text-sm">
              Showing {transactions.length} transactions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-white border-[#3A3A3A]"
              >
                Previous
              </Button>
              <span className="text-white text-sm">
                Page {currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={transactions.length < itemsPerPage}
                className="text-white border-[#3A3A3A]"
              >
                Next
              </Button>
            </div>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-10">
              <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold text-white mb-2">No Transactions Found</h3>
              <p className="text-gray-400">No transactions match your current filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllTransactionsHistory;
