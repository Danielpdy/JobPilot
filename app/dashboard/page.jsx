'use client';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import styles from './dashboard.module.css';
import GlassBubbleNav from '@/app/components/ui/GlassBubbleNav/GlassBubbleNav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup, faBriefcase, faFileLines,
  faUser, faGear,
} from '@fortawesome/free-solid-svg-icons';
import { GetNewJobs, GetLikedJobs } from '../Services/JobService';
import { GetJobRefreshesLeft } from '../Services/UserService';
import { useSwipeFlush } from '../hooks/useSwipeFlush';
import { useSwipesStore } from '../stores/swipeStore';
import JobSwipes from './jobswipes/page';
import JobMatches from './jobmatches/page';
import ResumeAnalyzer from './resumeAnalyzer/page';
import ProfilePage from './profile/page';
import SettingsPage from './settings/page';

const sidebarItems = [
  { label: 'Swipe Jobs',   icon: <FontAwesomeIcon icon={faLayerGroup} style={{ width: 16, height: 16 }} /> },
  { label: 'Job Matches',  icon: <FontAwesomeIcon icon={faBriefcase}  style={{ width: 16, height: 16 }} /> },
  { label: 'Resume Analyzer', icon: <FontAwesomeIcon icon={faFileLines}  style={{ width: 16, height: 16 }} /> },
];

const settingsItems = [
  { label: 'Profile',  icon: <FontAwesomeIcon icon={faUser} style={{ width: 16, height: 16 }} /> },
  { label: 'Settings', icon: <FontAwesomeIcon icon={faGear} style={{ width: 16, height: 16 }} /> },
];


const pageMap        = ['Swipe Jobs', 'Job Matches', 'Resume Analyzer'];
const settingsMap    = ['Profile', 'Settings'];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [activePage, setActivePage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('main');
  const [mainIndex, setMainIndex] = useState(0);
  const [settingsIndex, setSettingsIndex] = useState(-1);
  const [jobList, setJobList] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [refreshesLeft, setRefreshesLeft] = useState(null);

  const { flushQueue } = useSwipeFlush(session?.accessToken);
  const hydrateLiked   = useSwipesStore(s => s.hydrateLiked);
  const prevMainIndex  = useRef(mainIndex);


  useEffect(() => {
    if (session?.error){
      flushQueue().then(() =>signOut({ callbackUrl: '/login' }));
    }
  }, [session?.error]);

  useEffect(() => {
    if (!session?.accessToken) return;

    flushQueue();

    GetLikedJobs(session.accessToken).then(jobs => hydrateLiked(jobs));
    GetJobRefreshesLeft(session.accessToken).then(data => setRefreshesLeft(data.refreshesLeft)).catch(() => {});

    getJobListing();
  }, [session?.accessToken]);

  useEffect(() => {
    const prev = prevMainIndex.current;
    prevMainIndex.current = mainIndex;
    if (mainIndex === 0 && prev !== 0 && session?.accessToken) {
      GetNewJobs(session.accessToken, false)
        .then(jobs => setJobList(jobs))
        .catch(console.error);
    }
  }, [mainIndex]);

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

  const getJobListing = async (forceRefresh = false) => {
    setJobsLoading(true);
    try{
      const jobs = await GetNewJobs(session.accessToken, forceRefresh);
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
        </div>


        {/* Swipe Jobs section */}
        {mainIndex === 0 && (
          <JobSwipes jobs={jobList} loading={jobsLoading} onRefresh={() => getJobListing(true)} refreshesLeft={refreshesLeft} />
        )}

        {/* Job Matches section */}
        {mainIndex === 1 && (
          <div className={styles.swipeArea}>
            <JobMatches accessToken={session.accessToken} />
          </div>
        )}

        {/* Resume Builder section */}
        {mainIndex === 2 && (
          <div className={styles.swipeArea}>
            <ResumeAnalyzer />
          </div>
        )}

        {/* Profile section */}
        {activeSection === 'settings' && settingsIndex === 0 && (
          <div className={styles.swipeArea}>
            <ProfilePage refreshesLeft={refreshesLeft} />
          </div>
        )}

        {/* Settings section */}
        {activeSection === 'settings' && settingsIndex === 1 && (
          <div className={styles.swipeArea}>
            <SettingsPage />
          </div>
        )}

      </main>
    </div>
  );
}
