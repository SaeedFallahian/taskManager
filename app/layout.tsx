import './globals.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from './layout.module.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'Task Manager',
  description: 'A simple task management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>

    <html lang="en">
      <body>
        <div className={styles.container}>
          <Header />
          <Sidebar />
          <main className={styles.main}>{children}</main>
        </div>
      </body>
    </html>
    </ClerkProvider>
  );
}