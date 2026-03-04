'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/app/page.module.css';

export default function LandingHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className={styles.nav}>
            <div className={`container ${styles.navInner}`}>
                <Link href="/" className={styles.logo}>
                    Renta
                </Link>

                <div className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksMobile : ''}`}>
                    <Link href="/register" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Browse Listings</Link>
                    <Link href="/login" className={`btn btn-outline ${styles.navBtn}`} onClick={() => setIsMenuOpen(false)}>Log In</Link>
                    <Link href="/register" className={`btn btn-primary ${styles.navBtn}`} onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                </div>

                <button
                    className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
}
