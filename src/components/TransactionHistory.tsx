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
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface Transaction {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    freeFireUsername: string;
    wallet?: number;
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

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
        dateFilter: dateFilter,
        sortBy: sortBy,
        sortOrder: sortOrder
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/admin/transaction-history?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
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
  }, [currentPage, statusFilter, typeFilter, dateFilter, sortBy, sortOrder]);

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
        return <TrendingUp className="h-4 w-4" />;
      case 'DEBIT':
      case 'WITHDRAW':
        return <TrendingDown className="h-4 w-4" />;
      case 'MATCH_ENTRY':
      case 'BOOKING':
        return '🎮';
      case 'WIN':
        return '🏆';
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  // Since we're getting paginated data from API, we don't need client-side filtering
  const paginatedTransactions = transactions;

  const handleRefresh = () => {
    fetchTransactions();
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting transaction history...');
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
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
                <p className="text-2xl font-bold text-white">{transactions.length}</p>
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
                <p className="text-2xl font-bold text-green-400">
                  ₹{transactions.filter(t => t.type === 'CREDIT' || t.type === 'DEPOSIT').reduce((sum, t) => sum + t.amount, 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Withdrawals</p>
                <p className="text-2xl font-bold text-red-400">
                  ₹{transactions.filter(t => t.type === 'DEBIT' || t.type === 'WITHDRAW').reduce((sum, t) => sum + t.amount, 0)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Transactions</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {transactions.filter(t => t.status === 'PENDING_ADMIN_APPROVAL').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Transaction History</CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search transactions... (Press Enter to search)"
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
                <SelectItem value="ADMIN_APPROVED" className="text-white hover:bg-[#3A3A3A]">Approved</SelectItem>
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
                <SelectItem value="DEPOSIT" className="text-white hover:bg-[#3A3A3A]">Deposit</SelectItem>
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

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}>
              <SelectTrigger className="bg-[#2A2A2A] border-[#3A3A3A] text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                <SelectItem value="date-desc" className="text-white hover:bg-[#3A3A3A]">Date (Newest)</SelectItem>
                <SelectItem value="date-asc" className="text-white hover:bg-[#3A3A3A]">Date (Oldest)</SelectItem>
                <SelectItem value="amount-desc" className="text-white hover:bg-[#3A3A3A]">Amount (High to Low)</SelectItem>
                <SelectItem value="amount-asc" className="text-white hover:bg-[#3A3A3A]">Amount (Low to High)</SelectItem>
                <SelectItem value="type-asc" className="text-white hover:bg-[#3A3A3A]">Type (A-Z)</SelectItem>
                <SelectItem value="type-desc" className="text-white hover:bg-[#3A3A3A]">Type (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  <th className="text-left p-3 text-white">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-1 hover:text-blue-400 text-white"
                    >
                      Date
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-3 text-white">Type</th>
                  <th className="text-left p-3 text-white">Description</th>
                  <th className="text-left p-3 text-white">
                    <button
                      onClick={() => handleSort('amount')}
                      className="flex items-center gap-1 hover:text-blue-400 text-white"
                    >
                      Amount
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-3 text-white">Balance</th>
                  <th className="text-left p-3 text-white">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-blue-400 text-white"
                    >
                      Status
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-right p-3 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-[#2A2A2A] hover:bg-[#2A2A2A]">
                    <td className="p-3 text-gray-400">
                      {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3">
                      <span className={`flex items-center gap-2 ${getTypeColor(transaction.type)}`}>
                        {getTypeIcon(transaction.type)}
                        <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="p-3 text-gray-300 max-w-xs truncate">
                      {transaction.description}
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${
                        transaction.type === 'CREDIT' || transaction.type === 'DEPOSIT' || transaction.type === 'WIN'
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {transaction.type === 'CREDIT' || transaction.type === 'DEPOSIT' || transaction.type === 'WIN' ? '+' : '-'}₹{transaction.amount}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-white font-medium">
                        ₹{transaction.balanceAfter || 0}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-white border-[#3A3A3A]"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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

export default TransactionHistory;
