import { redirect } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  // برای تست UI، مستقیم به داشبورد ریدایرکت می‌کنیم
  redirect('/dashboard');

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Task Manager</h1>
      <p className={styles.description}>
        Manage your projects and tasks efficiently.
      </p>
    </div>
  );
}