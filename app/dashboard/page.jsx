'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import styles from './dashboard.module.css';
import GlassBubbleNav from '@/app/components/ui/GlassBubbleNav/GlassBubbleNav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup, faBriefcase, faFile, faFileLines,
  faUser, faGear,
} from '@fortawesome/free-solid-svg-icons';
import { GetNewJobs } from '../Services/JobService';
import { useSwipeFlush } from '../hooks/useSwipeFlush';
import { GetLikedJobs } from '../Services/JobService';
import { useSwipesStore } from '../stores/swipeStore';
import JobSwipes from './jobswipes/page';
import JobMatches from './jobmatches/page';
import ResumeAnalyzer from './resumeAnalyzer/page';
import ProfilePage from './profile/page';

const sidebarItems = [
  { label: 'Swipe Jobs',   icon: <FontAwesomeIcon icon={faLayerGroup} style={{ width: 16, height: 16 }} /> },
  { label: 'Job Matches',  icon: <FontAwesomeIcon icon={faBriefcase}  style={{ width: 16, height: 16 }} /> },
  { label: 'Applications', icon: <FontAwesomeIcon icon={faFile}       style={{ width: 16, height: 16 }} /> },
  { label: 'Resume Analyzer', icon: <FontAwesomeIcon icon={faFileLines}  style={{ width: 16, height: 16 }} /> },
];

const settingsItems = [
  { label: 'Profile',  icon: <FontAwesomeIcon icon={faUser} style={{ width: 16, height: 16 }} /> },
  { label: 'Settings', icon: <FontAwesomeIcon icon={faGear} style={{ width: 16, height: 16 }} /> },
];

const contentTabs = [
  { label: 'All Jobs' },
  { label: 'Best Match' },
  { label: 'Recent' },
];

const pageMap        = ['Swipe Jobs', 'Job Matches', 'Applications', 'Resume Analyzer'];
const settingsMap    = ['Profile', 'Settings'];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [activePage, setActivePage] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('main');
  const [mainIndex, setMainIndex] = useState(0);
  const [settingsIndex, setSettingsIndex] = useState(-1);
  const [jobList, setJobList] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  const { flushQueue } = useSwipeFlush(session?.accessToken);
  const hydrateLiked   = useSwipesStore(s => s.hydrateLiked);


  useEffect(() => {
    if (session?.error){
      flushQueue().then(() =>signOut({ callbackUrl: '/login' }));
    }
  }, [session?.error]);

  useEffect(() => {
    if (!session?.accessToken) return;

    flushQueue();

    GetLikedJobs(session.accessToken).then(jobs => hydrateLiked(jobs));
    
    getJobListing();
  }, [session?.accessToken]);

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

  const getJobListing = async () => {
    setJobsLoading(true);
    try{
      const jobs = await GetNewJobs(session.accessToken);
      setJobList(jobs);
    }catch(error){
      console.error(error);
    } finally{
      setJobsLoading(false);
    }
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
            <h1 className={styles.pageTitle}>
              {activeSection === 'settings' ? settingsMap[settingsIndex] : pageMap[activePage]}
            </h1>
          </div>
          <div className={styles.topBarRight}>
            <div className={styles.avatar}>DP</div>
          </div>
        </div>

        {/* Horizontal tab bar — Job Matches section */}
        {mainIndex === 1 && (
          <div className={styles.tabBarWrapper}>
            <GlassBubbleNav
              items={contentTabs}
              defaultIndex={0}
              orientation="horizontal"
              onChange={(i) => setActiveTab(i)}
            />
          </div>
        )}

        {/* Swipe Jobs section */}
        {mainIndex === 0 && (
          <JobSwipes jobs={jobList} loading={jobsLoading} onRefresh={getJobListing} />
        )}

        {/* Job Matches section */}
        {mainIndex === 1 && (
          <div className={styles.swipeArea}>
            <JobMatches accessToken={session.accessToken} />
          </div>
        )}

        {/* Resume Builder section */}
        {mainIndex === 3 && (
          <div className={styles.swipeArea}>
            <ResumeAnalyzer />
          </div>
        )}

        {/* Profile section */}
        {activeSection === 'settings' && settingsIndex === 0 && (
          <div className={styles.swipeArea}>
            <ProfilePage />
          </div>
        )}

      </main>
    </div>
  );
}
