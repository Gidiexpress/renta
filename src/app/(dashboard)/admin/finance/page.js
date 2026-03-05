'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Wallet, ArrowUpRight, TrendingUp, Calendar, Search, Download, Filter } from 'lucide-react';
import styles from '../../tenant/dashboard.module.css'; // Reusing dashboard styles

export default function AdminFinancePage() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalPromotions: 0,
        activeRentals: 0,
        pendingPayouts: 0
    });
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchFinanceData = async () => {
            try {
                // In a real app, this would be a dedicated API route
                // For now, we'll fetch payments and calculate stats
                const res = await fetch('/api/admin/payments'); // We'll need to create this or use existing if any
                if (res.ok) {
                    const data = await res.json();
                    setPayments(data.payments || []);
                    setStats(data.stats || {
                        totalRevenue: data.payments?.filter(p => p.status === 'SUCCESS').reduce((acc, p) => acc + p.amount, 0) || 0,
                        totalPromotions: data.payments?.filter(p => p.type === 'PROMOTION' && p.status === 'SUCCESS').length || 0,
                        activeRentals: data.payments?.filter(p => p.type === 'RENT' && p.status === 'SUCCESS').length || 0,
                        pendingPayouts: 0
                    });
                }
            } catch (err) {
                console.error('Failed to fetch finance data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFinanceData();
    }, []);

    const filteredPayments = payments.filter(p =>
        p.paymentRef?.toLowerCase().includes(search.toLowerCase()) ||
        p.user?.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fade-in">
            <div className={styles.welcomeSection}>
                <h2>Financial Management</h2>
                <p className="text-muted">Track platform revenue, promotions, and user payments</p>
            </div>

            {/* Stats Overview */}
            <div className={styles.statsGrid}>
                <div className={`card ${styles.statCard}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.statTitle}>Total Revenue</div>
                        <div className={`${styles.statIcon} bg-primary-light text-primary`}>
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className={styles.statValue}>₦{stats.totalRevenue.toLocaleString()}</div>
                    <div className={styles.statTrend}>
                        <TrendingUp size={14} className="text-success" />
                        <span className="text-success">+12% from last month</span>
                    </div>
                </div>

                <div className={`card ${styles.statCard}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.statTitle}>Promotion Earnings</div>
                        <div className={`${styles.statIcon} bg-info-light text-info`}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className={styles.statValue}>₦{(stats.totalPromotions * 5000).toLocaleString()}</div>
                    <div className={styles.statTrend}>
                        <span className="text-muted">{stats.totalPromotions} promoted listings</span>
                    </div>
                </div>

                <div className={`card ${styles.statCard}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.statTitle}>Success Rate</div>
                        <div className={`${styles.statIcon} bg-success-light text-success`}>
                            <ArrowUpRight size={20} />
                        </div>
                    </div>
                    <div className={styles.statValue}>94.2%</div>
                    <div className={styles.statTrend}>
                        <span className="text-muted">Payment conversion</span>
                    </div>
                </div>

                <div className={`card ${styles.statCard}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.statTitle}>Internal Revenue</div>
                        <div className={`${styles.statIcon} bg-warning-light text-warning`}>
                            <Wallet size={20} />
                        </div>
                    </div>
                    <div className={styles.statValue}>₦{(stats.totalRevenue * 0.1).toLocaleString()}</div>
                    <div className={styles.statTrend}>
                        <span className="text-muted">10% Platform commission</span>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Transaction History</h3>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search reference or email..."
                                className="form-input pl-10 w-64"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-outline flex items-center gap-2">
                            <Download size={18} /> Export
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b text-muted text-sm">
                                <th className="pb-4 font-semibold">Reference</th>
                                <th className="pb-4 font-semibold">User</th>
                                <th className="pb-4 font-semibold">Amount</th>
                                <th className="pb-4 font-semibold">Type</th>
                                <th className="pb-4 font-semibold">Date</th>
                                <th className="pb-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b animate-pulse">
                                        <td className="py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                        <td className="py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                        <td className="py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                        <td className="py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                    </tr>
                                ))
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-muted">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="py-4 font-mono text-xs">{payment.paymentRef}</td>
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{payment.user?.firstName} {payment.user?.lastName}</span>
                                                <span className="text-xs text-muted">{payment.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 font-bold text-primary">₦{payment.amount.toLocaleString()}</td>
                                        <td className="py-4">
                                            <span className={`badge ${payment.type === 'PROMOTION' ? 'badge-info' : 'badge-primary'}`}>
                                                {payment.type}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm text-muted">
                                            {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="py-4">
                                            <span className={`badge ${payment.status === 'SUCCESS' ? 'badge-success' : 'badge-warning'}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                .bg-primary-light { background-color: rgba(var(--color-primary-rgb), 0.1); }
                .bg-info-light { background-color: rgba(var(--color-info-rgb), 0.1); }
                .bg-success-light { background-color: #ecfdf5; }
                .bg-warning-light { background-color: #fffbeb; }
                .badge-info { background: #e0f2fe; color: #0369a1; }
            `}</style>
        </div>
    );
}
