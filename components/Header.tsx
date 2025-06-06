"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import AuthButtons from './AuthButtons';
import styles from '../styles/header.module.css';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <nav className={styles.nav}>
        <div className={styles.logoContainer}>
          <Image src="/logo.png" alt="Task Manager Logo" width={40} height={40} />
          <h1 className={styles.logoText}>Task Manager</h1>
        </div>

        {/* Desktop Menu */}
        <div className={styles.desktopMenu}>
          <ul className={styles.navList}>
            <li>
              <Link href="/dashboard" className={styles.navLink}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/projects" className={styles.navLink}>
                Projects
              </Link>
            </li>
          </ul>
          <AuthButtons />
        </div>

        {/* Mobile Menu Button */}
        <button className={styles.mobileMenuButton} onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.active : ''}`}>
        <div className={styles.mobileMenuContent}>
          <ul className={styles.navList}>
            <li>
              <Link href="/dashboard" className={styles.navLink} onClick={toggleMenu}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/projects" className={styles.navLink} onClick={toggleMenu}>
                Projects
              </Link>
            </li>
          </ul>
          <AuthButtons />
        </div>
      </div>
    </header>
  );
};

export default Header;