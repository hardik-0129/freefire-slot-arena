import React, { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext';
import { io, Socket } from 'socket.io-client';
import { useSearchParams } from 'react-router-dom'
import Footer from '@/components/Footer'
import { Header } from '@/components/Header'
import "../components/css/Wallets.css"
import { jwtDecode } from 'jwt-decode'

// Utility function to create TranzUPI order
async function createTranzUPIOrder(amount: number, customerMobile: string, userId: string) {
    const orderId = `ORDER_${userId}_${Date.now()}`;
    const redirectUrl = `${window.location.origin}/wallets?order_id=${orderId}`;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/tranzupi/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customerMobile,
            amount,
            orderId,
            redirectUrl,
            remark1: userId,
            remark2: 'AddMoney'
        })
    });
    return response.json();
}

// Utility function to check TranzUPI order status (send userId)
async function checkOrderStatus(order_id: string, userId: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/tranzupi/check-order-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id, userId }),
    });
    return response.json();
}

interface DecodedToken {
    userId: string;
    name: string;
    email: string;
    role: string;
    iat: number;
}

const Wallets = () => {
    // State for TranzUPI order status check (no userToken needed)
    // const [orderId, setOrderId] = useState('');
    // const [orderStatus, setOrderStatus] = useState<string | null>(null);
    // const [orderError, setOrderError] = useState<string | null>(null);

    // const handleCheckStatus = async () => {
    //     setOrderStatus(null);
    //     setOrderError(null);
    //     try {
    //         const result = await checkOrderStatus(orderId);
    //         if (result.success) {
    //             setOrderStatus('Payment Success: ' + JSON.stringify(result.result));
    //             fetchWalletBalance();
    //         } else {
    //             setOrderError('Payment Error: ' + result.message);
    //         }
    //     } catch (err: any) {
    //         setOrderError('Error: ' + err.message);
    //     }
    // };
    // Add Money via TranzUPI Create Order
    // const [addMobile, setAddMobile] = useState('');
    // const [addUserId, setAddUserId] = useState('');
    // const [addOrderAmount, setAddOrderAmount] = useState('');
    // const [addOrderError, setAddOrderError] = useState<string | null>(null);
    // const [addOrderLoading, setAddOrderLoading] = useState(false);

    // For demo: get userId and mobile from token/localStorage (customize as needed)
    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //         try {
    //             const decoded = jwtDecode<DecodedToken & { phone?: string }>(token);
    //             setAddUserId(decoded.userId || '');
    //             setAddMobile(decoded.phone || '');
    //         } catch { }
    //     }
    // }, []);

    // const handleCreateTranzUPIOrder = async () => {
    //     setAddOrderError(null);
    //     setAddOrderLoading(true);
    //     try {
    //         if (!addOrderAmount) {
    //             setAddOrderError('Enter valid amount');
    //             setAddOrderLoading(false);
    //             return;
    //         }
    //         if (!addMobile || !addUserId) {
    //             setAddOrderError('User info missing');
    //             setAddOrderLoading(false);
    //             return;
    //         }
    //         const result = await createTranzUPIOrder(parseFloat(addOrderAmount), addMobile, addUserId);
    //         if (result.success && result.order && result.order.result && result.order.result.payment_url) {
    //             window.location.href = result.order.result.payment_url;
    //         } else {
    //             setAddOrderError(result.error || 'Failed to create order');
    //         }
    //     } catch (err: any) {
    //         setAddOrderError('Error: ' + err.message);
    //     }
    //     setAddOrderLoading(false);
    // };
    // ...existing code...

    const [searchParams] = useSearchParams();
    const { walletBalance, setWalletBalance } = useWallet();
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [totalPayouts, setTotalPayouts] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [addAmount, setAddAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [upiId, setUpiId] = useState('');
    // Remove accountHolderName, use userId for withdrawal
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [pendingHolds, setPendingHolds] = useState(0);


    useEffect(() => {
        fetchWalletBalance();
        fetchTransactionHistory();

        // --- SOCKET.IO REAL-TIME WALLET UPDATE ---
        let socket: Socket | null = null;
        const token = localStorage.getItem('token');
        let userId = '';
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                userId = decoded.userId;
            } catch { }
        }
        if (userId) {
            // Use your backend URL/port if not localhost:5000
            socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
            socket.emit('join', userId);
            socket.on('walletUpdate', (data) => {
                // Update immediate wallet balance and refresh derived values (earnings/join money)
                setWalletBalance(data.balance);
                // Re-fetch balance so earnings and payouts reflect without manual refresh
                fetchWalletBalance();
                fetchTransactionHistory();
            });
        }

        // --- END SOCKET.IO ---
        const status = searchParams.get('status');
        const amount = searchParams.get('amount');
        const newBalance = searchParams.get('new_balance');
        const error = searchParams.get('error');
        const upiIdParam = searchParams.get('upi_id');
        const orderIdFromUrl = searchParams.get('order_id');

        // Auto-check TranzUPI payment status if order_id is present
        if (orderIdFromUrl && userId) {
            (async () => {
                setMessage('Checking payment status...');
                const result = await checkOrderStatus(orderIdFromUrl, userId);
                if (result.success) {
                    setMessage('✅ Payment successful! Amount added to your wallet.');
                    fetchWalletBalance();
                    fetchTransactionHistory();
                } else {
                    setMessage('❌ Payment not completed: ' + (result.message || 'Unknown error'));
                }
                // Clear URL parameters after showing message
                setTimeout(() => {
                    window.history.replaceState({}, '', '/wallets');
                    setMessage('');
                }, 5000);
            })();
            return;
        }

        if (status === 'success' && amount) {
            let successMessage = `✅ Payment successful! ₹${amount} added to your wallet.`;
            if (newBalance) {
                successMessage += ` New balance: ₹${newBalance}`;
                setWalletBalance(parseFloat(newBalance));
            }
            setMessage(successMessage);
            fetchWalletBalance();
            fetchTransactionHistory();
            setTimeout(() => {
                window.history.replaceState({}, '', '/wallets');
                setMessage('');
            }, 5000);
        } else if (status === 'withdraw_success' && amount) {
            let successMessage = `✅ Withdrawal successful! ₹${amount} withdrawn from your wallet.`;
            if (newBalance) {
                successMessage += ` New balance: ₹${newBalance}`;
                setWalletBalance(parseFloat(newBalance));
            }
            if (upiIdParam) {
                successMessage += ` Transferred to: ${decodeURIComponent(upiIdParam)}`;
            }
            setMessage(successMessage);
            fetchWalletBalance();
            fetchTransactionHistory();
            setTimeout(() => {
                window.history.replaceState({}, '', '/wallets');
                setMessage('');
            }, 5000);
        } else if (status === 'failure') {
            const errorMessage = error ? decodeURIComponent(error) : 'Payment failed. Please try again.';
            setMessage(`❌ ${errorMessage}`);
            setTimeout(() => {
                window.history.replaceState({}, '', '/wallets');
                setMessage('');
            }, 5000);
        } else if (status === 'withdraw_failure') {
            const errorMessage = error ? decodeURIComponent(error) : 'Withdrawal failed. Please try again.';
            setMessage(`❌ ${errorMessage}`);
            setTimeout(() => {
                window.history.replaceState({}, '', '/wallets');
                setMessage('');
            }, 5000);
        }

        // Cleanup socket on unmount
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [searchParams]);


    const fetchWalletBalance = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setWalletBalance(0);
                setTotalEarnings(0);
                setTotalPayouts(0);
                return;
            }
            const decoded = jwtDecode<DecodedToken>(token);
            const userId = decoded.userId;
            if (!userId) {
                setWalletBalance(0);
                setTotalEarnings(0);
                setTotalPayouts(0);
                return;
            }
            const apiUrl = `${import.meta.env.VITE_API_URL}/api/wallet/balance?id=${userId}`;
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setWalletBalance((data.totalBalance));
                setTotalEarnings(data.winAmount);
                setTotalPayouts(data.totalPayouts);
            } else {
                setWalletBalance(0);
                setTotalEarnings(0);
                setTotalPayouts(0);
                setPendingHolds(0);
            }
        } catch (error) {
            setWalletBalance(0);
            setTotalEarnings(0);
            setTotalPayouts(0);
            setPendingHolds(0);
        }
    };

    const fetchTransactionHistory = async () => {
        setLoadingTransactions(true);
        try {
            const token = localStorage.getItem('token');
            let userId = '';
            if (token) {
                try {
                    const decoded = jwtDecode<{ userId: string }>(token);
                    userId = decoded.userId;
                } catch (e) { }
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/transactions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });
            if (response.ok) {
                const data = await response.json();
                setTransactions(data.transactions || []);
                setBookings(data.bookings || []);
                // Calculate total payouts (sum of all successful withdrawals)
                const total = (data.transactions || [])
                    .filter((tx) => (tx.type === 'WITHDRAW' || tx.type === 'DEBIT') && (tx.status === 'SUCCESS' || tx.status === 'ADMIN_APPROVED'))
                    .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
                setTotalPayouts(total || 0);
                // No need to calculate/set totalWinnings, use totalEarnings from balance API
            }
        } catch (error) {
            console.error('Error fetching transaction history:', error);
        }
        setLoadingTransactions(false);
    };

    const formatTransactionType = (type) => {
        switch (type) {
            case 'CREDIT':
                return 'CREDIT';
            case 'DEBIT':
                return 'WITHDRAW';
            case 'WIN':
                return 'WIN';
            case 'LOSS':
                return 'LOSS';
            case 'REFUND':
                return 'REFUND';
            case 'WITHDRAW':
                return 'WITHDRAW';
            case 'DEPOSIT':
                return 'DEPOSIT';
            default:
                return type;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'CREDIT':
            case 'DEPOSIT':
            case 'WIN':
            case 'REFUND':
                return '+ ';
            case 'DEBIT':
            case 'WITHDRAW':
            case 'LOSS':
                return '- ';
            default:
                return '';
        }
    };

    // Function to combine and sort transactions and bookings
    const getCombinedHistory = () => {
        const combined = [];

        // Add transactions
        transactions.forEach(tx => {
            combined.push({
                ...tx,
                itemType: 'transaction',
                sortDate: new Date(tx.createdAt)
            });
        });

        // Add bookings
        bookings.forEach(booking => {
            combined.push({
                _id: booking._id,
                type: 'BOOKING',
                amount: booking.totalAmount,
                description: `Match booking: ${booking.slot?.matchTitle || 'Unknown Match'} (${booking.slotType})`,
                createdAt: booking.createdAt,
                status: booking.status === 'confirmed' ? 'SUCCESS' : booking.status.toUpperCase(),
                balanceAfter: walletBalance, // Use current wallet balance for bookings
                itemType: 'booking',
                sortDate: new Date(booking.createdAt),
                metadata: {
                    matchTitle: booking.slot?.matchTitle,
                    slotType: booking.slotType,
                    tournamentName: booking.slot?.tournamentName,
                    entryFee: booking.entryFee,
                    selectedPositions: booking.selectedPositions,
                    playerNames: booking.playerNames
                }
            });
        });

        // Sort by date (newest first)
        return combined.sort((a, b) => b.sortDate - a.sortDate);
    };

    const handleAddMoney = async () => {
        if (!addAmount || parseFloat(addAmount) <= 0) {
            setMessage('Please enter a valid amount');
            return;
        }

        // No minimum amount restriction

        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage('User not authenticated');
                setLoading(false);
                return;
            }
            const decoded = jwtDecode<{ userId: string, phone?: string }>(token);
            const userId = decoded.userId;
            
            console.log(userId);
            if (!userId) {
                setMessage('User info missing');
                setLoading(false);
                return;
            }
            const orderId = `ORDER_${userId}_${Date.now()}`;
            const redirectUrl = `${window.location.origin}/wallets?order_id=${orderId}`;
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/tranzupi/create-order`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerMobile: userId,
                    amount: parseFloat(addAmount),
                    orderId,
                    redirectUrl,
                    remark1: userId,
                    remark2: 'AddMoney'
                })
            });
            const data = await response.json();
            if (data.success && data.order && data.order.result && data.order.result.payment_url) {
                window.location.href = data.order.result.payment_url;
            } else {
                setMessage(data.error || 'Failed to create payment');
            }
        } catch (error) {
            setMessage('Error creating payment: ' + (error.message || error));
        }
        setLoading(false);
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
            setMessage('Please enter a valid amount');
            return;
        }

        // No minimum withdrawal amount restriction

        if (!upiId) {
            setMessage('Please enter UPI ID');
            return;
        }

        // if (parseFloat(withdrawAmount) > totalEarnings) {
        //     setMessage('You can withdraw only from your winnings balance.');
        //     return;
        // }

        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            // Get userId from token
            let userId = '';
            if (token) {
                try {
                    const decoded = jwtDecode<{ userId: string }>(token);
                    userId = decoded.userId;
                } catch (e) { }
            }
            // Ensure socket connection and join room before withdrawal
            let socket: Socket | null = null;
            if (userId) {
                socket = io(import.meta.env.VITE_API_URL);
                socket.emit('join', userId);
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/tranzupi/withdraw`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: parseFloat(withdrawAmount),
                    upi_id: upiId,
                    userId: userId
                })
            });

            const data = await response.json();

            if (data.success) {
                if (data.withdrawal_url && data.test_mode) {
                    // Redirect to mock withdrawal page for testing
                    window.location.href = data.withdrawal_url;
                } else if (data.requires_approval) {
                    // New admin approval flow
                    setMessage('✅ Withdrawal request submitted successfully! Your request will be reviewed by our admin team and processed within 24 hours. You will be notified once approved.');
                    setShowWithdrawModal(false);
                    setWithdrawAmount('');
                    setUpiId('');
                    // No need to reset accountHolderName
                    // Refresh transaction history to show the pending withdrawal
                    fetchTransactionHistory();
                    // Also refresh balances so EARNINGS reflects the immediate hold
                    fetchWalletBalance();
                } else {
                    // Legacy production mode - withdrawal request submitted
                    setMessage('Withdrawal request submitted successfully!');
                    if (data.remaining_balance !== undefined) {
                        setWalletBalance(data.remaining_balance);
                    }
                    setShowWithdrawModal(false);
                    setWithdrawAmount('');
                    setUpiId('');
                    // No need to reset accountHolderName
                }
            } else {
                setMessage(data.error || 'Failed to process withdrawal');
            }
            // Clean up socket after withdrawal
            if (socket) {
                socket.disconnect();
            }
        } catch (error) {
            setMessage('Error processing withdrawal: ' + error.message);
        }
        setLoading(false);
    };
    return (
        <>
            <Header />
            <div className="container py-16">
                <h2 className="wallet-title">WALLET</h2>

                {message && (
                    <div className={`message-alert ${message.includes('success') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <div className="wallet-boxes">
                    <div className="wallet-card large">
                        <span className="card-header">TOTAL BALANCE</span>
                        <div className="card-content flex-between">
                            <div>
                                <div className="coin-amount"><img src="/assets/vector/Coin.png" alt="Coin" className="coin-icon" /> {Math.max(0, walletBalance).toFixed(2)}</div>
                                <p className="coin-label"><span style={{ width: '100px' }}>Win money :</span> <img src="/assets/vector/Coin.png" alt="Coin" className="coin-icon" /> {totalEarnings.toFixed(2)}</p>
                                <p className="coin-label">Join money : <img src="/assets/vector/Coin.png" alt="Coin" className="coin-icon" /> {Math.max(0, (walletBalance - totalEarnings)).toFixed(2)}</p>
                            </div>
                            <div className="action-buttons">
                                <button
                                    className="btn orange"
                                    onClick={() => setShowAddModal(true)}
                                >
                                    ADD
                                </button>
                                <button
                                    className="btn orange"
                                    onClick={() => setShowWithdrawModal(true)}
                                >
                                    WITHDRAW
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="wallet-card small">
                        <span className="card-header">EARNINGS BALANCE</span>
                        <div className="card-content center">
                            <div className="coin-amount"><img src="/assets/vector/Coin.png" alt="Coin" className="coin-icon" /> {totalEarnings.toFixed(2)}</div>
                        </div>
                    </div>
                    <div className="wallet-card small">
                        <span className="card-header">TOTAL PAYOUTS</span>
                        <div className="card-content center">
                            <div className="coin-amount"><img src="/assets/vector/Coin.png" alt="Coin" className="coin-icon" /> {(totalPayouts || 0).toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                {/* Add Money Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>

                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Add Money via TranzUPI</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Amount (INR)</label>
                                    <input
                                        type="number"
                                        value={addAmount}
                                        onChange={(e) => setAddAmount(e.target.value)}
                                        placeholder="Enter amount to add"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button
                                        className="btn orange"
                                        onClick={handleAddMoney}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Pay with UPI'}
                                    </button>
                                    <button
                                        className="btn secondary"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Withdraw Money Modal */}
                {showWithdrawModal && (
                    <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Withdraw Money via TranzUPI</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowWithdrawModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                {message && (
                                    <div className={`message-alert ${message.includes('success') ? 'success' : 'error'}`}>
                                        {message}
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Amount (INR)</label>
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder={`Max withdrawable: ${totalEarnings.toFixed(2)}`}
                                        max={totalEarnings}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>UPI ID</label>
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="Enter UPI ID (e.g., user@paytm)"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Account Holder Name</label>
                                    <input
                                        type="text"
                                        // Remove accountHolderName input field from UI
                                        placeholder="Enter account holder name"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button
                                        className="btn orange"
                                        onClick={handleWithdraw}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Withdraw Money'}
                                    </button>
                                    <button
                                        className="btn secondary"
                                        onClick={() => setShowWithdrawModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <h2 className="wallet-title">WALLET HISTORY</h2>

                <div className="wallet-history">
                    {loadingTransactions ? (
                        <div className="history-item" style={{ textAlign: 'center', padding: '20px' }}>
                            <span>Loading transaction history...</span>
                        </div>
                    ) : getCombinedHistory().length > 0 ? (
                        getCombinedHistory().map((item, index) => (
                            <div key={item._id || index} className="history-item">
                                <div className="left">
                                    <span className={`history-type ${item.type === 'CREDIT' || item.type === 'WIN' || item.type === 'REFUND' ? 'credit' : 'debit'}`}>
                                        {formatTransactionType(item.type)}
                                        {item.status === 'PENDING_ADMIN_APPROVAL' && (
                                            <span className="status-badge pending"> • PENDING APPROVAL</span>
                                        )}
                                        {item.status === 'ADMIN_REJECTED' && (
                                            <span className="status-badge rejected"> • REJECTED</span>
                                        )}
                                        {(item.status === 'SUCCESS' || item.status === 'ADMIN_APPROVED') && (
                                            <span className="status-badge approved"> • SUCCESS</span>
                                        )}
                                        {item.status === 'CANCELLED' && (
                                            <span className="status-badge cancelled"> • CANCELLED</span>
                                        )}
                                    </span>
                                    <div>
                                        {item.itemType === 'booking' ? (
                                            <>
                                                {item.description}
                                                {item.metadata?.tournamentName && (
                                                    <> • Tournament: {item.metadata.tournamentName}</>
                                                )}
                                                {item.metadata?.selectedPositions && (
                                                    <> • Positions: {Object.keys(item.metadata.selectedPositions).join(', ')}</>
                                                )}
                                                <> - #{item._id.slice(-6)} {formatDate(item.createdAt)}</>
                                            </>
                                        ) : (
                                            <>
                                                {item.description}
                                                {item.metadata?.externalTxnId ? (
                                                    <> • Ref: {item.metadata.externalTxnId}</>
                                                ) : (
                                                    <> - #{item.transactionId ? item.transactionId.slice(-6) : item._id.slice(-6)}</>
                                                )}
                                                {item.type === 'REFUND' && item.metadata?.cancelReason && (
                                                    <> • Cancel reason: {item.metadata.cancelReason}</>
                                                )}
                                                {item.type === 'REFUND' && item.metadata?.matchTitle && (
                                                    <> • Match: {item.metadata.matchTitle}</>
                                                )}
                                                <> {formatDate(item.createdAt)}</>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="right">
                                    <span className={item.type === 'CREDIT' || item.type === 'WIN' || item.type === 'REFUND' ? 'plus' : 'minus'}>
                                        {getTransactionIcon(item.type)}<img src="/assets/vector/Coin.png" alt="Coin" className="coin-icon" /> {item.amount.toFixed(2)}
                                    </span>
                                    <span className="coin"><img src="/assets/vector/Coin.png" alt="Coin" className="coin-icon" /> {item.balanceAfter.toFixed(2)}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="history-item" style={{ textAlign: 'center', padding: '20px' }}>
                            <span>No transactions found. Start by adding money to your wallet!</span>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Wallets
