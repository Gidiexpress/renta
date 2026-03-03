import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Home as HomeIcon, CheckCircle } from 'lucide-react';
import styles from '@/app/(dashboard)/tenant/listing/[id]/listing.module.css';

// 1. Generate SEO Metadata for social sharing (Twitter, WhatsApp, etc.)
export async function generateMetadata({ params }) {
    const property = await prisma.property.findUnique({
        where: { id: parseInt(params.id) },
        include: { images: true }
    });

    if (!property) return { title: 'Property Not Found - Renta' };

    const formattedType = property.type.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    const title = `${formattedType} in ${property.area}, ${property.city} | Renta`;
    const description = property.description.substring(0, 160) + '...';

    // Choose the primary image or a fallback
    const primaryImage = property.images.find(img => img.isPrimary)?.url || property.images[0]?.url || '/placeholder.jpg';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://renta-app.com/listing/${property.id}`,
            images: [
                {
                    url: primaryImage,
                    width: 800,
                    height: 600,
                    alt: property.title,
                }
            ],
            type: 'article',
        }
    };
}

// 2. Render a fast server component preview
export default async function PublicListingPage({ params }) {
    const property = await prisma.property.findUnique({
        where: { id: parseInt(params.id) },
        include: { images: true }
    });

    if (!property) notFound();

    const formattedType = property.type.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    const primaryImage = property.images.find(img => img.isPrimary)?.url || property.images[0]?.url;

    return (
        <div className={`container ${styles.container}`} style={{ marginTop: '80px', marginBottom: '80px' }}>
            <div className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>{property.title}</h1>
                    <div className={styles.meta}>
                        <span className="flex items-center gap-1"><MapPin size={16} /> {property.area}</span>
                        <span className="flex items-center gap-1"><HomeIcon size={16} /> {formattedType}</span>
                        {property.verificationStatus === 'VERIFIED' && (
                            <span className="badge badge-verified"><CheckCircle size={14} /> Verified</span>
                        )}
                        <span className="badge badge-info">{property.status}</span>
                    </div>
                </div>

                <div className={styles.priceArea}>
                    <div className={styles.price}>
                        ₦{Number(property.rentPrice).toLocaleString()} <sub>/yr</sub>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.content}>
                    {/* Image Area - Static Server Render */}
                    <div className={styles.images}>
                        {primaryImage ? (
                            <img
                                src={primaryImage}
                                className={styles.mainImage}
                                alt={property.title}
                            />
                        ) : (
                            <div className={styles.mainImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <HomeIcon size={64} style={{ opacity: 0.2 }} />
                            </div>
                        )}
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>About This Property</h3>
                        <p>{property.description}</p>
                    </div>
                </div>

                {/* Public Call To Action Sidebar */}
                <div className={styles.sidebar}>
                    <div className="card shadow-md">
                        <h3 className="text-xl mb-4 font-bold">Interested in this property?</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Sign up to view all images, book a free inspection, and pay securely via Renta's Escrow.
                        </p>
                        <Link href="/register" className="btn btn-primary btn-full btn-lg mb-3">
                            Create Free Account
                        </Link>
                        <Link href="/login" className="btn btn-outline btn-full">
                            Log In
                        </Link>
                        <p className="text-xs text-center text-gray-500 mt-4">
                            You won't be charged anything to view or inspect the apartment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
