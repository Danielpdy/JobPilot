'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Pencil, Briefcase, Tag, FileText, ExternalLink,
  Clock, BarChart2, Activity, RefreshCw, Mail,
} from 'lucide-react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { getResume, getAnalysis, existResume, getLastAnalysisDate } from '@/app/Services/ResumeService';
import { GetUserProfile, GetAnalysesUsed, GetJobRefreshesLeft } from '@/app/Services/UserService';
import styles from './page.module.css';

// ── Animation variants ────────────────────────────────────────────────────────
const groupVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

function Initials({ name }) {
  const letter = (name ?? '?').trim()[0] ?? '?';
  return <div className={styles.avatar}>{letter.toUpperCase()}</div>;
}

/* Skeleton cards */

function UserHeaderSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.userRow}>
        <Skeleton circle width={64} height={64} />
        <div className={styles.userInfo}>
          <Skeleton width={160} height={20} borderRadius={6} />
          <Skeleton width={110} height={14} borderRadius={6} style={{ marginTop: 6 }} />
          <Skeleton width={180} height={13} borderRadius={6} style={{ marginTop: 8 }} />
        </div>
        <Skeleton width={110} height={36} borderRadius={10} />
      </div>
    </div>
  );
}

function CareerInfoSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.sectionHeader}>
        <Skeleton circle width={18} height={18} />
        <Skeleton width={140} height={16} borderRadius={6} />
      </div>
      <div className={styles.grid2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.infoCell}>
            <Skeleton width={80} height={11} borderRadius={4} style={{ marginBottom: 6 }} />
            <Skeleton width={100} height={15} borderRadius={4} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.sectionHeader}>
        <Skeleton circle width={18} height={18} />
        <Skeleton width={110} height={16} borderRadius={6} />
      </div>
      <div className={styles.chips}>
        {[72, 90, 60, 80, 68].map((w, i) => (
          <Skeleton key={i} width={w} height={28} borderRadius={20} />
        ))}
      </div>
    </div>
  );
}

function ResumeContextSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.sectionHeader}>
        <Skeleton circle width={18} height={18} />
        <Skeleton width={130} height={16} borderRadius={6} />
      </div>
      <div className={styles.resumeRow}>
        <Skeleton width={44} height={44} borderRadius={10} />
        <div className={styles.resumeInfo}>
          <Skeleton width={160} height={15} borderRadius={4} />
          <Skeleton width={120} height={12} borderRadius={4} style={{ marginTop: 6, marginBottom: 8 }} />
          <Skeleton width="100%" height={5} borderRadius={3} />
        </div>
        <Skeleton width={64} height={32} borderRadius={8} />
      </div>
    </div>
  );
}

function ResumeScorecardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.sectionHeader}>
        <Skeleton circle width={18} height={18} />
        <Skeleton width={110} height={16} borderRadius={6} />
      </div>
      <div className={styles.statRow}>
        <Skeleton width={80} height={14} borderRadius={4} />
        <Skeleton width={40} height={22} borderRadius={6} />
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.sectionHeader}>
        <Skeleton circle width={18} height={18} />
        <Skeleton width={70} height={16} borderRadius={6} />
      </div>
      <div className={styles.activityList}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.activityItem}>
            <Skeleton circle width={34} height={34} />
            <div>
              <Skeleton width={90} height={12} borderRadius={4} style={{ marginBottom: 5 }} />
              <Skeleton width={120} height={14} borderRadius={4} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Page */

export default function ProfilePage() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [profile, setProfile] = useState(null);
  const [resume, setResume] = useState(null);
  const [score, setScore] = useState(null);
  const [hasResume, setHasResume] = useState(false);
  const [analysesLeft, setAnalysesLeft] = useState(null);
  const [refreshesLeft, setRefreshesLeft] = useState(null);
  const [lastAnalysisDate, setLastAnalysisDate] = useState(null);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingResume, etLoadingResume] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    if (!token) return;

    GetUserProfile(token)
      .then(data => setProfile(data))
      .catch(err => console.error(err))
      .finally(() => setLoadingProfile(false));

    Promise.all([
      GetAnalysesUsed(token).then(data => setAnalysesLeft(data.resumeAnalyses)).catch(() => {}),
      GetJobRefreshesLeft(token).then(data => setRefreshesLeft(data.refreshesLeft)).catch(() => {}),
      getLastAnalysisDate(token).then(data => setLastAnalysisDate(data.lastAnalysisDate)).catch(() => {}),
    ]).finally(() => setLoadingActivity(false));

    existResume(token)
      .then(() => {
        setHasResume(true);
        return Promise.all([getResume(token), getAnalysis(token)]);
      })
      .then(([resumeData, analysisData]) => {
        setResume({ fileName: resumeData.fileName, fileSize: resumeData.fileSize });
        setScore(analysisData.resumeScore ?? null);
      })
      .catch(() => {})
      .finally(() => setLoadingResume(false));
  }, [token]);

  const fullName   = profile ? `${profile.userFirstName} ${profile.userLastName}` : '—';
  const scoreColor = score === null ? '#D1D5DB'
    : score >= 80 ? '#22c55e'
    : score >= 60 ? '#0992C2'
    : '#ef4444';

  return (
    <SkeletonTheme baseColor="#F3F4F6" highlightColor="#E5E7EB">
      <div className={styles.page}>

        {/* ── Left column ──────────────────────────────────────── */}
        <div className={styles.left}>

          {/* Profile group: header + career + skills stagger together */}
          {loadingProfile ? (
            <>
              <UserHeaderSkeleton />
              <CareerInfoSkeleton />
              <SkillsSkeleton />
            </>
          ) : (
            <motion.div
              variants={groupVariants}
              initial="hidden"
              animate="visible"
              style={{ display: 'contents' }}
            >
              {/* User header */}
              <motion.div variants={cardVariants} className={styles.card}>
                <div className={styles.userRow}>
                  <Initials name={fullName} />
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>{fullName}</p>
                    <p className={styles.userTitle}>{profile?.userJobTitle ?? '—'}</p>
                    <div className={styles.userMeta}>
                      <span className={styles.userMetaItem}>
                        <Mail className={styles.userMetaIcon} />{profile?.userEmail ?? '—'}
                      </span>
                    </div>
                  </div>
                  <button className={styles.editBtn}>
                    <Pencil className={styles.editIcon} />
                    Edit Profile
                  </button>
                </div>
              </motion.div>

              {/* Career Information */}
              <motion.div variants={cardVariants} className={styles.card}>
                <div className={styles.sectionHeader}>
                  <Briefcase className={styles.sectionIcon} />
                  <h2 className={styles.sectionTitle}>Career Information</h2>
                </div>
                <div className={styles.grid2}>
                  <div className={styles.infoCell}>
                    <p className={styles.infoCellLabel}>JOB TITLE</p>
                    <p className={styles.infoCellValue}>{profile?.userJobTitle ?? '—'}</p>
                  </div>
                  <div className={styles.infoCell}>
                    <p className={styles.infoCellLabel}>EXPERIENCE LEVEL</p>
                    <p className={styles.infoCellValue}>{profile?.userExperienceLevel ?? '—'}</p>
                  </div>
                  <div className={styles.infoCell}>
                    <p className={styles.infoCellLabel}>WORK TYPE</p>
                    <p className={styles.infoCellValue}>{profile?.userWorkType ?? '—'}</p>
                  </div>
                  <div className={styles.infoCell}>
                    <p className={styles.infoCellLabel}>SALARY RANGE</p>
                    <p className={styles.infoCellValue}>{profile?.userSalaryRange ?? '—'}</p>
                  </div>
                </div>
              </motion.div>

              {/* Skills & Tags */}
              <motion.div variants={cardVariants} className={styles.card}>
                <div className={styles.sectionHeader}>
                  <Tag className={styles.sectionIcon} />
                  <h2 className={styles.sectionTitle}>Skills &amp; Tags</h2>
                  <button className={styles.addSkillBtn}>
                    <span className={styles.addSkillPlus}>+</span> Add Skill
                  </button>
                </div>
                <div className={styles.chips}>
                  {(profile?.userSkills ?? []).map(s => (
                    <span key={s} className={styles.chip}>{s}</span>
                  ))}
                  {!profile?.userSkills?.length && (
                    <p className={styles.noResume}>No skills added yet.</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Resume Context */}
          {loadingResume ? <ResumeContextSkeleton /> : (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className={styles.card}
            >
              <div className={styles.sectionHeader}>
                <FileText className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Resume Context</h2>
              </div>
              {hasResume && resume ? (
                <div className={styles.resumeRow}>
                  <div className={styles.resumeIconWrap}>
                    <FileText className={styles.resumeFileIcon} />
                  </div>
                  <div className={styles.resumeInfo}>
                    <p className={styles.resumeName}>{resume.fileName}</p>
                    {score !== null && (
                      <p className={styles.resumeSub}>
                        Last analyzed · Score&nbsp;
                        <strong style={{ color: scoreColor }}>{score}/100</strong>
                      </p>
                    )}
                    <div className={styles.scoreBarTrack}>
                      <div
                        className={styles.scoreBarFill}
                        style={{ width: `${score ?? 0}%`, background: scoreColor }}
                      />
                    </div>
                  </div>
                  <button className={styles.viewBtn}>
                    View <ExternalLink className={styles.viewIcon} />
                  </button>
                </div>
              ) : (
                <p className={styles.noResume}>No resume uploaded yet.</p>
              )}
            </motion.div>
          )}

        </div>

        {/* ── Right column ─────────────────────────────────────── */}
        <div className={styles.right}>

          {/* Resume Score */}
          {loadingResume ? <ResumeScorecardSkeleton /> : (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className={styles.card}
            >
              <div className={styles.sectionHeader}>
                <BarChart2 className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Resume Score</h2>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Latest score</span>
                <span className={styles.statValue} style={{ color: scoreColor }}>
                  {score !== null ? score : '—'}
                </span>
              </div>
            </motion.div>
          )}

          {/* Activity */}
          {loadingActivity ? <ActivitySkeleton /> : (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className={styles.card}
            >
              <div className={styles.sectionHeader}>
                <Activity className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Activity</h2>
              </div>
              <div className={styles.activityList}>
                {[
                  { Icon: Clock,     label: 'Last analysis',        value: lastAnalysisDate ?? '—' },
                  { Icon: FileText,  label: 'Resume analyses left',  value: analysesLeft !== null ? `${analysesLeft}` : '—' },
                  { Icon: RefreshCw, label: 'Job refreshes left',    value: refreshesLeft !== null ? `${refreshesLeft}` : '—' },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className={styles.activityItem}>
                    <div className={styles.activityIconWrap}>
                      <Icon className={styles.activityIcon} />
                    </div>
                    <div>
                      <p className={styles.activityLabel}>{label}</p>
                      <p className={styles.activityValue}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </SkeletonTheme>
  );
}
