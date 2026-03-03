'use client';

import { Settings, Shield, Percent, MapPin, DollarSign, Database } from 'lucide-react';
import styles from '../../tenant/dashboard.module.css';

export default function AdminSettingsPage() {
    const config = {
        platformFee: 0.10, // 10%
        scoutCommission: 0.05, // 5%
        affiliateCommission: 0.03, // 3%
        featuredListingPrice: 5000,
        minWithdrawal: 2000,
        allowedCities: ['Ilorin'],
        allowedAreas: ['TANKE', 'BASIN', 'MALETE', 'OTHER'],
        maintenanceContact: '+234 800 123 4567',
    };

    return (
        <div className="fade-in">
            <div className={styles.propertiesHeader}>
                <h3>Platform Settings</h3>
                <p className="text-sm text-muted">Core configurations for the Renta platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="card">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <DollarSign className="text-primary" size={20} />
                        <h4 className="font-bold">Fee Architecture</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted">Platform Service Fee</span>
                            <span className="font-bold">{config.platformFee * 100}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Scout Commission</span>
                            <span className="font-bold">{config.scoutCommission * 100}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Affiliate Commission</span>
                            <span className="font-bold">{config.affiliateCommission * 100}%</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span className="text-muted">Featured Property Price</span>
                            <span className="font-bold">₦{config.featuredListingPrice.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <MapPin className="text-primary" size={20} />
                        <h4 className="font-bold">Geographic Reach</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted">Active Cities</span>
                            <div className="flex gap-1">
                                {config.allowedCities.map(city => (
                                    <span key={city} className="badge badge-info">{city}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="text-muted block mb-2">Enabled Areas</span>
                            <div className="flex flex-wrap gap-2">
                                {config.allowedAreas.map(area => (
                                    <span key={area} className="badge badge-outline">{area}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <Shield className="text-primary" size={20} />
                        <h4 className="font-bold">Security & Payouts</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted">Minimum Withdrawal</span>
                            <span className="font-bold">₦{config.minWithdrawal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Automatic Escrow Release</span>
                            <span className="font-bold">7 Days</span>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ opacity: 0.6 }}>
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <Database className="text-primary" size={20} />
                        <h4 className="font-bold">System Status</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted">Node Environment</span>
                            <span className="font-bold">Production</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Database Connection</span>
                            <span className="text-success font-bold">Healthy</span>
                        </div>
                        <p className="text-[10px] italic text-muted mt-2">
                            * System-level settings are managed via environment variables.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button className="btn btn-primary" disabled>Save Changes (Locked)</button>
            </div>
        </div>
    );
}