'use client';

import { useState, useEffect } from 'react';
import { Users, Home, MapPin, Calendar, Phone, CheckCircle, Clock, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function LandlordTenantsPage() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedTenant, setExpandedTenant] = useState(null);

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const res = await fetch('/api/landlord/tenants');
                const data = await res.json();
                if (res.ok) setRentals(data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchTenants();
    }, []);

    const activeCount = rentals.filter(r => r.status === 'ACTIVE').length;

    return (
        <div className="fade-in">
            <header className="mb-6">
                <h1 style={{ fontSize: 'var(--text-2xl)' }}>My Tenants</h1>
                <p className="text-muted">View tenants currently renting your properties.</p>
            </header>

            <div className="card mb-6" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-4">
                    <Users size={24} style={{ color: 'var(--color-primary)' }} />
                    <div>
                        <p className="text-sm text-muted">Active Tenants</p>
                        <h3 style={{ fontSize: 'var(--text-2xl)' }}>{activeCount}</h3>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="card text-center text-muted" style={{ padding: 'var(--space-8)' }}>Loading tenants...</div>
            ) : rentals.length === 0 ? (
                <div className="card text-center" style={{ padding: 'var(--space-12)' }}>
                    <Users size={48} style={{ color: 'var(--text-light)', margin: '0 auto var(--space-4)' }} />
                    <h3 style={{ fontSize: 'var(--text-lg)' }}>No tenants yet</h3>
                    <p className="text-muted text-sm mt-2">Once someone rents your property, they&apos;ll appear here.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {rentals.map(rental => (
                        <div key={rental.id} className="card">
                            <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                                <div className="flex items-center gap-4">
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%',
                                        background: 'var(--color-primary)', color: 'var(--color-black)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'var(--font-bold)', fontSize: 'var(--text-lg)', flexShrink: 0
                                    }}>
                                        {rental.tenant?.firstName?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold" style={{ fontSize: 'var(--text-base)' }}>
                                            {rental.tenant?.firstName} {rental.tenant?.lastName}
                                        </h4>
                                        <div className="flex gap-3 mt-1" style={{ flexWrap: 'wrap' }}>
                                            {rental.tenant?.phone && (
                                                <a href={`tel:${rental.tenant.phone}`} className="text-xs flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                                                    <Phone size={12} /> {rental.tenant.phone}
                                                </a>
                                            )}
                                            <span className="text-xs text-muted flex items-center gap-1">
                                                <Home size={12} /> {rental.property?.title}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <span className={`badge ${rental.status === 'ACTIVE' ? 'badge-verified' : 'badge-pending'} flex items-center gap-1`}>
                                        {rental.status === 'ACTIVE' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                        {rental.status}
                                    </span>
                                    <p className="text-xs text-muted">
                                        <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                        {new Date(rental.startDate).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        <Link
                                            href={`/landlord/messages?startThreadWith=${rental.tenantId}&rentalId=${rental.id}&title=${encodeURIComponent(rental.property?.title)}`}
                                            className="btn btn-sm btn-primary"
                                            style={{ fontSize: '11px', padding: '4px 8px' }}
                                        >
                                            <MessageCircle size={12} className="mr-1" /> Message Tenant
                                        </Link>
                                        {rental.tenant?.tenantProfile && (
                                            <button
                                                onClick={() => setExpandedTenant(expandedTenant === rental.id ? null : rental.id)}
                                                className="btn btn-outline btn-sm"
                                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                            >
                                                {expandedTenant === rental.id ? 'Hide Profile' : 'View Profile'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {expandedTenant === rental.id && rental.tenant?.tenantProfile && (
                                <div className="mt-4 p-4 rounded-md" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                    <h5 className="font-semibold text-sm mb-3">Screening Profile</h5>
                                    <div className="grid grid-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted text-xs uppercase tracking-wider mb-1">Employment Status</p>
                                            <p className="font-medium">{rental.tenant.tenantProfile.employmentStatus.replace('_', ' ')}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted text-xs uppercase tracking-wider mb-1">Monthly Income</p>
                                            <p className="font-medium">₦{Number(rental.tenant.tenantProfile.monthlyIncome).toLocaleString()}</p>
                                        </div>
                                        {rental.tenant.tenantProfile.employerName && (
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <p className="text-muted text-xs uppercase tracking-wider mb-1">Employer / School</p>
                                                <p className="font-medium">{rental.tenant.tenantProfile.employerName}</p>
                                            </div>
                                        )}
                                        {rental.tenant.tenantProfile.previousLandlordReference && (
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <p className="text-muted text-xs uppercase tracking-wider mb-1">Reference</p>
                                                <p className="font-medium">{rental.tenant.tenantProfile.previousLandlordReference}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}