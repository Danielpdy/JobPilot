'use client';
import { useState } from 'react';
import styles from './dashboard.module.css';
import GlassBubbleNav from '@/app/components/ui/GlassBubbleNav/GlassBubbleNav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faBriefcase, faFile, faHeart, faFileLines,
  faUser, faGear,
} from '@fortawesome/free-solid-svg-icons';

const sidebarItems = [
  { label: 'Overview',     icon: <FontAwesomeIcon icon={faHouse}      style={{ width: 16, height: 16 }} /> },
  { label: 'Job Matches',  icon: <FontAwesomeIcon icon={faBriefcase}  style={{ width: 16, height: 16 }} />, badge: '12' },
  { label: 'Applications', icon: <FontAwesomeIcon icon={faFile}       style={{ width: 16, height: 16 }} /> },
  { label: 'Saved Jobs',   icon: <FontAwesomeIcon icon={faHeart}      style={{ width: 16, height: 16 }} /> },
  { label: 'Resume',       icon: <FontAwesomeIcon icon={faFileLines}  style={{ width: 16, height: 16 }} /> },
];

const settingsItems = [
  { label: 'Profile',  icon: <FontAwesomeIcon icon={faUser} style={{ width: 16, height: 16 }} /> },
  { label: 'Settings', icon: <FontAwesomeIcon icon={faGear} style={{ width: 16, height: 16 }} /> },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Shared selection: which section ('main' | 'settings') and which index is active
  const [activeSection, setActiveSection] = useState('main');
  const [mainIndex, setMainIndex] = useState(0);
  const [settingsIndex, setSettingsIndex] = useState(-1);

  const handleMainNav = (i) => {
    setActiveSection('main');
    setMainIndex(i);
    setSettingsIndex(-1);
    setActivePage(i);
    setSidebarOpen(false);
  };

  const handleSettingsNav = (i) => {
    setActiveSection('settings');
    setSettingsIndex(i);
    setMainIndex(-1);
    setSidebarOpen(false);
  };

  return (
    <div className={styles.page}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <a href="/" className={styles.sidebarLogo}>
          <img src="/icons/JobPilot (2).png" alt="JobPilot" className={styles.sidebarLogoImg} />
        </a>

        {/* Main nav with glass bubble */}
        <div className={styles.sidebarSection}>
          <span className={styles.sectionLabel}>Main</span>
          <GlassBubbleNav
            items={sidebarItems}
            activeIndex={mainIndex}
            orientation="vertical"
            onChange={handleMainNav}
          />
        </div>

        {/* Settings nav with glass bubble */}
        <div className={styles.sidebarBottom}>
          <GlassBubbleNav
            items={settingsItems}
            activeIndex={settingsIndex}
            orientation="vertical"
            onChange={handleSettingsNav}
          />
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className={styles.main}>

        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button
              className={styles.menuBtn}
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle sidebar"
            >
              <span className={`${styles.menuLine} ${sidebarOpen ? styles.menuLine1Open : ''}`} />
              <span className={`${styles.menuLine} ${sidebarOpen ? styles.menuLine2Open : ''}`} />
              <span className={`${styles.menuLine} ${sidebarOpen ? styles.menuLine3Open : ''}`} />
            </button>
            <h1 className={styles.pageTitle}>{pageMap[activePage]}</h1>
          </div>
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
