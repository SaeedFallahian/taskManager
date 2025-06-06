"use client"; // اضافه کردن این خط

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../styles/sidebar.module.css';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <nav>
        <ul className={styles.navList}>
          <li>
            <Link
              href="/dashboard"
              className={`${styles.navLink} ${pathname === '/dashboard' ? styles.active : ''}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/projects"
              className={`${styles.navLink} ${pathname === '/projects' ? styles.active : ''}`}
            >
              Projects
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;