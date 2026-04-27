'use client';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, Mail, ChevronRight, LogOut, Trash2 } from 'lucide-react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { GetUserProfile } from '@/app/Services/UserService';
import styles from './page.module.css';

const groupVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

function SettingsSkeleton() {
  return (
    <SkeletonTheme baseColor="#F3F4F6" highlightColor="#E5E7EB">
      <div className={styles.page}>

        {/* Account card skeleton */}
        <div className={styles.card}>
          <Skeleton width={72} height={11} borderRadius={4} style={{ marginBottom: 20 }} />
          <div className={styles.row}>
            <div className={styles.rowLeft}>
              <Skeleton width={40} height={15} borderRadius={4} />
              <Skeleton width={180} height={13} borderRadius={4} style={{ marginTop: 5 }} />
            </div>
            <div className={styles.rowRight}>
              <Skeleton circle width={17} height={17} />
              <Skeleton circle width={14} height={14} />
            </div>
          </div>
          <Skeleton width="100%" height={48} borderRadius={12} />
        </div>

        {/* Security card skeleton */}
        <div className={styles.card}>
          <Skeleton width={130} height={11} borderRadius={4} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={50} borderRadius={12} />
          <Skeleton width="100%" height={1} style={{ margin: '8px 0' }} />
          <Skeleton width="100%" height={50} borderRadius={12} />
        </div>

        <Skeleton width={80} height={12} borderRadius={4} style={{ display: 'block', margin: '8px auto 0' }} />
      </div>
    </SkeletonTheme>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState(null);

  useEffect(() => {
    if (!session?.accessToken) return;
    GetUserProfile(session.accessToken)
      .then(data => setEmail(data.userEmail))
      .catch(() => setEmail('—'));
  }, [session?.accessToken]);

  if (email === null) return <SettingsSkeleton />;

  return (
    <motion.div
      className={styles.page}
      variants={groupVariants}
      initial="hidden"
      animate="visible"
    >

      {/* ── Account card ─────────────────────────────────────── */}
      <motion.div variants={cardVariants} className={styles.card}>
        <p className={styles.sectionLabel}>Account</p>

        <div className={styles.row}>
          <div className={styles.rowLeft}>
            <span className={styles.rowLabel}>Email</span>
            <span className={styles.rowValue}>{email}</span>
          </div>
          <div className={styles.rowRight}>
            <Mail className={styles.rowIcon} />
            <ChevronRight className={styles.rowChevron} />
          </div>
        </div>

        <button className={styles.changePwBtn}>
          <KeyRound className={styles.changePwIcon} />
          Change password
        </button>
      </motion.div>

      {/* ── Account & security card ───────────────────────────── */}
      <motion.div variants={cardVariants} className={styles.card}>
        <p className={styles.sectionLabel}>Account &amp; Security</p>

        <button
          className={`${styles.actionRow} ${styles.logoutRow}`}
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className={styles.actionIcon} />
          Log out
        </button>

        <hr className={styles.divider} />

        <button className={`${styles.actionRow} ${styles.deleteRow}`}>
          <Trash2 className={styles.actionIcon} />
          Delete account
        </button>
      </motion.div>

      <motion.p variants={cardVariants} className={styles.version}>Version 1.0.0</motion.p>

    </motion.div>
  );
}
