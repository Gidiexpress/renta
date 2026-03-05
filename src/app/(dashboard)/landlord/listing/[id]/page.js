'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    MapPin, Home as HomeIcon, CheckCircle, ArrowLeft,
    ShieldCheck, Info, Sparkles, AlertCircle, Edit, Zap
} from 'lucide-react';
import styles from '../../../tenant/listing/[id]/listing.module.css';

const formatType = (type) => {
    return type.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
};

export default function LandlordPropertyView() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/properties/${id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch property details');
                setProperty(data.property || data); // Handle both wrapped and unwrapped response
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetails();
    }, [id]);

    if (loading) return <div className="flex justify-center" style={{ padding: '100px 0' }}><div className="spinner"></div></div>;

    if (error || !property) {
        return (
            <div className="fade-in container">
                <Link href="/landlord/properties" className="btn btn-outline mb-4"><ArrowLeft size={16} /> Back to My Properties</Link>
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <AlertCircle size={48} style={{ color: 'var(--color-danger)', margin: '0 auto var(--space-4)' }} />
                    <h3 style={{ color: 'var(--color-danger)' }}>Property Not Found</h3>
                    <p className="text-muted mt-2">{error || "Property not found."}</p>
                </div>
            </div>
        );
    }

    const primaryImage = property.images?.[activeImage]?.url;
    const isOwner = property.landlordId === parseInt(session?.user?.id);

    return (
        <div className={`fade-in ${styles.container}`}>
            <Link href="/landlord/properties" className="btn btn-text mb-6">
                <ArrowLeft size={16} /> Back to My Properties
            </Link>

            <div className={styles.hero}>
                {primaryImage ? (
                    <img src={primaryImage} className={styles.heroImage} alt={property.title} />
                ) : (
                    <div className={styles.heroImage} style={{ background: 'var(--color-gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HomeIcon size={80} style={{ opacity: 0.1 }} />
                    </div>
                )}
                <div className={styles.heroOverlay}>
                    <div className={styles.titleArea}>
                        <h1>{property.title}</h1>
                        <div className={styles.meta}>
                            <span><MapPin size={20} /> {property.area?.name}, {property.city?.name}</span>
                            <span><HomeIcon size={20} /> {formatType(property.type)}</span>
                            {property.verificationStatus === 'VERIFIED' && (
                                <span className={styles.badgePremium}><CheckCircle size={16} /> Verified Renta Listing</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.content}>
                    {property.images?.length > 1 && (
                        <div className={styles.gallery}>
                            {property.images.map((img, i) => (
                                <img
                                    key={img.id}
                                    src={img.url}
                                    className={`${styles.thumbnail} ${i === activeImage ? styles.active : ''}`}
                                    onClick={() => setActiveImage(i)}
                                    alt="Property thumbnail"
                                />
                            ))}
                        </div>
                    )}

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}><Info size={24} className="text-primary" /> Property Description</h3>
                        <p className={styles.description}>{property.description}</p>
                    </div>

                    {property.amenities && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}><ShieldCheck size={24} className="text-primary" /> Facilities</h3>
                            <div className={styles.amenitiesGrid}>
                                {(typeof property.amenities === 'string' ? JSON.parse(property.amenities) : property.amenities).map((amenity, i) => (
                                    <div key={i} className={styles.amenityItem}>
                                        <CheckCircle size={16} className="text-success" /> {amenity}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.sidebar}>
                    <div className={styles.paymentCard}>
                        <div className={styles.priceTag}>
                            <div className={styles.priceDisplay}>₦{Number(property.rentPrice).toLocaleString()} <sub>/yr</sub></div>
                            <div className="text-muted text-sm mt-2">Current Listing Price</div>
                        </div>

                        {property.breakdown && (
                            <ul className={styles.breakdown}>
                                <li className={styles.breakdownItem}>
                                    <span>Annual Rent</span>
                                    <span>₦{Number(property.breakdown.rent).toLocaleString()}</span>
                                </li>
                                <li className={styles.breakdownItem}>
                                    <span>Renta Service Fee (10%)</span>
                                    <span>₦{Number(property.breakdown.serviceFee).toLocaleString()}</span>
                                </li>
                                <li className={`${styles.breakdownItem} ${styles.totalRow}`}>
                                    <span>Total Tenant Pays</span>
                                    <span>₦{Number(property.breakdown.total).toLocaleString()}</span>
                                </li>
                            </ul>
                        )}

                        {isOwner ? (
                            <div className="mt-8 flex flex-col gap-4">
                                <Link href={`/landlord/properties/${property.id}/edit`} className="btn btn-primary btn-lg sidebarAction" style={{ height: '64px' }}>
                                    <Edit size={20} className="mr-2" /> Edit Property Details
                                </Link>

                                {!property.isFeatured && property.status === 'VERIFIED' && (
                                    <button className="btn btn-outline btn-lg sidebarAction" style={{ height: '64px', borderColor: 'var(--color-warning)', color: 'var(--color-black)' }}>
                                        <Zap size={20} className="mr-2 text-warning" /> Promote to Premium
                                    </button>
                                )}

                                <div className="p-4 bg-gray-50 rounded-xl mt-4 border border-gray-100 text-xs text-muted">
                                    <Info size={14} className="inline mr-1" /> This is your property listing. You can update images or details from the edit page.
                                </div>
                            </div>
                        ) : (
                            <div className="mt-8 p-6 bg-gray-100 rounded-2xl text-center">
                                <AlertCircle size={32} className="mx-auto mb-4 text-muted" />
                                <p className="text-sm font-medium">Viewing as Landlord</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
