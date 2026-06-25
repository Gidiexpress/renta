'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Wallet, ArrowUpRight, TrendingUp, Search, Download, Loader2 } from 'lucide-react';
import styles from '../../tenant/dashboard.module.css';

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
                const res = await fetch('/api/admin/payments');
                if (res.ok) {
                    const data = await res.json();
                    setPayments(data.payments || []);
                    setStats(data.stats || {
                        totalRevenue: data.payments?.filter(p => p.status === 'SUCCESS').reduce((acc, p) => acc + Number(p.amount), 0) || 0,
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
        p.paystackRef?.toLowerCase().includes(search.toLowerCase()) ||
        p.rental?.tenant?.email?.toLowerCase().includes(search.toLowerCase())
    );

    const statCards = [
        {
            title: 'Total Revenue',
            value: `₦${Number(stats.totalRevenue).toLocaleString()}`,
            icon: DollarSign,
            trend: '+12% from last month',
            trendColor: 'var(--color-success)',
            iconBg: 'var(--color-primary-light)',
            iconColor: 'var(--color-primary-dark)',
        },
        {
            title: 'Pending Payouts',
            value: `₦${Number(stats.pendingPayouts || 0).toLocaleString()}`,
            icon: TrendingUp,
            trend: 'Awaiting admin approval',
            trendColor: 'var(--text-muted)',
            iconBg: 'var(--color-info-light)',
            iconColor: 'var(--color-info)',
        },
        {
            title: 'Success Rate',
            value: '94.2%',
            icon: ArrowUpRight,
            trend: 'Payment conversion',
            trendColor: 'var(--text-muted)',
            iconBg: 'var(--color-success-light)',
            iconColor: 'var(--color-success)',
        },
        {
            title: 'Platform Commission',
            value: `₦${(Number(stats.totalRevenue) * 0.1).toLocaleString()}`,
            icon: Wallet,
            trend: '10% of total revenue',
            trendColor: 'var(--text-muted)',
            iconBg: 'var(--color-warning-light)',
            iconColor: 'var(--color-warning)',
        },
    ];

    return (
        <div className="fade-in">
            <div className={styles.welcomeSection}>
                <h2>Financial Management</h2>
                <p className="text-muted">Track platform revenue, promotions, and user payments</p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {statCards.map((card) => (
                    <div key={card.title} className={`card ${styles.statCard}`}>
                        <div className={styles.statHeader}>
                            <span className={styles.statTitle}>{card.title}</span>
                            <span className={styles.statIcon} style={{ background: card.iconBg, color: card.iconColor }}>
                                <card.icon size={18} />
                            </span>
                        </div>
                        <div className={styles.statValue}>{card.value}</div>
                        <div className={styles.statTrend} style={{ color: card.trendColor }}>
                            <TrendingUp size={12} />
                            <span>{card.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Transactions Table */}
            <div className="card" style={{ marginTop: 'var(--space-8)' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-6)',
                    flexWrap: 'wrap',
                    gap: 'var(--space-3)',
                }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', margin: 0 }}>
                        Transaction History
                    </h3>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{
                                position: 'absolute', left: 12, top: '50%',
                                transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none'
                            }} />
                            <input
                                type="text"
                                placeholder="Search reference or email..."
                                className="form-input"
                                style={{ paddingLeft: 36, width: '240px', maxWidth: '100%' }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>Tenant</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)', margin: '0 auto' }} />
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-muted)' }}>
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>
                                            {payment.paystackRef || payment.nombaRef || 'N/A'}
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 'var(--font-medium)', display: 'block' }}>
                                                {payment.rental?.tenant?.firstName} {payment.rental?.tenant?.lastName}
                                            </span>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                                {payment.rental?.tenant?.email}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-primary)' }}>
                                            ₦{Number(payment.amount).toLocaleString()}
                                        </td>
                                        <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                                            {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-GB') : '—'}
                                        </td>
                                        <td>
                                            <span className={`badge ${payment.status === 'SUCCESS' ? 'badge-verified' : payment.status === 'FAILED' ? 'badge-error' : 'badge-pending'}`}>
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
        </div>
    );
}
