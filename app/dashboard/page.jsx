'use client';
import { useState } from 'react';
import styles from './dashboard.module.css';
import GlassBubbleNav from '@/app/components/ui/GlassBubbleNav/GlassBubbleNav';

/* ── Icons ────────────────────────────────────────────── */
const Icon = ({ d }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const sidebarItems = [
  { label: 'Overview',      icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { label: 'Job Matches',   icon: <Icon d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />, badge: '12' },
  { label: 'Applications',  icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
  { label: 'Saved Jobs',    icon: <Icon d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /> },
  { label: 'Resume',        icon: <Icon d="M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h5" /> },
];

const settingsItems = [
  { label: 'Profile',    icon: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> },
  { label: 'Settings',   icon: <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 8v4l3 3" /> },
];

const contentTabs = [
  { label: 'All Jobs' },
  { label: 'Best Match' },
  { label: 'Recent' },
  { label: 'Remote' },
];

const pageMap = ['Overview', 'Job Matches', 'Applications', 'Saved Jobs', 'Resume'];

export default function DashboardPage() {
  const [activePage, setActivePage] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={styles.page}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <a href="/" className={styles.sidebarLogo}>
          <div className={styles.logoIcon}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M5 17.5L19 6.5M19 6.5H9M19 6.5V16.5"
                stroke="white" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.logoText}>JobPilot</span>
        </a>

        {/* Main nav with glass bubble */}
        <div className={styles.sidebarSection}>
          <span className={styles.sectionLabel}>Main</span>
          <GlassBubbleNav
            items={sidebarItems}
            defaultIndex={0}
            orientation="vertical"
            onChange={(i) => setActivePage(i)}
          />
        </div>

        {/* Settings nav with glass bubble */}
        <div className={styles.sidebarBottom}>
          <GlassBubbleNav
            items={settingsItems}
            defaultIndex={-1}
            orientation="vertical"
            onChange={() => {}}
          />
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className={styles.main}>

        {/* Top bar */}
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>{pageMap[activePage]}</h1>
          <div className={styles.topBarRight}>
            <div className={styles.avatar}>DP</div>
          </div>
        </div>

        {/* Horizontal tab bar with glass bubble */}
        <div className={styles.tabBarWrapper}>
          <GlassBubbleNav
            items={contentTabs}
            defaultIndex={0}
            orientation="horizontal"
            onChange={(i) => setActiveTab(i)}
          />
        </div>

      </main>
    </div>
  );
}
