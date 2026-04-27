'use client';
import SwipeCardStack from '@/app/components/ui/SwipeCardStack/SwipeCardStack';
import styles from './page.module.css';

export default function JobSwipes({ jobs, loading, onRefresh, refreshesLeft }) {
  return (
    <div className={styles.wrapper}>
      <SwipeCardStack jobs={jobs} loading={loading} onRefresh={onRefresh} refreshesLeft={refreshesLeft} />
    </div>
  );
}
